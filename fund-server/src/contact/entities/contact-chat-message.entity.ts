import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity } from "../../common/entities/base.entity";
import { ContactChatSession } from "./contact-chat-session.entity";

export enum ContactChatSender {
  VISITOR = "visitor",
  AGENT = "agent",
  SYSTEM = "system",
}

@Entity("contact_chat_messages")
export class ContactChatMessage extends BaseEntity {
  @ApiProperty()
  @Column({ name: "session_id" })
  sessionId: string;

  @ManyToOne(() => ContactChatSession, (s) => s.messages, { onDelete: "CASCADE" })
  @JoinColumn({ name: "session_id" })
  session: ContactChatSession;

  @ApiProperty({ enum: ContactChatSender })
  @Column({ type: "enum", enum: ContactChatSender })
  sender: ContactChatSender;

  @ApiProperty()
  @Column({ type: "text" })
  content: string;
}
