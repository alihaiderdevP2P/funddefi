import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
  IsEmail,
  IsDateString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { JobPostingStatus } from "../entities/job-posting.entity";

export class CreateJobPostingDto {
  @ApiProperty({ description: "Job title" })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: "Department", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ description: "Location", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ description: "Employment type", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  jobType?: string;

  @ApiProperty({ description: "Job description" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Requirements", required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({ enum: JobPostingStatus, required: false })
  @IsOptional()
  @IsEnum(JobPostingStatus)
  status?: JobPostingStatus;

  @ApiProperty({ description: "Custom slug", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({ description: "Application deadline", required: false })
  @IsOptional()
  @IsDateString()
  closesAt?: string;
}
