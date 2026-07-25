import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Campaign } from "./campaign.entity";
import { User } from "../../users/entities/user.entity";

@Entity("campaign_updates")
export class CampaignUpdate extends BaseEntity {
  @ApiProperty({ description: "Update title" })
  @Column()
  title: string;

  @ApiProperty({ description: "Update body" })
  @Column("text")
  content: string;

  @Column({ name: "campaign_id" })
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: "CASCADE" })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;

  @Column({ name: "author_id" })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;
}
