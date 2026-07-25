import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, Between } from "typeorm";
import { User } from "../users/entities/user.entity";
import {
  Campaign,
  CampaignStatus,
} from "../campaigns/entities/campaign.entity";
import { Funding, FundingStatus } from "../funding/entities/funding.entity";
import {
  ModerationReport,
  ModerationReportStatus,
  ModerationSeverity,
} from "./entities/moderation-report.entity";
import { CampaignsService } from "../campaigns/campaigns.service";
import { CreateModerationReportDto } from "./dto/create-moderation-report.dto";
import { UpdateModerationDto } from "./dto/update-moderation.dto";
import { UpdateCampaignStatusDto } from "./dto/update-campaign-status.dto";
import { UpdateUserAdminDto } from "./dto/update-user-admin.dto";

const SUSPICIOUS_KEYWORDS = [
  "guaranteed",
  "risk-free",
  "double your",
  "get rich",
  "pyramid",
  "mlm",
  "1000% return",
  "crypto giveaway",
];

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(Funding)
    private fundingRepository: Repository<Funding>,
    @InjectRepository(ModerationReport)
    private moderationRepository: Repository<ModerationReport>,
    private campaignsService: CampaignsService
  ) {}

  async getPlatformStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const [
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      activeCampaigns,
      launchedToday,
      pendingApprovals,
      fundingStats,
      contractsCount,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({
        where: { createdAt: MoreThan(startOfMonth) },
      }),
      this.usersRepository.count({
        where: {
          createdAt: Between(startOfLastMonth, endOfLastMonth),
        },
      }),
      this.campaignsRepository.count({
        where: { status: CampaignStatus.ACTIVE },
      }),
      this.campaignsRepository.count({
        where: { createdAt: MoreThan(startOfToday) },
      }),
      this.campaignsRepository.count({
        where: { status: CampaignStatus.DRAFT },
      }),
      this.getFundingAggregates(),
      this.campaignsRepository
        .createQueryBuilder("c")
        .where("c.contract_address IS NOT NULL")
        .andWhere("c.contract_address != ''")
        .getCount(),
    ]);

    let flaggedCampaigns = 0;
    try {
      flaggedCampaigns = await this.moderationRepository.count({
        where: { status: ModerationReportStatus.OPEN },
      });
    } catch {
      flaggedCampaigns = 0;
    }

    const userGrowthPercent =
      usersLastMonth > 0
        ? Math.round(
            ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
          )
        : usersThisMonth > 0
          ? 100
          : 0;

    const platformFees = fundingStats.totalAmount * 0.05;

    return {
      totalUsers,
      activeCampaigns,
      totalFunding: fundingStats.totalAmount,
      platformFees,
      pendingApprovals,
      flaggedCampaigns,
      userGrowthPercent,
      launchedToday,
      totalFundings: fundingStats.totalFundings,
      totalBackers: fundingStats.totalBackers,
      activeSmartContracts: contractsCount,
    };
  }

  async getRecentActivity(limit = 20) {
    const [recentCampaigns, recentUsers, recentFundings] = await Promise.all([
      this.campaignsRepository.find({
        relations: ["creator"],
        order: { updatedAt: "DESC" },
        take: limit,
      }),
      this.usersRepository.find({
        order: { createdAt: "DESC" },
        take: limit,
      }),
      this.fundingRepository.find({
        where: { status: FundingStatus.CONFIRMED },
        relations: ["campaign", "user"],
        order: { createdAt: "DESC" },
        take: limit,
      }),
    ]);

    let recentReports: ModerationReport[] = [];
    try {
      recentReports = await this.moderationRepository.find({
        order: { createdAt: "DESC" },
        take: limit,
      });
    } catch {
      recentReports = [];
    }

    type ActivityItem = {
      id: string;
      action: string;
      details: string;
      timestamp: string;
      type: string;
    };

    const activities: ActivityItem[] = [];

    for (const c of recentCampaigns) {
      const action =
        c.status === CampaignStatus.DRAFT
          ? "Campaign submitted for review"
          : c.status === CampaignStatus.ACTIVE
            ? "Campaign approved / active"
            : c.status === CampaignStatus.FUNDED
              ? "Campaign reached funding goal"
              : `Campaign status: ${c.status}`;
      activities.push({
        id: `campaign-${c.id}`,
        action,
        details: c.title,
        timestamp: (c.updatedAt || c.createdAt).toISOString(),
        type: "campaign",
      });
    }

    for (const u of recentUsers) {
      activities.push({
        id: `user-${u.id}`,
        action: "New user registered",
        details: u.email,
        timestamp: u.createdAt.toISOString(),
        type: "user",
      });
    }

    for (const f of recentFundings) {
      activities.push({
        id: `funding-${f.id}`,
        action: "New backing confirmed",
        details: `${f.campaign?.title || "Campaign"} — ${f.amount} ETH`,
        timestamp: f.createdAt.toISOString(),
        type: "funding",
      });
    }

    for (const r of recentReports) {
      activities.push({
        id: `report-${r.id}`,
        action: "Content flagged for moderation",
        details: r.campaignTitle,
        timestamp: r.createdAt.toISOString(),
        type: "moderation",
      });
    }

    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, limit);
  }

  async getSystemHealth() {
    const start = Date.now();
    let dbOk = true;
    try {
      await this.usersRepository.count();
    } catch {
      dbOk = false;
    }
    const responseMs = Date.now() - start;

    const [totalFundings, confirmedFundings] = await Promise.all([
      this.fundingRepository.count(),
      this.fundingRepository.count({
        where: { status: FundingStatus.CONFIRMED },
      }),
    ]);

    const transactionSuccessRate =
      totalFundings > 0
        ? Math.round((confirmedFundings / totalFundings) * 1000) / 10
        : 100;

    const contractsCount = await this.campaignsRepository
      .createQueryBuilder("c")
      .where("c.contract_address IS NOT NULL")
      .andWhere("c.contract_address != ''")
      .getCount();

    return {
      serverUptime: dbOk ? 99.9 : 0,
      transactionSuccessRate,
      averageResponseTime: responseMs,
      activeSmartContracts: contractsCount,
      databaseStatus: dbOk ? "healthy" : "degraded",
    };
  }

  async getAnalytics() {
    const fundingStats = await this.getFundingAggregates();

    const campaigns = await this.campaignsRepository.find({
      relations: ["creator"],
    });

    const fundings = await this.fundingRepository.find({
      where: { status: FundingStatus.CONFIRMED },
      relations: ["campaign"],
      order: { createdAt: "ASC" },
    });

    const categoryMap = new Map<string, number>();
    for (const c of campaigns) {
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
    }

    const categoryDistribution = Array.from(categoryMap.entries()).map(
      ([name, value]) => ({ name, value })
    );

    const monthMap = new Map<
      string,
      { amount: number; backers: Set<string>; fundings: number }
    >();
    for (const f of fundings) {
      const d = new Date(f.createdAt);
      const key = d.toLocaleString("en", { month: "short", year: "2-digit" });
      const entry = monthMap.get(key) || {
        amount: 0,
        backers: new Set<string>(),
        fundings: 0,
      };
      entry.amount += Number(f.amount);
      entry.backers.add(f.userId);
      entry.fundings += 1;
      monthMap.set(key, entry);
    }

    const fundingTrends = Array.from(monthMap.entries()).map(
      ([date, data]) => ({
        date,
        amount: Math.round(data.amount * 100) / 100,
        backers: data.backers.size,
        fundings: data.fundings,
      })
    );

    const topCampaigns = [...campaigns]
      .sort((a, b) => Number(b.raisedAmount) - Number(a.raisedAmount))
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        name: c.title,
        raised: Number(c.raisedAmount),
        goal: Number(c.goalAmount),
        backers: c.backersCount,
        status: c.status,
      }));

    const fundedCount = campaigns.filter(
      (c) => c.status === CampaignStatus.FUNDED
    ).length;
    const successRate =
      campaigns.length > 0
        ? Math.round((fundedCount / campaigns.length) * 1000) / 10
        : 0;

    const avgPledge =
      fundingStats.totalFundings > 0
        ? fundingStats.totalAmount / fundingStats.totalFundings
        : 0;

    const statusBreakdown = Object.values(CampaignStatus).map((status) => ({
      status,
      count: campaigns.filter((c) => c.status === status).length,
    }));

    return {
      fundingTrends,
      categoryDistribution,
      topCampaigns,
      successRate,
      averagePledge: Math.round(avgPledge * 100) / 100,
      statusBreakdown,
      totals: fundingStats,
    };
  }

  async listCampaignsForAdmin(options: {
    status?: CampaignStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.campaignsService.findAll({
      status: options.status,
      search: options.search,
      page: options.page || 1,
      limit: options.limit || 50,
    });
  }

  async updateCampaignStatus(
    campaignId: string,
    dto: UpdateCampaignStatusDto
  ) {
    return this.campaignsService.adminUpdate(campaignId, {
      status: dto.status,
    });
  }

  async listUsers(search?: string, role?: string) {
    let users = await this.usersRepository.find({
      relations: ["campaigns", "fundings"],
      order: { createdAt: "DESC" },
    });

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.walletAddress || "").toLowerCase().includes(q)
      );
    }

    if (role && role !== "all") {
      users = users.filter((u) => u.role === role);
    }

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isVerified: u.isVerified,
      isSuspended: u.isSuspended ?? false,
      walletAddress: u.walletAddress,
      createdAt: u.createdAt,
      campaignsCount: u.campaigns?.length ?? 0,
      fundingsCount: u.fundings?.length ?? 0,
    }));
  }

  async updateUserAdmin(userId: string, dto: UpdateUserAdminDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const update: Partial<User> & { isSuspended?: boolean } = {};
    if (dto.isVerified !== undefined) update.isVerified = dto.isVerified;
    if (dto.isSuspended !== undefined) {
      (update as { isSuspended?: boolean }).isSuspended = dto.isSuspended;
    }

    await this.usersRepository.update(userId, update);
    return this.listUsers().then((users) => users.find((u) => u.id === userId));
  }

  async listModerationReports() {
    try {
      await this.syncAutoFlaggedCampaigns();
      return await this.moderationRepository.find({
        relations: ["campaign", "reporter"],
        order: { createdAt: "DESC" },
      });
    } catch {
      return [];
    }
  }

  async createModerationReport(
    dto: CreateModerationReportDto,
    reporterId?: string
  ) {
    const report = this.moderationRepository.create({
      ...dto,
      reporterId,
      reporterName: dto.reporterName || "Platform user",
      severity: dto.severity || ModerationSeverity.MEDIUM,
      status: ModerationReportStatus.OPEN,
    });
    return this.moderationRepository.save(report);
  }

  async updateModerationReport(
    id: string,
    dto: UpdateModerationDto,
    adminId: string
  ) {
    const report = await this.moderationRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Moderation report ${id} not found`);
    }

    const update: Partial<ModerationReport> = { ...dto };
    if (
      dto.status === ModerationReportStatus.RESOLVED ||
      dto.status === ModerationReportStatus.DISMISSED
    ) {
      update.resolvedAt = new Date();
      update.resolvedBy = adminId;
    }

    await this.moderationRepository.update(id, update);
    return this.moderationRepository.findOne({
      where: { id },
      relations: ["campaign"],
    });
  }

  async takeModerationAction(
    reportId: string,
    action: "cancel_campaign" | "investigate",
    adminId: string
  ) {
    const report = await this.moderationRepository.findOne({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException(`Moderation report ${reportId} not found`);
    }

    if (action === "investigate") {
      await this.moderationRepository.update(reportId, {
        status: ModerationReportStatus.INVESTIGATING,
      });
      return this.moderationRepository.findOne({
        where: { id: reportId },
        relations: ["campaign", "campaign.creator"],
      });
    }

    if (action === "cancel_campaign" && report.campaignId) {
      await this.campaignsService.adminUpdate(report.campaignId, {
        status: CampaignStatus.CANCELLED,
      });
    }

    await this.moderationRepository.update(reportId, {
      status: ModerationReportStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedBy: adminId,
      adminNotes: "Campaign cancelled by admin action",
    });

    return this.moderationRepository.findOne({ where: { id: reportId } });
  }

  private async getFundingAggregates() {
    const result = await this.fundingRepository
      .createQueryBuilder("funding")
      .select([
        "COALESCE(SUM(funding.amount), 0) as totalAmount",
        "COUNT(funding.id) as totalFundings",
        "COUNT(DISTINCT funding.user_id) as totalBackers",
      ])
      .where("funding.status = :status", { status: FundingStatus.CONFIRMED })
      .getRawOne();

    return {
      totalAmount: Number.parseFloat(result.totalAmount) || 0,
      totalFundings: Number.parseInt(result.totalFundings, 10) || 0,
      totalBackers: Number.parseInt(result.totalBackers, 10) || 0,
    };
  }

  private async syncAutoFlaggedCampaigns() {
    try {
      const campaigns = await this.campaignsRepository.find({
        relations: ["creator"],
        where: { status: CampaignStatus.ACTIVE },
      });

      const openReports = await this.moderationRepository.find({
        where: { status: ModerationReportStatus.OPEN },
      });
      const flaggedTitles = new Set(
        openReports.map((r) => r.campaignTitle.toLowerCase())
      );

      for (const campaign of campaigns) {
        const titleLower = campaign.title.toLowerCase();
        const hasSuspicious = SUSPICIOUS_KEYWORDS.some((kw) =>
          titleLower.includes(kw)
        );
        const unverifiedCreator = !campaign.creator?.isVerified;

        if (!hasSuspicious && !unverifiedCreator) continue;
        if (flaggedTitles.has(titleLower)) continue;

        const reason = hasSuspicious
          ? "Automated flag: suspicious keywords in campaign title"
          : "Automated flag: unverified creator account";

        await this.moderationRepository.save(
          this.moderationRepository.create({
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            reason,
            reporterName: "System",
            severity: hasSuspicious
              ? ModerationSeverity.HIGH
              : ModerationSeverity.MEDIUM,
            status: ModerationReportStatus.OPEN,
          })
        );
        flaggedTitles.add(titleLower);
      }
    } catch {
      // moderation_reports table may not exist yet
    }
  }
}
