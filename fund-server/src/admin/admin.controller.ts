import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UpdateCampaignStatusDto } from "./dto/update-campaign-status.dto";
import { UpdateModerationDto } from "./dto/update-moderation.dto";
import { CreateModerationReportDto } from "./dto/create-moderation-report.dto";
import { UpdateUserAdminDto } from "./dto/update-user-admin.dto";
import { CampaignStatus } from "../campaigns/entities/campaign.entity";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "superadmin")
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  @ApiOperation({ summary: "Platform-wide admin statistics" })
  getStats() {
    return this.adminService.getPlatformStats();
  }

  @Get("activity")
  @ApiOperation({ summary: "Recent platform activity feed" })
  @ApiQuery({ name: "limit", required: false })
  getActivity(@Query("limit") limit?: string) {
    return this.adminService.getRecentActivity(
      limit ? Number(limit) : 20
    );
  }

  @Get("health")
  @ApiOperation({ summary: "System health metrics" })
  getHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get("analytics")
  @ApiOperation({ summary: "Platform analytics for admin dashboard" })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get("campaigns")
  @ApiOperation({ summary: "List campaigns for admin management" })
  @ApiQuery({ name: "status", enum: CampaignStatus, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  listCampaigns(
    @Query("status") status?: CampaignStatus,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.adminService.listCampaignsForAdmin({
      status,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Patch("campaigns/:id/status")
  @ApiOperation({ summary: "Approve, reject, or change campaign status" })
  updateCampaignStatus(
    @Param("id") id: string,
    @Body() dto: UpdateCampaignStatusDto
  ) {
    return this.adminService.updateCampaignStatus(id, dto);
  }

  @Get("users")
  @ApiOperation({ summary: "List users for admin management" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "role", required: false })
  listUsers(
    @Query("search") search?: string,
    @Query("role") role?: string
  ) {
    return this.adminService.listUsers(search, role);
  }

  @Patch("users/:id")
  @ApiOperation({ summary: "Verify or suspend a user" })
  updateUser(@Param("id") id: string, @Body() dto: UpdateUserAdminDto) {
    return this.adminService.updateUserAdmin(id, dto);
  }

  @Get("moderation")
  @ApiOperation({ summary: "List moderation reports" })
  listModeration() {
    return this.adminService.listModerationReports();
  }

  @Post("moderation")
  @ApiOperation({ summary: "Create a moderation report" })
  createModeration(
    @Body() dto: CreateModerationReportDto,
    @Request() req
  ) {
    return this.adminService.createModerationReport(dto, req.user.id);
  }

  @Patch("moderation/:id")
  @ApiOperation({ summary: "Update moderation report" })
  updateModeration(
    @Param("id") id: string,
    @Body() dto: UpdateModerationDto,
    @Request() req
  ) {
    return this.adminService.updateModerationReport(id, dto, req.user.id);
  }

  @Post("moderation/:id/action")
  @ApiOperation({ summary: "Investigate or take action on flagged content" })
  takeAction(
    @Param("id") id: string,
    @Body() body: { action: "cancel_campaign" | "investigate" },
    @Request() req
  ) {
    return this.adminService.takeModerationAction(
      id,
      body.action,
      req.user.id
    );
  }
}
