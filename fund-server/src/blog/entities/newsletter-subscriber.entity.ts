import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

export enum NewsletterStatus {
  ACTIVE = "active",
  UNSUBSCRIBED = "unsubscribed",
  BOUNCED = "bounced",
}

@Entity("blog_newsletter_subscribers")
export class NewsletterSubscriber extends BaseEntity {
  @ApiProperty({ description: "Subscriber email" })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ enum: NewsletterStatus })
  @Column({
    type: "enum",
    enum: NewsletterStatus,
    default: NewsletterStatus.ACTIVE,
  })
  status: NewsletterStatus;

  @Column({ name: "unsubscribe_token", type: "uuid", unique: true })
  unsubscribeToken: string;

  @Column({ default: "blog" })
  source: string;

  @Column({ name: "ip_address", nullable: true })
  ipAddress: string;

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent: string;

  @Column({ name: "subscribed_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  subscribedAt: Date;

  @Column({ name: "unsubscribed_at", type: "timestamp", nullable: true })
  unsubscribedAt: Date | null;
}
