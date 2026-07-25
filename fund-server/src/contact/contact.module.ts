import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";
import { ContactMessage } from "./entities/contact-message.entity";
import { ContactChatSession } from "./entities/contact-chat-session.entity";
import { ContactChatMessage } from "./entities/contact-chat-message.entity";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactMessage,
      ContactChatSession,
      ContactChatMessage,
    ]),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
