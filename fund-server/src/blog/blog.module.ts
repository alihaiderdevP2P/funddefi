import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogService } from "./blog.service";
import { BlogController } from "./blog.controller";
import { BlogPost } from "./entities/blog-post.entity";
import { NewsletterSubscriber } from "./entities/newsletter-subscriber.entity";
import { WebsocketModule } from "../websocket/websocket.module";
import { NewsletterService } from "./newsletter.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogPost, NewsletterSubscriber]),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [BlogController],
  providers: [BlogService, NewsletterService],
  exports: [BlogService, NewsletterService],
})
export class BlogModule {}
