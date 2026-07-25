import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  SupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
} from "./entities/support-ticket.entity";
import {
  HelpArticle,
  HelpArticleCategory,
  HelpArticleStatus,
} from "./entities/help-article.entity";
import { SubmitSupportTicketDto } from "./dto/submit-support-ticket.dto";
import { UpdateSupportTicketDto } from "./dto/update-support-ticket.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";

export interface SupportTicketResponse {
  id: string;
  ticketNumber: string;
  fullName: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  assignedTo: string | null;
  estimatedResponseTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpArticleResponse {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary: string | null;
  category: HelpArticleCategory;
  status: HelpArticleStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HelpCategoryResponse {
  id: HelpArticleCategory;
  title: string;
  description: string;
  articles: HelpArticleResponse[];
  totalArticles: number;
}

const CATEGORY_META: Record<
  HelpArticleCategory,
  { title: string; description: string }
> = {
  [HelpArticleCategory.GENERAL]: {
    title: "General Support",
    description: "General questions about FundFlow",
  },
  [HelpArticleCategory.TECHNICAL]: {
    title: "Technical Issues",
    description: "Wallet connection, smart contracts, and technical problems",
  },
  [HelpArticleCategory.CAMPAIGNS]: {
    title: "Campaign Management",
    description: "Creating, managing, and promoting campaigns",
  },
  [HelpArticleCategory.PAYMENTS]: {
    title: "Payments & Funding",
    description: "Payment processing, refunds, and funding issues",
  },
};

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(HelpArticle)
    private articleRepository: Repository<HelpArticle>,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway
  ) {}

  private generateTicketNumber(): string {
    const suffix = Math.random().toString(36).substring(2, 11).toUpperCase();
    return `TICKET-${Date.now()}-${suffix}`;
  }

  private getEstimatedResponseTime(priority: SupportTicketPriority): string {
    switch (priority) {
      case SupportTicketPriority.URGENT:
        return "1-2 hours";
      case SupportTicketPriority.HIGH:
        return "4-8 hours";
      case SupportTicketPriority.MEDIUM:
        return "24 hours";
      default:
        return "48 hours";
    }
  }

  private mapTicket(ticket: SupportTicket): SupportTicketResponse {
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      fullName: ticket.fullName,
      email: ticket.email,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      estimatedResponseTime: this.getEstimatedResponseTime(ticket.priority),
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    };
  }

  private mapArticle(article: HelpArticle): HelpArticleResponse {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.category,
      status: article.status,
      sortOrder: article.sortOrder,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  async submitTicket(
    dto: SubmitSupportTicketDto
  ): Promise<{
    id: string;
    ticketNumber: string;
    status: SupportTicketStatus;
    estimatedResponseTime: string;
    message: string;
  }> {
    const ticket = this.ticketRepository.create({
      ticketNumber: this.generateTicketNumber(),
      fullName: dto.fullName,
      email: dto.email,
      category: dto.category,
      priority: dto.priority,
      subject: dto.subject,
      description: dto.description,
      userId: dto.userId || null,
      status: SupportTicketStatus.OPEN,
    });

    const saved = await this.ticketRepository.save(ticket);

    this.websocketGateway.broadcastSupportUpdate({
      type: "new_ticket",
      ticketId: saved.id,
      ticketNumber: saved.ticketNumber,
      priority: saved.priority,
    });

    if (
      saved.priority === SupportTicketPriority.URGENT ||
      saved.priority === SupportTicketPriority.HIGH
    ) {
      await this.websocketGateway.broadcastGlobalNotification({
        type: "warning",
        title: "New Support Ticket",
        message: `${saved.priority.toUpperCase()}: ${saved.subject}`,
        data: { ticketNumber: saved.ticketNumber, ticketId: saved.id },
      });
    }

    return {
      id: saved.id,
      ticketNumber: saved.ticketNumber,
      status: saved.status,
      estimatedResponseTime: this.getEstimatedResponseTime(saved.priority),
      message: "Your support ticket has been created successfully",
    };
  }

  async getTicketByNumber(ticketNumber: string): Promise<SupportTicketResponse> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketNumber },
    });

    if (!ticket) {
      throw new NotFoundException("Support ticket not found");
    }

    return this.mapTicket(ticket);
  }

  async getTickets(options?: {
    status?: SupportTicketStatus;
    priority?: SupportTicketPriority;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tickets: SupportTicketResponse[]; total: number }> {
    const { status, priority, category, search, page = 1, limit = 50 } =
      options || {};

    const queryBuilder = this.ticketRepository.createQueryBuilder("ticket");

    if (status) {
      queryBuilder.andWhere("ticket.status = :status", { status });
    }

    if (priority) {
      queryBuilder.andWhere("ticket.priority = :priority", { priority });
    }

    if (category) {
      queryBuilder.andWhere("ticket.category = :category", { category });
    }

    if (search) {
      queryBuilder.andWhere(
        "(ticket.ticket_number ILIKE :search OR ticket.subject ILIKE :search OR ticket.email ILIKE :search OR ticket.full_name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy("ticket.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [tickets, total] = await queryBuilder.getManyAndCount();

    return {
      tickets: tickets.map((t) => this.mapTicket(t)),
      total,
    };
  }

  async updateTicket(
    id: string,
    dto: UpdateSupportTicketDto
  ): Promise<SupportTicketResponse> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException("Support ticket not found");
    }

    if (dto.status !== undefined) ticket.status = dto.status;
    if (dto.assignedTo !== undefined) ticket.assignedTo = dto.assignedTo;

    await this.ticketRepository.save(ticket);

    this.websocketGateway.broadcastSupportUpdate({
      type: "ticket_updated",
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
    });

    return this.mapTicket(ticket);
  }

  async getArticles(options?: {
    category?: HelpArticleCategory;
    search?: string;
    status?: HelpArticleStatus;
    page?: number;
    limit?: number;
  }): Promise<{ articles: HelpArticleResponse[]; total: number }> {
    const {
      category,
      search,
      status = HelpArticleStatus.PUBLISHED,
      page = 1,
      limit = 50,
    } = options || {};

    const queryBuilder = this.articleRepository.createQueryBuilder("article");

    if (status) {
      queryBuilder.andWhere("article.status = :status", { status });
    }

    if (category) {
      queryBuilder.andWhere("article.category = :category", { category });
    }

    if (search) {
      queryBuilder.andWhere(
        "(article.title ILIKE :search OR article.content ILIKE :search OR article.summary ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy("article.sortOrder", "ASC")
      .addOrderBy("article.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [articles, total] = await queryBuilder.getManyAndCount();

    return {
      articles: articles.map((a) => this.mapArticle(a)),
      total,
    };
  }

  async getArticleBySlug(slug: string): Promise<HelpArticleResponse> {
    const article = await this.articleRepository.findOne({
      where: { slug, status: HelpArticleStatus.PUBLISHED },
    });

    if (!article) {
      throw new NotFoundException("Help article not found");
    }

    return this.mapArticle(article);
  }

  async getCategories(): Promise<HelpCategoryResponse[]> {
    const { articles } = await this.getArticles({ limit: 100 });

    const grouped = new Map<HelpArticleCategory, HelpArticleResponse[]>();

    for (const category of Object.values(HelpArticleCategory)) {
      grouped.set(category, []);
    }

    for (const article of articles) {
      grouped.get(article.category)?.push(article);
    }

    return Object.values(HelpArticleCategory).map((category) => {
      const categoryArticles = grouped.get(category) || [];
      const meta = CATEGORY_META[category];

      return {
        id: category,
        title: meta.title,
        description: meta.description,
        articles: categoryArticles,
        totalArticles: categoryArticles.length,
      };
    });
  }

  async searchAll(query: string): Promise<{
    articles: HelpArticleResponse[];
    total: number;
  }> {
    if (!query.trim()) {
      return { articles: [], total: 0 };
    }

    return this.getArticles({ search: query.trim(), limit: 20 });
  }
}
