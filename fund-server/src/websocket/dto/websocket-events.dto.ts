import { IsString, IsOptional, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class JoinCampaignDto {
  @ApiProperty({ description: "Campaign ID to join" })
  @IsString()
  campaignId: string;
}

export class LeaveCampaignDto {
  @ApiProperty({ description: "Campaign ID to leave" })
  @IsString()
  campaignId: string;
}

export class AuthenticateDto {
  @ApiProperty({ description: "JWT token for authentication" })
  @IsString()
  token: string;
}

export class WebSocketResponseDto {
  @ApiProperty({ description: "Event type" })
  @IsString()
  event: string;

  @ApiProperty({ description: "Response data" })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiProperty({ description: "Timestamp" })
  @IsString()
  timestamp: string;
}
