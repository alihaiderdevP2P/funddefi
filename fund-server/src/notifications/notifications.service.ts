import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import {
  Notification,
  type NotificationChannel,
  type NotificationType,
} from "./entities/notification.entity";
import { NotificationPreferences } from "./entities/notification-preferences.entity";
import {
  CreateNotificationDto,
  UpdateNotificationPreferencesDto,
} from "./dto/notification.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { User } from "../users/entities/user.entity";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(NotificationPreferences)
    private readonly prefsRepo: Repository<NotificationPreferences>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly config: ConfigService,
    @Inject(forwardRef(() => WebsocketGateway))
    private readonly websocketGateway: WebsocketGateway
  ) {}

  async getPreferences(userId: string) {
    const prefs = await this.ensurePreferences(userId);
    return this.toPrefsResponse(prefs);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto
  ) {
    // Prefer edge function when available so prefs stay in sync with Supabase
    const edge = await this.callEdgeFunction({
      action: "update_preferences",
      userId,
      emailNotifications: dto.emailNotifications,
      campaignUpdates: dto.campaignUpdates,
      fundingAlerts: dto.fundingAlerts,
      marketingEmails: dto.marketingEmails,
    });

    if (edge.ok) {
      return edge.data;
    }

    const prefs = await this.ensurePreferences(userId);
    if (typeof dto.emailNotifications === "boolean") {
      prefs.emailNotifications = dto.emailNotifications;
    }
    if (typeof dto.campaignUpdates === "boolean") {
      prefs.campaignUpdates = dto.campaignUpdates;
    }
    if (typeof dto.fundingAlerts === "boolean") {
      prefs.fundingAlerts = dto.fundingAlerts;
    }
    if (typeof dto.marketingEmails === "boolean") {
      prefs.marketingEmails = dto.marketingEmails;
    }
    await this.prefsRepo.save(prefs);
    return this.toPrefsResponse(prefs);
  }

  async list(userId: string, unreadOnly = false, limit = 50) {
    const edge = await this.callEdgeFunction({
      action: "list",
      userId,
      unreadOnly,
      limit,
    });

    if (edge.ok && edge.data?.notifications) {
      return {
        notifications: (edge.data.notifications as any[]).map((n) =>
          this.mapEdgeNotification(n)
        ),
        unreadCount: edge.data.unreadCount ?? 0,
      };
    }

    const where: { userId: string; isRead?: boolean } = { userId };
    if (unreadOnly) where.isRead = false;

    const notifications = await this.notificationsRepo.find({
      where,
      order: { createdAt: "DESC" },
      take: Math.min(limit, 100),
    });

    const unreadCount = await this.notificationsRepo.count({
      where: { userId, isRead: false },
    });

    return { notifications, unreadCount };
  }

  async markRead(userId: string, notificationId: string) {
    const edge = await this.callEdgeFunction({
      action: "mark_read",
      userId,
      notificationId,
    });

    if (edge.ok && edge.data?.notification) {
      return this.mapEdgeNotification(edge.data.notification);
    }

    const notification = await this.notificationsRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) {
      throw new NotFoundException("Notification not found");
    }
    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationsRepo.save(notification);
  }

  async markAllRead(userId: string) {
    const edge = await this.callEdgeFunction({
      action: "mark_all_read",
      userId,
    });

    if (edge.ok) {
      return { success: true };
    }

    await this.notificationsRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { success: true };
  }

  /**
   * Create notification (in-app / popup / email) via edge function with local fallback.
   */
  async create(dto: CreateNotificationDto) {
    const edge = await this.callEdgeFunction({
      action: "create",
      userId: dto.userId,
      type: dto.type || "system",
      title: dto.title,
      message: dto.message,
      data: dto.data || {},
      channel: dto.channel || "both",
      showPopup: dto.showPopup !== false,
    });

    if (edge.ok) {
      if (edge.data?.skipped) {
        this.logger.debug(
          `Notification skipped for ${dto.userId}: ${edge.data.reason}`
        );
        return { skipped: true, reason: edge.data.reason };
      }

      const notification = this.mapEdgeNotification(edge.data.notification);
      if (notification?.showPopup) {
        await this.emitPopup(notification);
      }
      return { skipped: false, notification, channels: edge.data.channels };
    }

    return this.createLocal(dto);
  }

  /** Funding received → creator gets funding_alert */
  async notifyFundingAlert(opts: {
    creatorId: string;
    campaignId: string;
    campaignTitle: string;
    amount: number | string;
    fundingId: string;
    backerName?: string;
  }) {
    const amount =
      typeof opts.amount === "number"
        ? opts.amount.toFixed(4)
        : String(opts.amount);

    return this.create({
      userId: opts.creatorId,
      type: "funding_alert",
      title: "New funding received",
      message: `${opts.backerName || "A backer"} funded ${amount} ETH on “${opts.campaignTitle}”.`,
      data: {
        campaignId: opts.campaignId,
        fundingId: opts.fundingId,
        amount: opts.amount,
        link: `/campaigns/${opts.campaignId}`,
      },
      channel: "both",
      showPopup: true,
    });
  }

  /** Campaign update → notify backers */
  async notifyCampaignUpdate(opts: {
    backerIds: string[];
    campaignId: string;
    campaignTitle: string;
    updateTitle: string;
    updateId: string;
  }) {
    const results = [];
    for (const userId of opts.backerIds) {
      results.push(
        await this.create({
          userId,
          type: "campaign_update",
          title: `Update: ${opts.campaignTitle}`,
          message: opts.updateTitle,
          data: {
            campaignId: opts.campaignId,
            updateId: opts.updateId,
            link: `/campaigns/${opts.campaignId}`,
          },
          channel: "both",
          showPopup: true,
        })
      );
    }
    return results;
  }

  /** Welcome / system popup after register */
  async notifyWelcome(userId: string, name: string) {
    return this.create({
      userId,
      type: "welcome",
      title: `Welcome to FundFlow, ${name}!`,
      message:
        "Your account is ready. Start a campaign or explore projects to back.",
      data: { link: "/campaigns" },
      channel: "both",
      showPopup: true,
    });
  }

  private async createLocal(dto: CreateNotificationDto) {
    const type: NotificationType = dto.type || "system";
    const channel: NotificationChannel = dto.channel || "both";
    const prefs = await this.ensurePreferences(dto.userId);

    if (!this.typeAllowed(type, prefs)) {
      return {
        skipped: true,
        reason: "User preferences disabled this notification",
      };
    }

    const wantEmail =
      channel !== "in_app" &&
      prefs.emailNotifications &&
      this.typeAllowed(type, prefs);
    const wantInApp = channel !== "email";

    if (!wantInApp && !wantEmail) {
      return {
        skipped: true,
        reason: "User preferences disabled this notification",
      };
    }

    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    let emailSent = false;
    let emailError: string | null = null;

    if (wantEmail) {
      // Email delivery is owned by the edge function (Resend). Local fallback records intent.
      emailError = "Email deferred — deploy notifications edge function + RESEND_API_KEY";
      this.logger.warn(
        `Email queued locally for ${user.email} (edge function unavailable)`
      );
    }

    const notification = await this.notificationsRepo.save(
      this.notificationsRepo.create({
        userId: dto.userId,
        type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
        channel: wantEmail && wantInApp ? "both" : wantEmail ? "email" : "in_app",
        showPopup: wantInApp && dto.showPopup !== false,
        emailSent,
        emailError,
        isRead: false,
      })
    );

    if (notification.showPopup) {
      await this.emitPopup(notification);
    }

    return {
      skipped: false,
      notification,
      channels: {
        inApp: wantInApp,
        popup: notification.showPopup,
        email: wantEmail,
        emailSent,
        emailError,
      },
    };
  }

  private async emitPopup(notification: Notification) {
    try {
      await this.websocketGateway.sendUserNotification(notification.userId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        showPopup: notification.showPopup,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      this.logger.warn(
        `Failed to emit popup for ${notification.id}: ${(err as Error).message}`
      );
    }
  }

  private async ensurePreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    let prefs = await this.prefsRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = await this.prefsRepo.save(
        this.prefsRepo.create({
          userId,
          emailNotifications: true,
          campaignUpdates: true,
          fundingAlerts: true,
          marketingEmails: false,
        })
      );
    }
    return prefs;
  }

  private typeAllowed(
    type: NotificationType,
    prefs: NotificationPreferences
  ): boolean {
    switch (type) {
      case "funding_alert":
        return prefs.fundingAlerts;
      case "campaign_update":
        return prefs.campaignUpdates;
      case "marketing":
        return prefs.marketingEmails;
      default:
        return true;
    }
  }

  private toPrefsResponse(prefs: NotificationPreferences) {
    return {
      emailNotifications: prefs.emailNotifications,
      campaignUpdates: prefs.campaignUpdates,
      fundingAlerts: prefs.fundingAlerts,
      marketingEmails: prefs.marketingEmails,
    };
  }

  private mapEdgeNotification(row: any): Notification {
    if (!row) return row;
    return {
      id: row.id,
      userId: row.user_id ?? row.userId,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data || {},
      channel: row.channel,
      showPopup: row.show_popup ?? row.showPopup ?? true,
      emailSent: row.email_sent ?? row.emailSent ?? false,
      emailError: row.email_error ?? row.emailError ?? null,
      isRead: row.is_read ?? row.isRead ?? false,
      readAt: row.read_at ?? row.readAt ?? null,
      createdAt: row.created_at ? new Date(row.created_at) : row.createdAt,
      updatedAt: row.updated_at ? new Date(row.updated_at) : row.updatedAt,
    } as Notification;
  }

  private async callEdgeFunction(
    body: Record<string, unknown>
  ): Promise<{ ok: true; data: any } | { ok: false; error: string }> {
    const baseUrl =
      this.config.get<string>("SUPABASE_URL") ||
      this.config.get<string>("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY");

    if (!baseUrl || !serviceKey) {
      return { ok: false, error: "Supabase not configured" };
    }

    const secret = this.config.get<string>("NOTIFY_SECRET");
    const url = `${baseUrl.replace(/\/$/, "")}/functions/v1/notifications`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": "application/json",
          ...(secret ? { "x-notify-secret": secret } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.logger.warn(
          `Edge function ${body.action} failed (${res.status}): ${data?.error || res.statusText}`
        );
        return { ok: false, error: data?.error || res.statusText };
      }

      return { ok: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Edge function unreachable: ${message}`);
      return { ok: false, error: message };
    }
  }
}
