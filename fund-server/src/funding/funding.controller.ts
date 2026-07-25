import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
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
import { FundingService } from "./funding.service";
import { CreateFundingDto } from "./dto/create-funding.dto";
import { UpdateFundingDto } from "./dto/update-funding.dto";
import { Funding } from "./entities/funding.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("funding")
@Controller("funding")
export class FundingController {
  constructor(private readonly fundingService: FundingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new funding transaction" })
  @ApiResponse({
    status: 201,
    description: "Funding created successfully",
    type: Funding,
  })
  create(@Body() createFundingDto: CreateFundingDto, @Request() req) {
    return this.fundingService.create(createFundingDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all funding transactions" })
  @ApiQuery({ name: "userId", type: String, required: false })
  @ApiResponse({
    status: 200,
    description: "Fundings retrieved successfully",
    type: [Funding],
  })
  findAll(@Query("userId") userId?: string, @Request() req?) {
    // If userId is not provided and user is authenticated, show their fundings
    const targetUserId = userId || req?.user?.id;
    return this.fundingService.findAll(targetUserId);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get platform funding statistics" })
  @ApiResponse({
    status: 200,
    description: "Funding stats retrieved successfully",
  })
  getStats() {
    return this.fundingService.getPlatformStats();
  }

  @Get("my-fundings")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user funding history" })
  @ApiResponse({
    status: 200,
    description: "User fundings retrieved successfully",
    type: [Funding],
  })
  getMyFundings(@Request() req) {
    return this.fundingService.getFundingsByUser(req.user.id);
  }

  @Get("my-dashboard")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get aggregated dashboard analytics for current user" })
  @ApiResponse({
    status: 200,
    description: "Dashboard data retrieved successfully",
  })
  getMyDashboard(@Request() req) {
    return this.fundingService.getUserDashboard(req.user.id);
  }

  @Get("campaign/:campaignId")
  @ApiOperation({ summary: "Get fundings for a specific campaign" })
  @ApiResponse({
    status: 200,
    description: "Campaign fundings retrieved successfully",
    type: [Funding],
  })
  getFundingsByCampaign(@Param("campaignId") campaignId: string) {
    return this.fundingService.getFundingsByCampaign(campaignId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get funding by ID" })
  @ApiResponse({
    status: 200,
    description: "Funding retrieved successfully",
    type: Funding,
  })
  findOne(@Param("id") id: string) {
    return this.fundingService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update funding transaction" })
  @ApiResponse({
    status: 200,
    description: "Funding updated successfully",
    type: Funding,
  })
  update(@Param("id") id: string, @Body() updateFundingDto: UpdateFundingDto) {
    return this.fundingService.update(id, updateFundingDto);
  }
}
