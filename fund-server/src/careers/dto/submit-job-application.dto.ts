import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitJobApplicationDto {
  @ApiProperty({ description: "Applicant full name" })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: "Applicant email" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Phone number", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: "LinkedIn profile URL", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedin?: string;

  @ApiProperty({ description: "GitHub profile URL", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  github?: string;

  @ApiProperty({ description: "Portfolio website URL", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  portfolio?: string;

  @ApiProperty({ description: "Resume file URL (uploaded via /upload/document)" })
  @IsString()
  resumeUrl: string;

  @ApiProperty({ description: "Cover letter" })
  @IsString()
  coverLetter: string;
}
