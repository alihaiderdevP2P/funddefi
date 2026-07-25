import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WebsocketGateway } from "./websocket.gateway";
import { WsJwtGuard } from "./guards/ws-jwt.guard";
import { CampaignsModule } from "../campaigns/campaigns.module";
import { FundingModule } from "../funding/funding.module";

@Module({
  imports: [
    forwardRef(() => CampaignsModule),
    forwardRef(() => FundingModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [WebsocketGateway, WsJwtGuard],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
