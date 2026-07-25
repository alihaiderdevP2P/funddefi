import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { SupportService } from "./support.service";
import { SubmitSupportTicketDto } from "./dto/submit-support-ticket.dto";
import { UpdateSupportTicketDto } from "./dto/update-support-ticket.dto";
import {
  SupportTicketStatus,
  SupportTicketPriority,
} from "./entities/support-ticket.entity";
import { HelpArticleCategory } from "./entities/help-article.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("support")
@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get("categories")
  @ApiOperation({ summary: "Get help categories with articles" })
  getCategories() {
    return this.supportService.getCategories();
  }

  @Get("articles")
  @ApiOperation({ summary: "List help articles" })
  @ApiQuery({ name: "category", enum: HelpArticleCategory, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getArticles(
    @Query("category") category?: HelpArticleCategory,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.supportService.getArticles({
      category,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("articles/:slug")
  @ApiOperation({ summary: "Get help article by slug" })
  getArticleBySlug(@Param("slug") slug: string) {
    return this.supportService.getArticleBySlug(slug);
  }

  @Get("search")
  @ApiOperation({ summary: "Search help articles" })
  @ApiQuery({ name: "q", required: true })
  search(@Query("q") q: string) {
    return this.supportService.searchAll(q);
  }

  @Post("tickets")
  @ApiOperation({ summary: "Submit a support ticket" })
  submitTicket(@Body() dto: SubmitSupportTicketDto, @Request() req) {
    if (req.user?.id && !dto.userId) {
      dto.userId = req.user.id;
    }
    return this.supportService.submitTicket(dto);
  }

  @Get("tickets/:ticketNumber")
  @ApiOperation({ summary: "Get ticket status by ticket number" })
  getTicket(@Param("ticketNumber") ticketNumber: string) {
    return this.supportService.getTicketByNumber(ticketNumber);
  }

  @Get("admin/tickets")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List support tickets (admin)" })
  @ApiQuery({ name: "status", enum: SupportTicketStatus, required: false })
  @ApiQuery({ name: "priority", enum: SupportTicketPriority, required: false })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getTicketsAdmin(
    @Query("status") status?: SupportTicketStatus,
    @Query("priority") priority?: SupportTicketPriority,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.supportService.getTickets({
      status,
      priority,
      category,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Patch("admin/tickets/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update support ticket (admin)" })
  updateTicket(@Param("id") id: string, @Body() dto: UpdateSupportTicketDto) {
    return this.supportService.updateTicket(id, dto);
  }
}
