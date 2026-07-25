import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";

export enum SupportTicketCategory {
  GENERAL = "general",
  TECHNICAL = "technical",
  CAMPAIGN = "campaign",
  PAYMENT = "payment",
  BUG = "bug",
  FEATURE = "feature",
}

export enum SupportTicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum SupportTicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

@Entity("support_tickets")
export class SupportTicket extends BaseEntity {
  @ApiProperty({ description: "Human-readable ticket number" })
  @Column({ name: "ticket_number", unique: true })
  ticketNumber: string;

  @ApiProperty({ description: "Submitter full name" })
  @Column({ name: "full_name" })
  fullName: string;

  @ApiProperty({ description: "Submitter email" })
  @Column()
  email: string;

  @ApiProperty({ enum: SupportTicketCategory })
  @Column({ type: "enum", enum: SupportTicketCategory })
  category: SupportTicketCategory;

  @ApiProperty({ enum: SupportTicketPriority })
  @Column({ type: "enum", enum: SupportTicketPriority })
  priority: SupportTicketPriority;

  @ApiProperty({ description: "Ticket subject" })
  @Column()
  subject: string;

  @ApiProperty({ description: "Detailed description" })
  @Column({ type: "text" })
  description: string;

  @ApiProperty({ enum: SupportTicketStatus })
  @Column({
    type: "enum",
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
  })
  status: SupportTicketStatus;

  @ApiProperty({ description: "Optional linked user ID" })
  @Column({ name: "user_id", nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user: User | null;

  @ApiProperty({ description: "Assigned support agent" })
  @Column({ name: "assigned_to", nullable: true })
  assignedTo: string | null;
}
