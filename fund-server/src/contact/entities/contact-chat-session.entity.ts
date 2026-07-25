import { Entity, Column, OneToMany } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { ContactChatMessage } from "./contact-chat-message.entity";

export enum ContactChatSessionStatus {
  ACTIVE = "active",
  CLOSED = "closed",
}

@Entity("contact_chat_sessions")
export class ContactChatSession extends BaseEntity {
  @ApiPropertyOptional()
  @Column({ name: "visitor_name", nullable: true })
  visitorName: string | null;

  @ApiPropertyOptional()
  @Column({ name: "visitor_email", nullable: true })
  visitorEmail: string | null;

  @ApiProperty({ enum: ContactChatSessionStatus })
  @Column({
    type: "enum",
    enum: ContactChatSessionStatus,
    default: ContactChatSessionStatus.ACTIVE,
  })
  status: ContactChatSessionStatus;

  @OneToMany(() => ContactChatMessage, (m) => m.session)
  messages: ContactChatMessage[];
}
