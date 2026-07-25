import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ContactMessageStatus } from "../entities/contact-message.entity";

export class UpdateContactMessageStatusDto {
  @ApiProperty({ enum: ContactMessageStatus })
  @IsEnum(ContactMessageStatus)
  status: ContactMessageStatus;
}
