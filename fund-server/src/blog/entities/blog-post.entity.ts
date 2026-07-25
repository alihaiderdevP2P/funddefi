import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";

export enum BlogPostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

@Entity("blog_posts")
export class BlogPost extends BaseEntity {
  @ApiProperty({ description: "URL-friendly slug" })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: "Post title" })
  @Column()
  title: string;

  @ApiProperty({ description: "Short excerpt" })
  @Column({ type: "text", nullable: true })
  excerpt: string;

  @ApiProperty({ description: "Full post content (markdown supported)" })
  @Column({ type: "text" })
  content: string;

  @Column({ name: "author_id" })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @ApiProperty({ description: "Post category" })
  @Column({ default: "Technology" })
  category: string;

  @ApiProperty({ description: "Tags array" })
  @Column("text", { array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: "Featured image URL" })
  @Column({ name: "image_url", nullable: true })
  imageUrl: string;

  @ApiProperty({ enum: BlogPostStatus })
  @Column({
    type: "enum",
    enum: BlogPostStatus,
    default: BlogPostStatus.DRAFT,
  })
  status: BlogPostStatus;

  @ApiProperty({ description: "Featured on blog homepage" })
  @Column({ default: false })
  featured: boolean;

  @ApiProperty({ description: "View count" })
  @Column({ default: 0 })
  views: number;

  @ApiProperty({ description: "Like count" })
  @Column({ default: 0 })
  likes: number;

  @ApiProperty({ description: "Estimated read time in minutes" })
  @Column({ name: "read_time_minutes", default: 5 })
  readTimeMinutes: number;

  @ApiProperty({ description: "Publication timestamp" })
  @Column({ name: "published_at", type: "timestamp", nullable: true })
  publishedAt: Date | null;
}
