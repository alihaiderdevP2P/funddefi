import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Campaign } from "../../campaigns/entities/campaign.entity";
import { User } from "../../users/entities/user.entity";

export enum ModerationSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum ModerationReportStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

@Entity("moderation_reports")
export class ModerationReport extends BaseEntity {
  @Column({ nullable: true, name: "campaign_id" })
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @ApiProperty()
  @Column({ name: "campaign_title" })
  campaignTitle: string;

  @ApiProperty()
  @Column("text")
  reason: string;

  @Column({ nullable: true, name: "reporter_id" })
  reporterId: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "reporter_id" })
  reporter: User;

  @Column({ nullable: true, name: "reporter_name" })
  reporterName: string;

  @Column({
    type: "enum",
    enum: ModerationSeverity,
    default: ModerationSeverity.MEDIUM,
  })
  severity: ModerationSeverity;

  @Column({
    type: "enum",
    enum: ModerationReportStatus,
    default: ModerationReportStatus.OPEN,
  })
  status: ModerationReportStatus;

  @Column({ nullable: true, type: "text", name: "admin_notes" })
  adminNotes: string;

  @Column({ nullable: true, name: "resolved_at" })
  resolvedAt: Date;

  @Column({ nullable: true, name: "resolved_by" })
  resolvedBy: string;
}
