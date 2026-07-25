import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ModerationSeverity } from "../entities/moderation-report.entity";

export class CreateModerationReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @ApiProperty()
  @IsString()
  campaignTitle: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reporterName?: string;

  @ApiPropertyOptional({ enum: ModerationSeverity })
  @IsOptional()
  @IsEnum(ModerationSeverity)
  severity?: ModerationSeverity;
}
