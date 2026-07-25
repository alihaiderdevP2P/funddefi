import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { JobPosting } from "./job-posting.entity";

export enum JobApplicationStatus {
  NEW = "new",
  REVIEWED = "reviewed",
  SHORTLISTED = "shortlisted",
  REJECTED = "rejected",
  HIRED = "hired",
}

@Entity("job_applications")
export class JobApplication extends BaseEntity {
  @Column({ name: "job_posting_id" })
  jobPostingId: string;

  @ManyToOne(() => JobPosting, (posting) => posting.applications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "job_posting_id" })
  jobPosting: JobPosting;

  @ApiProperty({ description: "Applicant full name" })
  @Column({ name: "full_name" })
  fullName: string;

  @ApiProperty({ description: "Applicant email" })
  @Column()
  email: string;

  @ApiProperty({ description: "Phone number" })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: "LinkedIn profile URL" })
  @Column({ nullable: true })
  linkedin: string;

  @ApiProperty({ description: "GitHub profile URL" })
  @Column({ nullable: true })
  github: string;

  @ApiProperty({ description: "Portfolio website URL" })
  @Column({ nullable: true })
  portfolio: string;

  @ApiProperty({ description: "Resume file URL" })
  @Column({ name: "resume_url" })
  resumeUrl: string;

  @ApiProperty({ description: "Cover letter text" })
  @Column({ name: "cover_letter", type: "text" })
  coverLetter: string;

  @ApiProperty({ enum: JobApplicationStatus })
  @Column({
    type: "enum",
    enum: JobApplicationStatus,
    default: JobApplicationStatus.NEW,
  })
  status: JobApplicationStatus;
}
