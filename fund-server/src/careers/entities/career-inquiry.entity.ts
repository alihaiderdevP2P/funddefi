import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

export enum CareerInquiryStatus {
  NEW = "new",
  REVIEWED = "reviewed",
  RESOLVED = "resolved",
}

@Entity("career_inquiries")
export class CareerInquiry extends BaseEntity {
  @ApiProperty({ description: "Inquirer full name" })
  @Column({ name: "full_name" })
  fullName: string;

  @ApiProperty({ description: "Inquirer email" })
  @Column()
  email: string;

  @ApiProperty({ description: "Role of interest" })
  @Column({ name: "interested_role" })
  interestedRole: string;

  @ApiProperty({ description: "Message" })
  @Column({ type: "text" })
  message: string;

  @ApiProperty({ enum: CareerInquiryStatus })
  @Column({
    type: "enum",
    enum: CareerInquiryStatus,
    default: CareerInquiryStatus.NEW,
  })
  status: CareerInquiryStatus;
}
