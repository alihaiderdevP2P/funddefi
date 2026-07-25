import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BlogPostStatus } from "../entities/blog-post.entity";

export class CreateBlogPostDto {
  @ApiProperty({ description: "Post title" })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: "Short excerpt", required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: "Full post content" })
  @IsString()
  content: string;

  @ApiProperty({ description: "Category", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "Tags", required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: "Featured image URL", required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: "Featured on homepage", required: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ enum: BlogPostStatus, required: false })
  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @ApiProperty({ description: "Custom slug (auto-generated if omitted)", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;
}
