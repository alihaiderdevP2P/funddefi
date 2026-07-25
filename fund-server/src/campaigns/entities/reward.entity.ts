import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Campaign } from "./campaign.entity";
import { Funding } from "../../funding/entities/funding.entity";

@Entity("rewards")
export class Reward extends BaseEntity {
  @ApiProperty({ description: "Reward title" })
  @Column()
  title: string;

  @ApiProperty({ description: "Reward description" })
  @Column("text")
  description: string;

  @ApiProperty({ description: "Minimum contribution amount in ETH" })
  @Column("decimal", { precision: 18, scale: 8, name: "min_amount" })
  minAmount: number;

  @ApiProperty({ description: "Estimated delivery date" })
  @Column({ nullable: true, name: "delivery_date" })
  deliveryDate: Date;

  @ApiProperty({ description: "Maximum number of backers for this reward" })
  @Column({ nullable: true, name: "max_backers" })
  maxBackers: number;

  @ApiProperty({ description: "Current number of backers" })
  @Column({ default: 0, name: "current_backers" })
  currentBackers: number;

  @ApiProperty({ description: "Reward image URL" })
  @Column({ nullable: true, name: "image_url" })
  imageUrl: string;

  @ApiProperty({ description: "Associated campaign", type: () => Campaign })
  @ManyToOne(() => Campaign, (campaign) => campaign.rewards, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @Column({ name: "campaign_id" })
  campaignId: string;

  @ApiProperty({ description: "Reward fundings", type: () => [Funding] })
  @OneToMany(() => Funding, (funding) => funding.reward)
  fundings: Funding[];
}
