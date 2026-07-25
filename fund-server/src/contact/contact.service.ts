import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ContactMessage,
  ContactMessageStatus,
} from "./entities/contact-message.entity";
import {
  ContactChatSession,
  ContactChatSessionStatus,
} from "./entities/contact-chat-session.entity";
import {
  ContactChatMessage,
  ContactChatSender,
} from "./entities/contact-chat-message.entity";
import { SubmitContactMessageDto } from "./dto/submit-contact-message.dto";
import {
  CreateChatSessionDto,
  SendChatMessageDto,
} from "./dto/send-chat-message.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";

export interface ContactMessageResponse {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: ContactMessageStatus;
  relatedCampaignId: string | null;
  relatedCreatorId: string | null;
  relatedBackerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  sender: ContactChatSender;
  content: string;
  createdAt: string;
}

export interface ChatSessionResponse {
  id: string;
  status: ContactChatSessionStatus;
  isBusinessHours: boolean;
  messages: ChatMessageResponse[];
}

const CONTACT_CONFIG = {
  supportEmail: "support@fundflow.com",
  supportPhone: "+15550000000",
  supportPhoneDisplay: "+1 (555) 000-0000",
  chatHours: "Mon-Fri, 9 AM - 6 PM PST",
  office: {
    address: "123 Blockchain Blvd",
    city: "San Francisco, CA 94105",
    country: "United States",
    mapQuery: "123+Blockchain+Blvd+San+Francisco+CA+94105",
  },
  officeHours: [
    { days: "Monday - Friday", hours: "9:00 AM - 6:00 PM PST" },
    { days: "Saturday", hours: "10:00 AM - 4:00 PM PST" },
    { days: "Sunday", hours: "Closed" },
  ],
};

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private messageRepository: Repository<ContactMessage>,
    @InjectRepository(ContactChatSession)
    private chatSessionRepository: Repository<ContactChatSession>,
    @InjectRepository(ContactChatMessage)
    private chatMessageRepository: Repository<ContactChatMessage>,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway
  ) {}

  getConfig() {
    return {
      ...CONTACT_CONFIG,
      isBusinessHours: this.isBusinessHours(),
    };
  }

  private generateReferenceNumber(): string {
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MSG-${Date.now()}-${suffix}`;
  }

  private sanitizeText(value: string): string {
    return value
      .replace(/<[^>]*>/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim();
  }

  private isBusinessHours(): boolean {
    const now = new Date();
    const pst = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const day = pst.getDay();
    const hour = pst.getHours();
    if (day === 0) return false;
    if (day === 6) return hour >= 10 && hour < 16;
    return hour >= 9 && hour < 18;
  }

  private mapMessage(msg: ContactMessage): ContactMessageResponse {
    return {
      id: msg.id,
      referenceNumber: msg.referenceNumber,
      fullName: msg.fullName,
      email: msg.email,
      subject: msg.subject,
      category: msg.category,
      message: msg.message,
      status: msg.status,
      relatedCampaignId: msg.relatedCampaignId,
      relatedCreatorId: msg.relatedCreatorId,
      relatedBackerId: msg.relatedBackerId,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    };
  }

  private mapChatMessage(m: ContactChatMessage): ChatMessageResponse {
    return {
      id: m.id,
      sessionId: m.sessionId,
      sender: m.sender,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    };
  }

  private buildContextPrefix(dto: SubmitContactMessageDto): string {
    const parts: string[] = [];
    if (dto.relatedCampaignId) {
      parts.push(`Campaign ID: ${dto.relatedCampaignId}`);
    }
    if (dto.relatedCreatorId) {
      parts.push(`Creator ID: ${dto.relatedCreatorId}`);
    }
    if (dto.relatedBackerId) {
      parts.push(`Backer ID: ${dto.relatedBackerId}`);
    }
    if (parts.length === 0) return "";
    return `[Context: ${parts.join(" | ")}]\n\n`;
  }

  private getAutoChatReply(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes("refund") || lower.includes("cancel")) {
      return "For refund or cancellation questions, our team can review your backing once a support agent joins. You can also submit the contact form with subject Billing & Payments for faster tracking.";
    }
    if (lower.includes("wallet") || lower.includes("metamask")) {
      return "Wallet issues are common — try refreshing the page, unlocking your wallet, and confirming you're on the correct network. An agent will follow up if you need more help.";
    }
    if (lower.includes("campaign") || lower.includes("funding")) {
      return "Thanks for reaching out about campaigns. Share your campaign link or ID if you have one — that helps us assist you faster when an agent connects.";
    }
    if (this.isBusinessHours()) {
      return "Thanks for your message. A support specialist will join this chat shortly. Average wait time is under 5 minutes during business hours.";
    }
    return "Thanks for reaching out! We're currently outside live chat hours (Mon-Fri 9 AM-6 PM PST, Sat 10 AM-4 PM PST). Your message is saved — please use the contact form or email support@fundflow.com and we'll respond within 24 hours.";
  }

  async submitMessage(
    dto: SubmitContactMessageDto
  ): Promise<{ id: string; referenceNumber: string; message: string }> {
    if (dto.companyWebsite?.trim()) {
      return {
        id: "accepted",
        referenceNumber: this.generateReferenceNumber(),
        message: "Message received successfully",
      };
    }

    const fullName = this.sanitizeText(dto.fullName);
    const message =
      this.buildContextPrefix(dto) + this.sanitizeText(dto.message);

    if (!fullName || message.length < 10) {
      throw new BadRequestException("Invalid message content");
    }

    const record = this.messageRepository.create({
      referenceNumber: this.generateReferenceNumber(),
      fullName,
      email: dto.email.toLowerCase().trim(),
      subject: dto.subject,
      category: dto.category,
      message,
      status: ContactMessageStatus.NEW,
      userId: dto.userId || null,
      relatedCampaignId: dto.relatedCampaignId || null,
      relatedCreatorId: dto.relatedCreatorId || null,
      relatedBackerId: dto.relatedBackerId || null,
    });

    const saved = await this.messageRepository.save(record);

    this.websocketGateway.broadcastContactUpdate({
      type: "new_message",
      messageId: saved.id,
      referenceNumber: saved.referenceNumber,
    });

    return {
      id: saved.id,
      referenceNumber: saved.referenceNumber,
      message: "Message received successfully. We'll respond within 24 hours.",
    };
  }

  async getMessagesAdmin(options?: {
    status?: ContactMessageStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ messages: ContactMessageResponse[]; total: number }> {
    const { status, search, page = 1, limit = 50 } = options || {};
    const qb = this.messageRepository.createQueryBuilder("msg");

    if (status) {
      qb.andWhere("msg.status = :status", { status });
    }
    if (search?.trim()) {
      qb.andWhere(
        "(msg.full_name ILIKE :s OR msg.email ILIKE :s OR msg.reference_number ILIKE :s OR msg.message ILIKE :s)",
        { s: `%${search.trim()}%` }
      );
    }

    qb.orderBy("msg.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [messages, total] = await qb.getManyAndCount();
    return {
      messages: messages.map((m) => this.mapMessage(m)),
      total,
    };
  }

  async updateMessageStatus(
    id: string,
    status: ContactMessageStatus
  ): Promise<ContactMessageResponse> {
    const msg = await this.messageRepository.findOne({ where: { id } });
    if (!msg) {
      throw new NotFoundException("Contact message not found");
    }
    msg.status = status;
    await this.messageRepository.save(msg);
    const mapped = this.mapMessage(msg);
    this.websocketGateway.broadcastContactUpdate({
      type: "message_updated",
      messageId: id,
    });
    return mapped;
  }

  async createChatSession(
    dto: CreateChatSessionDto
  ): Promise<{ sessionId: string; messages: ChatMessageResponse[] }> {
    const session = this.chatSessionRepository.create({
      visitorName: dto.visitorName
        ? this.sanitizeText(dto.visitorName)
        : null,
      visitorEmail: dto.visitorEmail?.toLowerCase().trim() || null,
      status: ContactChatSessionStatus.ACTIVE,
    });
    const saved = await this.chatSessionRepository.save(session);

    const welcome = this.chatMessageRepository.create({
      sessionId: saved.id,
      sender: ContactChatSender.SYSTEM,
      content: this.isBusinessHours()
        ? "Hello! Welcome to FundFlow live chat. How can we help you today?"
        : "Hello! Live agents are offline right now, but you can leave a message here or use the contact form — we'll email you back within 24 hours.",
    });
    await this.chatMessageRepository.save(welcome);

    const messages = await this.chatMessageRepository.find({
      where: { sessionId: saved.id },
      order: { createdAt: "ASC" },
    });

    return {
      sessionId: saved.id,
      messages: messages.map((m) => this.mapChatMessage(m)),
    };
  }

  async getChatSession(sessionId: string): Promise<ChatSessionResponse> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException("Chat session not found");
    }
    const messages = await this.chatMessageRepository.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });
    return {
      id: session.id,
      status: session.status,
      isBusinessHours: this.isBusinessHours(),
      messages: messages.map((m) => this.mapChatMessage(m)),
    };
  }

  async sendChatMessage(
    sessionId: string,
    dto: SendChatMessageDto
  ): Promise<{ messages: ChatMessageResponse[] }> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session || session.status !== ContactChatSessionStatus.ACTIVE) {
      throw new NotFoundException("Chat session not found or closed");
    }

    const content = this.sanitizeText(dto.content);
    if (!content) {
      throw new BadRequestException("Message cannot be empty");
    }

    const visitorMsg = this.chatMessageRepository.create({
      sessionId,
      sender: ContactChatSender.VISITOR,
      content,
    });
    await this.chatMessageRepository.save(visitorMsg);

    const autoReply = this.chatMessageRepository.create({
      sessionId,
      sender: ContactChatSender.SYSTEM,
      content: this.getAutoChatReply(content),
    });
    await this.chatMessageRepository.save(autoReply);

    this.websocketGateway.broadcastContactUpdate({
      type: "new_chat_message",
      sessionId,
    });

    const messages = await this.chatMessageRepository.find({
      where: { sessionId },
      order: { createdAt: "ASC" },
    });

    return { messages: messages.map((m) => this.mapChatMessage(m)) };
  }

  async getChatSessionsAdmin(options?: {
    page?: number;
    limit?: number;
  }): Promise<{
    sessions: Array<{
      id: string;
      visitorName: string | null;
      visitorEmail: string | null;
      status: ContactChatSessionStatus;
      messageCount: number;
      lastMessageAt: string | null;
      createdAt: string;
    }>;
    total: number;
  }> {
    const { page = 1, limit = 30 } = options || {};
    const [sessions, total] = await this.chatSessionRepository.findAndCount({
      order: { updatedAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mapped = await Promise.all(
      sessions.map(async (s) => {
        const count = await this.chatMessageRepository.count({
          where: { sessionId: s.id },
        });
        const last = await this.chatMessageRepository.findOne({
          where: { sessionId: s.id },
          order: { createdAt: "DESC" },
        });
        return {
          id: s.id,
          visitorName: s.visitorName,
          visitorEmail: s.visitorEmail,
          status: s.status,
          messageCount: count,
          lastMessageAt: last?.createdAt.toISOString() || null,
          createdAt: s.createdAt.toISOString(),
        };
      })
    );

    return { sessions: mapped, total };
  }
}
