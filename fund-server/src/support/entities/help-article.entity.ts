import { Entity, Column } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";

export enum HelpArticleCategory {
  GENERAL = "general",
  TECHNICAL = "technical",
  CAMPAIGNS = "campaigns",
  PAYMENTS = "payments",
}

export enum HelpArticleStatus {
  PUBLISHED = "published",
  DRAFT = "draft",
}

@Entity("help_articles")
export class HelpArticle extends BaseEntity {
  @ApiProperty({ description: "URL-friendly slug" })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: "Article title" })
  @Column()
  title: string;

  @ApiProperty({ description: "Article content (markdown supported)" })
  @Column({ type: "text" })
  content: string;

  @ApiProperty({ description: "Short summary for listings" })
  @Column({ type: "text", nullable: true })
  summary: string | null;

  @ApiProperty({ enum: HelpArticleCategory })
  @Column({ type: "enum", enum: HelpArticleCategory })
  category: HelpArticleCategory;

  @ApiProperty({ enum: HelpArticleStatus })
  @Column({
    type: "enum",
    enum: HelpArticleStatus,
    default: HelpArticleStatus.PUBLISHED,
  })
  status: HelpArticleStatus;

  @ApiProperty({ description: "Display order within category" })
  @Column({ name: "sort_order", default: 0 })
  sortOrder: number;
}
