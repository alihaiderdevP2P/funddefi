import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CareersService } from "./careers.service";
import { CareersController } from "./careers.controller";
import { JobPosting } from "./entities/job-posting.entity";
import { JobApplication } from "./entities/job-application.entity";
import { CareerInquiry } from "./entities/career-inquiry.entity";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPosting, JobApplication, CareerInquiry]),
    forwardRef(() => WebsocketModule),
  ],
  controllers: [CareersController],
  providers: [CareersService],
  exports: [CareersService],
})
export class CareersModule {}
