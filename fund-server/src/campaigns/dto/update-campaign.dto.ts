import { PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CreateCampaignDto } from "./create-campaign.dto";
import { CampaignStatus } from "../entities/campaign.entity";

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  @ApiProperty({
    description: "Campaign status",
    enum: CampaignStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
