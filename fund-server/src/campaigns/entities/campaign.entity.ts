import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { Funding } from "../../funding/entities/funding.entity";
import { Reward } from "./reward.entity";

export enum CampaignStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  FUNDED = "funded",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum CampaignCategory {
  TECHNOLOGY = "technology",
  CREATIVE = "creative",
  COMMUNITY = "community",
  BUSINESS = "business",
  ENVIRONMENT = "environment",
  HEALTH = "health",
  EDUCATION = "education",
}

@Entity("campaigns")
export class Campaign extends BaseEntity {
  @ApiProperty({ description: "Campaign title" })
  @Column()
  title: string;

  @ApiProperty({ description: "Campaign description" })
  @Column("text")
  description: string;

  @ApiProperty({ description: "Campaign short summary" })
  @Column("text")
  summary: string;

  @ApiProperty({ description: "Campaign funding goal in ETH" })
  @Column("decimal", { precision: 18, scale: 8, name: "goal_amount" })
  goalAmount: number;

  @ApiProperty({ description: "Current raised amount in ETH" })
  @Column("decimal", {
    precision: 18,
    scale: 8,
    default: 0,
    name: "raised_amount",
  })
  raisedAmount: number;

  @ApiProperty({ description: "Campaign end date" })
  @Column({ name: "end_date" })
  endDate: Date;

  @ApiProperty({ description: "Campaign status", enum: CampaignStatus })
  @Column({
    type: "enum",
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @ApiProperty({ description: "Campaign category", enum: CampaignCategory })
  @Column({
    type: "enum",
    enum: CampaignCategory,
  })
  category: CampaignCategory;

  @ApiProperty({ description: "Campaign main image URL" })
  @Column({ name: "image_url" })
  imageUrl: string;

  @ApiProperty({ description: "Campaign video URL" })
  @Column({ nullable: true, name: "video_url" })
  videoUrl: string;

  @ApiProperty({ description: "Smart contract address" })
  @Column({ nullable: true, name: "contract_address" })
  contractAddress: string;

  @ApiProperty({ description: "Number of backers" })
  @Column({ default: 0, name: "backers_count" })
  backersCount: number;

  @ApiProperty({ description: "Campaign creator", type: () => User })
  @ManyToOne(() => User, (user) => user.campaigns)
  @JoinColumn({ name: "creator_id" })
  creator: User;

  @Column({ name: "creator_id" })
  creatorId: string;

  @ApiProperty({ description: "Campaign fundings", type: () => [Funding] })
  @OneToMany(() => Funding, (funding) => funding.campaign)
  fundings: Funding[];

  @ApiProperty({ description: "Campaign rewards", type: () => [Reward] })
  @OneToMany(() => Reward, (reward) => reward.campaign, { cascade: true })
  rewards: Reward[];
}
