import {
  IsString,
  IsEmail,
  IsEnum,
  MaxLength,
  MinLength,
  IsOptional,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  SupportTicketCategory,
  SupportTicketPriority,
} from "../entities/support-ticket.entity";

export class SubmitSupportTicketDto {
  @ApiProperty({ description: "Full name" })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: "Email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: SupportTicketCategory })
  @IsEnum(SupportTicketCategory)
  category: SupportTicketCategory;

  @ApiProperty({ enum: SupportTicketPriority })
  @IsEnum(SupportTicketPriority)
  priority: SupportTicketPriority;

  @ApiProperty({ description: "Brief subject line" })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  subject: string;

  @ApiProperty({ description: "Detailed description of the issue" })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ description: "Optional user ID if authenticated" })
  @IsOptional()
  @IsString()
  userId?: string;
}
