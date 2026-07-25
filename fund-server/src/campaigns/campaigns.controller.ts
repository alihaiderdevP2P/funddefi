import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { CreateCampaignUpdateDto } from "./dto/create-campaign-update.dto";
import { CampaignUpdate } from "./entities/campaign-update.entity";
import {
  Campaign,
  CampaignStatus,
  CampaignCategory,
} from "./entities/campaign.entity";
import { Reward } from "./entities/reward.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("campaigns")
@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new campaign" })
  @ApiResponse({
    status: 201,
    description: "Campaign created successfully",
    type: Campaign,
  })
  create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignsService.create(createCampaignDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Get all campaigns with optional filtering" })
  @ApiQuery({ name: "status", enum: CampaignStatus, required: false })
  @ApiQuery({ name: "category", enum: CampaignCategory, required: false })
  @ApiQuery({ name: "search", type: String, required: false })
  @ApiQuery({ name: "page", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiResponse({ status: 200, description: "Campaigns retrieved successfully" })
  findAll(
    @Query("status") status?: CampaignStatus,
    @Query("category") category?: CampaignCategory,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.campaignsService.findAll({
      status,
      category,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("featured")
  @ApiOperation({ summary: "Get featured campaigns" })
  @ApiResponse({
    status: 200,
    description: "Featured campaigns retrieved successfully",
    type: [Campaign],
  })
  getFeatured() {
    return this.campaignsService.getFeaturedCampaigns();
  }

  @Get("my-campaigns")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get campaigns created by current user" })
  @ApiResponse({
    status: 200,
    description: "User campaigns retrieved successfully",
    type: [Campaign],
  })
  getMyCampaigns(@Request() req) {
    return this.campaignsService.getCampaignsByCreator(req.user.id);
  }

  @Get("me/saved")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get campaigns saved by current user" })
  getSavedCampaigns(@Request() req) {
    return this.campaignsService.getSavedCampaigns(req.user.id);
  }

  @Get(":id/updates")
  @ApiOperation({ summary: "Get campaign updates" })
  @ApiResponse({ status: 200, type: [CampaignUpdate] })
  getUpdates(@Param("id") id: string) {
    return this.campaignsService.getCampaignUpdates(id);
  }

  @Post(":id/updates")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Post a campaign update (creator only)" })
  createUpdate(
    @Param("id") id: string,
    @Body() dto: CreateCampaignUpdateDto,
    @Request() req
  ) {
    return this.campaignsService.createCampaignUpdate(id, dto, req.user.id);
  }

  @Get(":id/save-status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Check if campaign is saved by current user" })
  getSaveStatus(@Param("id") id: string, @Request() req) {
    return this.campaignsService.getSaveStatus(id, req.user.id);
  }

  @Post(":id/save")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Save campaign to favorites" })
  saveCampaign(@Param("id") id: string, @Request() req) {
    return this.campaignsService.saveCampaign(id, req.user.id);
  }

  @Delete(":id/save")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove campaign from favorites" })
  unsaveCampaign(@Param("id") id: string, @Request() req) {
    return this.campaignsService.unsaveCampaign(id, req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get campaign by ID" })
  @ApiResponse({
    status: 200,
    description: "Campaign retrieved successfully",
    type: Campaign,
  })
  findOne(@Param("id") id: string, @Request() req) {
    // Locale is automatically set by I18nInterceptor from Accept-Language header
    const locale = (req.locale || "en") as "en" | "es" | "fr";
    return this.campaignsService.findOne(id, locale);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update campaign" })
  @ApiResponse({
    status: 200,
    description: "Campaign updated successfully",
    type: Campaign,
  })
  update(
    @Param("id") id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req
  ) {
    // Locale is automatically set by I18nInterceptor from Accept-Language header
    const locale = (req.locale || "en") as "en" | "es" | "fr";
    return this.campaignsService.update(
      id,
      updateCampaignDto,
      req.user.id,
      locale
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete campaign" })
  @ApiResponse({ status: 200, description: "Campaign deleted successfully" })
  remove(@Param("id") id: string, @Request() req) {
    return this.campaignsService.remove(id, req.user.id);
  }

  @Post(":id/rewards")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add reward to campaign" })
  @ApiResponse({
    status: 201,
    description: "Reward added successfully",
    type: Reward,
  })
  addReward(
    @Param("id") campaignId: string,
    @Body() createRewardDto: CreateRewardDto,
    @Request() req
  ) {
    return this.campaignsService.addReward(
      campaignId,
      createRewardDto,
      req.user.id
    );
  }
}
