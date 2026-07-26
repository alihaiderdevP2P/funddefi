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
import { NotificationsService } from "./notifications.service";
import {
  CreateNotificationDto,
  UpdateNotificationPreferencesDto,
} from "./dto/notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("preferences")
  @ApiOperation({ summary: "Get notification preferences (Settings tab)" })
  getPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Update notification preferences" })
  updatePreferences(
    @Request() req,
    @Body() dto: UpdateNotificationPreferencesDto
  ) {
    return this.notificationsService.updatePreferences(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List my notifications" })
  @ApiQuery({ name: "unreadOnly", required: false })
  @ApiQuery({ name: "limit", required: false })
  list(
    @Request() req,
    @Query("unreadOnly") unreadOnly?: string,
    @Query("limit") limit?: string
  ) {
    return this.notificationsService.list(
      req.user.id,
      unreadOnly === "true" || unreadOnly === "1",
      limit ? Number(limit) : 50
    );
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  markRead(@Request() req, @Param("id") id: string) {
    return this.notificationsService.markRead(req.user.id, id);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("admin", "superadmin")
  @ApiOperation({ summary: "Create a notification (admin)" })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }
}
