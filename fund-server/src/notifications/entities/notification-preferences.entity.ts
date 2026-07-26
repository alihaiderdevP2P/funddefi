import { Entity, Column, PrimaryColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("notification_preferences")
export class NotificationPreferences {
  @ApiProperty()
  @PrimaryColumn({ name: "user_id", type: "uuid" })
  userId: string;

  @ApiProperty({ description: "Master email notifications toggle" })
  @Column({ name: "email_notifications", default: true })
  emailNotifications: boolean;

  @ApiProperty({ description: "Campaign update alerts" })
  @Column({ name: "campaign_updates", default: true })
  campaignUpdates: boolean;

  @ApiProperty({ description: "Funding received alerts" })
  @Column({ name: "funding_alerts", default: true })
  fundingAlerts: boolean;

  @ApiProperty({ description: "Marketing / promo emails" })
  @Column({ name: "marketing_emails", default: false })
  marketingEmails: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
