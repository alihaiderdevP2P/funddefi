import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { Campaign } from "./campaign.entity";
import { User } from "../../users/entities/user.entity";

@Entity("saved_campaigns")
@Unique(["userId", "campaignId"])
export class SavedCampaign extends BaseEntity {
  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ApiProperty({ description: "Saved campaign ID" })
  @Column({ name: "campaign_id" })
  campaignId: string;

  @ManyToOne(() => Campaign, { onDelete: "CASCADE" })
  @JoinColumn({ name: "campaign_id" })
  campaign: Campaign;
}
