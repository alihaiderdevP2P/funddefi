import { IsBoolean, IsOptional, IsString, IsUUID, IsIn, IsObject } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type {
  NotificationChannel,
  NotificationType,
} from "../entities/notification.entity";

export class CreateNotificationDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    enum: [
      "funding_alert",
      "campaign_update",
      "marketing",
      "system",
      "welcome",
    ],
  })
  @IsOptional()
  @IsIn([
    "funding_alert",
    "campaign_update",
    "marketing",
    "system",
    "welcome",
  ])
  type?: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ["in_app", "email", "both"] })
  @IsOptional()
  @IsIn(["in_app", "email", "both"])
  channel?: NotificationChannel;

  @ApiPropertyOptional({ description: "Show toast/popup" })
  @IsOptional()
  @IsBoolean()
  showPopup?: boolean;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  campaignUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fundingAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
