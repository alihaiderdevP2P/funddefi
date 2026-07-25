import {
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CampaignCategory } from "../entities/campaign.entity";
import { CreateRewardDto } from "./create-reward.dto";

export class CreateCampaignDto {
  @ApiProperty({ description: "Campaign title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Campaign description" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Campaign summary" })
  @IsString()
  summary: string;

  @ApiProperty({ description: "Funding goal in ETH" })
  @IsNumber()
  goalAmount: number;

  @ApiProperty({ description: "Campaign end date" })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: "Campaign category", enum: CampaignCategory })
  @IsEnum(CampaignCategory)
  category: CampaignCategory;

  @ApiProperty({ description: "Campaign image URL" })
  @IsString()
  imageUrl: string;

  @ApiProperty({ description: "Campaign video URL", required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({
    description: "Campaign rewards",
    type: [CreateRewardDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardDto)
  rewards?: CreateRewardDto[];
}
