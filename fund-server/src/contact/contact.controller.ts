import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { ContactService } from "./contact.service";
import { SubmitContactMessageDto } from "./dto/submit-contact-message.dto";
import {
  CreateChatSessionDto,
  SendChatMessageDto,
} from "./dto/send-chat-message.dto";
import { UpdateContactMessageStatusDto } from "./dto/update-contact-message-status.dto";
import { ContactMessageStatus } from "./entities/contact-message.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("contact")
@Controller("contact")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get("config")
  @ApiOperation({ summary: "Public contact page configuration" })
  getConfig() {
    return this.contactService.getConfig();
  }

  @Post("messages")
  @ApiOperation({ summary: "Submit a contact form message" })
  submitMessage(@Body() dto: SubmitContactMessageDto) {
    return this.contactService.submitMessage(dto);
  }

  @Post("chat/sessions")
  @ApiOperation({ summary: "Start a live chat session" })
  createChatSession(@Body() dto: CreateChatSessionDto) {
    return this.contactService.createChatSession(dto);
  }

  @Get("chat/sessions/:id")
  @ApiOperation({ summary: "Get chat session messages" })
  getChatSession(@Param("id") id: string) {
    return this.contactService.getChatSession(id);
  }

  @Post("chat/sessions/:id/messages")
  @ApiOperation({ summary: "Send a message in a chat session" })
  sendChatMessage(
    @Param("id") id: string,
    @Body() dto: SendChatMessageDto
  ) {
    return this.contactService.sendChatMessage(id, dto);
  }

  @Get("admin/messages")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List contact messages (admin)" })
  @ApiQuery({ name: "status", enum: ContactMessageStatus, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getMessagesAdmin(
    @Query("status") status?: ContactMessageStatus,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.contactService.getMessagesAdmin({
      status,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Patch("admin/messages/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update contact message status (admin)" })
  updateMessageStatus(
    @Param("id") id: string,
    @Body() dto: UpdateContactMessageStatusDto
  ) {
    return this.contactService.updateMessageStatus(id, dto.status);
  }

  @Get("admin/chat/sessions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List chat sessions (admin)" })
  getChatSessionsAdmin(
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.contactService.getChatSessionsAdmin({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
