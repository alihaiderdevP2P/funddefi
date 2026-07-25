import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CampaignStatus } from "../../campaigns/entities/campaign.entity";

export class UpdateCampaignStatusDto {
  @ApiProperty({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  status: CampaignStatus;
}
