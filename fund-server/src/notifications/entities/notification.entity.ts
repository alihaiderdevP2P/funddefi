import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

export type NotificationType =
  | "funding_alert"
  | "campaign_update"
  | "marketing"
  | "system"
  | "welcome";

export type NotificationChannel = "in_app" | "email" | "both";

@Entity("notifications")
export class Notification extends BaseEntity {
  @ApiProperty()
  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @ApiProperty({
    enum: [
      "funding_alert",
      "campaign_update",
      "marketing",
      "system",
      "welcome",
    ],
  })
  @Column({
    type: "enum",
    enum: [
      "funding_alert",
      "campaign_update",
      "marketing",
      "system",
      "welcome",
    ],
    enumName: "notification_type",
    default: "system",
  })
  type: NotificationType;

  @ApiProperty()
  @Column({ length: 255 })
  title: string;

  @ApiProperty()
  @Column({ type: "text" })
  message: string;

  @ApiProperty({ required: false })
  @Column({ type: "jsonb", default: {} })
  data: Record<string, unknown>;

  @ApiProperty({ enum: ["in_app", "email", "both"] })
  @Column({
    type: "enum",
    enum: ["in_app", "email", "both"],
    enumName: "notification_channel",
    default: "both",
  })
  channel: NotificationChannel;

  @ApiProperty({ description: "Show as toast/popup in the client" })
  @Column({ name: "show_popup", default: true })
  showPopup: boolean;

  @ApiProperty()
  @Column({ name: "email_sent", default: false })
  emailSent: boolean;

  @ApiProperty({ required: false })
  @Column({ name: "email_error", type: "text", nullable: true })
  emailError: string | null;

  @ApiProperty()
  @Column({ name: "is_read", default: false })
  isRead: boolean;

  @ApiProperty({ required: false })
  @Column({ name: "read_at", type: "timestamp", nullable: true })
  readAt: Date | null;
}
