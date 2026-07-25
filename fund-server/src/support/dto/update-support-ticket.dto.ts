import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { SupportTicketStatus } from "../entities/support-ticket.entity";

export class UpdateSupportTicketDto {
  @ApiPropertyOptional({ enum: SupportTicketStatus })
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @ApiPropertyOptional({ description: "Assigned support agent name" })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
