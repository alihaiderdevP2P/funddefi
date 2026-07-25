import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampaignsService } from "./campaigns.service";
import { CampaignsController } from "./campaigns.controller";
import { Campaign } from "./entities/campaign.entity";
import { Reward } from "./entities/reward.entity";
import { CampaignUpdate } from "./entities/campaign-update.entity";
import { SavedCampaign } from "./entities/saved-campaign.entity";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Reward, CampaignUpdate, SavedCampaign]),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
