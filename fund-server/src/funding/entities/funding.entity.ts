import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { Campaign } from "../../campaigns/entities/campaign.entity";
import { Reward } from "../../campaigns/entities/reward.entity";

export enum FundingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("fundings")
export class Funding extends BaseEntity {
  @ApiProperty({ description: "Funding amount in ETH" })
  @Column("decimal", { precision: 18, scale: 8 })
  amount: number;

  @ApiProperty({ description: "Transaction hash" })
  @Column({ name: "transaction_hash" })
  transactionHash: string;

  @ApiProperty({ description: "Funding status", enum: FundingStatus })
  @Column({
    type: "enum",
    enum: FundingStatus,
    default: FundingStatus.PENDING,
  })
  status: FundingStatus;

  @ApiProperty({ description: "Backer message" })
  @Column("text", { nullable: true })
  message: string;

  @ApiProperty({ description: "Backer information" })
  @Column("jsonb", { nullable: true, name: "backer_info" })
  backerInfo: {
    name?: string;
    email?: string;
    address?: string;
  };

  @ApiProperty({ description: "Funding user", type: () => User })
  @ManyToOne(() => User, (user) => user.fundings)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "user_id" })
  userId: string;

  @ApiProperty({ description: "Funding campaign", type: () => Campaign })
  @ManyToOne(() => Campaign, (campaign) => campaign.fundings)
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @Column({ name: "campaign_id" })
  campaignId: string;

  @ApiProperty({
    description: "Selected reward",
    type: () => Reward,
    required: false,
  })
  @ManyToOne(() => Reward, (reward) => reward.fundings, { nullable: true })
  @JoinColumn({ name: "reward_id" })
  reward: Reward;

  @Column({ nullable: true, name: "reward_id" })
  rewardId: string;
}
