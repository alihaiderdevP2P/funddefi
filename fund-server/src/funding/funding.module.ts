import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FundingService } from "./funding.service";
import { FundingController } from "./funding.controller";
import { Funding } from "./entities/funding.entity";
import { CampaignsModule } from "../campaigns/campaigns.module";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Funding]),
    forwardRef(() => CampaignsModule),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [FundingController],
  providers: [FundingService],
  exports: [FundingService],
})
export class FundingModule {}
