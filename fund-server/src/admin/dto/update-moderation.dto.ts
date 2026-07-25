import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ModerationReportStatus,
  ModerationSeverity,
} from "../entities/moderation-report.entity";

export class UpdateModerationDto {
  @ApiPropertyOptional({ enum: ModerationReportStatus })
  @IsOptional()
  @IsEnum(ModerationReportStatus)
  status?: ModerationReportStatus;

  @ApiPropertyOptional({ enum: ModerationSeverity })
  @IsOptional()
  @IsEnum(ModerationSeverity)
  severity?: ModerationSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
