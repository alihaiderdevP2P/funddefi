import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ModerationReport } from "./entities/moderation-report.entity";
import { User } from "../users/entities/user.entity";
import { Campaign } from "../campaigns/entities/campaign.entity";
import { Funding } from "../funding/entities/funding.entity";
import { CampaignsModule } from "../campaigns/campaigns.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModerationReport,
      User,
      Campaign,
      Funding,
    ]),
    CampaignsModule,
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
