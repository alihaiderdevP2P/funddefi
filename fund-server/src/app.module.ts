import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { FundingModule } from "./funding/funding.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { I18nModule } from "./i18n/i18n.module";
import { AppController } from "./app.controller";
import { StorageModule } from "./storage/storage.module";
import { AdminModule } from "./admin/admin.module";
import { BlogModule } from "./blog/blog.module";
import { CareersModule } from "./careers/careers.module";
import { SupportModule } from "./support/support.module";
import { ContactModule } from "./contact/contact.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host: process.env.DB_HOST || "localhost",
            port: Number.parseInt(process.env.DB_PORT || "5432", 10),
            username:
              process.env.DB_USERNAME || process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "password",
            database: process.env.DB_NAME || "crowdfunding",
            ssl:
              process.env.DB_SSL === "true" ||
              (process.env.DB_HOST || "").includes("supabase")
                ? { rejectUnauthorized: false }
                : false,
          }),
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: false, // Disabled to prevent schema conflicts
      logging: process.env.NODE_ENV === "development",
    }),
    I18nModule, // Internationalization module
    AuthModule,
    UsersModule,
    CampaignsModule,
    FundingModule,
    WebsocketModule, // Added WebSocket module
    StorageModule,
    AdminModule,
    BlogModule,
    CareersModule,
    SupportModule,
    ContactModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
