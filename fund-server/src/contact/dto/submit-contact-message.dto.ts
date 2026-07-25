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
  ContactMessageCategory,
  ContactMessageSubject,
} from "../entities/contact-message.entity";

export class SubmitContactMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ContactMessageSubject })
  @IsEnum(ContactMessageSubject)
  subject: ContactMessageSubject;

  @ApiProperty({ enum: ContactMessageCategory })
  @IsEnum(ContactMessageCategory)
  category: ContactMessageCategory;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedCampaignId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedCreatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedBackerId?: string;

  /** Honeypot — must stay empty; rejected silently in service if filled */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  companyWebsite?: string;
}
