import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { JobApplication } from "./job-application.entity";

export enum JobPostingStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
}

@Entity("job_postings")
export class JobPosting extends BaseEntity {
  @ApiProperty({ description: "URL-friendly slug" })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: "Job title" })
  @Column()
  title: string;

  @ApiProperty({ description: "Department" })
  @Column({ default: "Engineering" })
  department: string;

  @ApiProperty({ description: "Location" })
  @Column({ default: "Remote" })
  location: string;

  @ApiProperty({ description: "Employment type" })
  @Column({ name: "job_type", default: "Full-time" })
  jobType: string;

  @ApiProperty({ description: "Job description" })
  @Column({ type: "text" })
  description: string;

  @ApiProperty({ description: "Requirements list" })
  @Column("text", { array: true, default: [] })
  requirements: string[];

  @ApiProperty({ enum: JobPostingStatus })
  @Column({
    type: "enum",
    enum: JobPostingStatus,
    default: JobPostingStatus.DRAFT,
  })
  status: JobPostingStatus;

  @Column({ name: "author_id", nullable: true })
  authorId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "author_id" })
  author: User;

  @ApiProperty({ description: "Publication timestamp" })
  @Column({ name: "published_at", type: "timestamp", nullable: true })
  publishedAt: Date | null;

  @ApiProperty({ description: "Application deadline" })
  @Column({ name: "closes_at", type: "timestamp", nullable: true })
  closesAt: Date | null;

  @OneToMany(() => JobApplication, (app) => app.jobPosting)
  applications: JobApplication[];
}
