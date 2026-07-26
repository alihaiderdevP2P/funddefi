import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { Notification } from "./entities/notification.entity";
import { NotificationPreferences } from "./entities/notification-preferences.entity";
import { User } from "../users/entities/user.entity";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreferences, User]),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
