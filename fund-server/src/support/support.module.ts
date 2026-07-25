import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupportService } from "./support.service";
import { SupportController } from "./support.controller";
import { SupportTicket } from "./entities/support-ticket.entity";
import { HelpArticle } from "./entities/help-article.entity";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, HelpArticle]),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
