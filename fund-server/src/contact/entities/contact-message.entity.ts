import { Entity, Column } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

export enum ContactMessageCategory {
  GENERAL = "general",
  SUPPORT = "support",
  BUG = "bug",
  FEATURE = "feature",
  PARTNERSHIP = "partnership",
}

export enum ContactMessageSubject {
  GENERAL_INQUIRY = "general_inquiry",
  CAMPAIGN_SUPPORT = "campaign_support",
  BILLING_PAYMENTS = "billing_payments",
  TECHNICAL_ISSUE = "technical_issue",
  PARTNERSHIP = "partnership",
  FEEDBACK = "feedback",
  OTHER = "other",
}

export enum ContactMessageStatus {
  NEW = "new",
  READ = "read",
  REPLIED = "replied",
  RESOLVED = "resolved",
  SPAM = "spam",
}

@Entity("contact_messages")
export class ContactMessage extends BaseEntity {
  @ApiProperty()
  @Column({ name: "reference_number", unique: true })
  referenceNumber: string;

  @ApiProperty()
  @Column({ name: "full_name" })
  fullName: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty({ enum: ContactMessageSubject })
  @Column({ type: "enum", enum: ContactMessageSubject })
  subject: ContactMessageSubject;

  @ApiProperty({ enum: ContactMessageCategory })
  @Column({
    type: "enum",
    enum: ContactMessageCategory,
    default: ContactMessageCategory.GENERAL,
  })
  category: ContactMessageCategory;

  @ApiProperty()
  @Column({ type: "text" })
  message: string;

  @ApiProperty({ enum: ContactMessageStatus })
  @Column({
    type: "enum",
    enum: ContactMessageStatus,
    default: ContactMessageStatus.NEW,
  })
  status: ContactMessageStatus;

  @ApiPropertyOptional()
  @Column({ name: "user_id", nullable: true })
  userId: string | null;

  @ApiPropertyOptional()
  @Column({ name: "related_campaign_id", nullable: true })
  relatedCampaignId: string | null;

  @ApiPropertyOptional()
  @Column({ name: "related_creator_id", nullable: true })
  relatedCreatorId: string | null;

  @ApiPropertyOptional()
  @Column({ name: "related_backer_id", nullable: true })
  relatedBackerId: string | null;
}
