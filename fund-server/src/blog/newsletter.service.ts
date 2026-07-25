import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import {
  NewsletterSubscriber,
  NewsletterStatus,
} from "./entities/newsletter-subscriber.entity";
import {
  SubscribeNewsletterDto,
  UnsubscribeNewsletterDto,
} from "./dto/subscribe-newsletter.dto";

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private subscriberRepository: Repository<NewsletterSubscriber>
  ) {}

  async subscribe(
    dto: SubscribeNewsletterDto,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    if (dto.website) {
      throw new BadRequestException("Invalid submission");
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.subscriberRepository.findOne({
      where: { email },
    });

    if (existing) {
      if (existing.status === NewsletterStatus.ACTIVE) {
        throw new ConflictException("This email is already subscribed");
      }

      existing.status = NewsletterStatus.ACTIVE;
      existing.subscribedAt = new Date();
      existing.unsubscribedAt = null;
      existing.unsubscribeToken = randomUUID();
      existing.source = dto.source || "blog";
      existing.ipAddress = meta?.ipAddress;
      existing.userAgent = meta?.userAgent;

      const saved = await this.subscriberRepository.save(existing);
      return {
        message: "Welcome back! You have been resubscribed.",
        email: saved.email,
        subscribedAt: saved.subscribedAt.toISOString(),
      };
    }

    const subscriber = this.subscriberRepository.create({
      email,
      status: NewsletterStatus.ACTIVE,
      unsubscribeToken: randomUUID(),
      source: dto.source || "blog",
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      subscribedAt: new Date(),
    });

    const saved = await this.subscriberRepository.save(subscriber);
    return {
      message: "Thank you for subscribing! You'll receive our latest articles.",
      email: saved.email,
      subscribedAt: saved.subscribedAt.toISOString(),
    };
  }

  async unsubscribe(dto: UnsubscribeNewsletterDto) {
    let subscriber: NewsletterSubscriber | null = null;

    if (dto.token) {
      subscriber = await this.subscriberRepository.findOne({
        where: { unsubscribeToken: dto.token },
      });
    } else if (dto.email) {
      subscriber = await this.subscriberRepository.findOne({
        where: { email: dto.email.trim().toLowerCase() },
      });
    }

    if (!subscriber) {
      throw new NotFoundException("Subscription not found");
    }

    if (subscriber.status === NewsletterStatus.UNSUBSCRIBED) {
      return {
        message: "You are already unsubscribed.",
        email: subscriber.email,
      };
    }

    subscriber.status = NewsletterStatus.UNSUBSCRIBED;
    subscriber.unsubscribedAt = new Date();
    await this.subscriberRepository.save(subscriber);

    return {
      message: "You have been unsubscribed successfully.",
      email: subscriber.email,
    };
  }

  async unsubscribeByToken(token: string) {
    return this.unsubscribe({ token });
  }

  async getSubscribers(options?: {
    status?: NewsletterStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 50 } = options || {};

    const qb = this.subscriberRepository.createQueryBuilder("sub");

    if (status) {
      qb.andWhere("sub.status = :status", { status });
    }

    if (search) {
      qb.andWhere("sub.email ILIKE :search", { search: `%${search}%` });
    }

    qb.orderBy("sub.subscribedAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [subscribers, total] = await qb.getManyAndCount();

    return {
      subscribers: subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        status: s.status,
        source: s.source,
        subscribedAt: s.subscribedAt.toISOString(),
        unsubscribedAt: s.unsubscribedAt?.toISOString() || null,
      })),
      total,
      stats: await this.getStats(),
    };
  }

  async getStats() {
    const active = await this.subscriberRepository.count({
      where: { status: NewsletterStatus.ACTIVE },
    });
    const unsubscribed = await this.subscriberRepository.count({
      where: { status: NewsletterStatus.UNSUBSCRIBED },
    });
    const thisMonth = await this.subscriberRepository
      .createQueryBuilder("sub")
      .where("sub.status = :status", { status: NewsletterStatus.ACTIVE })
      .andWhere("sub.subscribed_at >= date_trunc('month', CURRENT_DATE)")
      .getCount();

    return { active, unsubscribed, thisMonth };
  }
}
