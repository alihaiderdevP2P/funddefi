import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Campaign } from "../../campaigns/entities/campaign.entity";
import { Funding } from "../../funding/entities/funding.entity";

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty({ description: "User email address" })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: "User full name" })
  @Column()
  name: string;

  @Column()
  password: string;

  @ApiProperty({ description: "User wallet address" })
  @Column({ nullable: true, name: "wallet_address" })
  walletAddress: string;

  @ApiProperty({ description: "User avatar URL" })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ description: "User bio" })
  @Column({ type: "text", nullable: true })
  bio: string;

  @ApiProperty({ description: "User verification status" })
  @Column({ default: false, name: "is_verified" })
  isVerified: boolean;

  @ApiProperty({ description: "Account suspended by admin" })
  @Column({ default: false, name: "is_suspended" })
  isSuspended: boolean;

  @ApiProperty({
    description: "User role",
    enum: ["user", "admin", "superadmin"],
  })
  @Column({ default: "user" })
  role: "user" | "admin" | "superadmin";

  @ApiProperty({ description: "User campaigns", type: () => [Campaign] })
  @OneToMany(() => Campaign, (campaign) => campaign.creator)
  campaigns: Campaign[];

  @ApiProperty({ description: "User fundings", type: () => [Funding] })
  @OneToMany(() => Funding, (funding) => funding.user)
  fundings: Funding[];
}
