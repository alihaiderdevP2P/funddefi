import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { CareersService } from "./careers.service";
import { CreateJobPostingDto } from "./dto/create-job-posting.dto";
import { UpdateJobPostingDto } from "./dto/update-job-posting.dto";
import { PublishJobPostingDto } from "./dto/publish-job-posting.dto";
import { SubmitJobApplicationDto } from "./dto/submit-job-application.dto";
import { SubmitCareerInquiryDto } from "./dto/submit-career-inquiry.dto";
import { UpdateApplicationStatusDto } from "./dto/update-application-status.dto";
import {
  JobPosting,
  JobPostingStatus,
} from "./entities/job-posting.entity";
import { JobApplicationStatus } from "./entities/job-application.entity";
import { CareerInquiryStatus } from "./entities/career-inquiry.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("careers")
@Controller("careers")
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @ApiOperation({ summary: "List published job openings" })
  @ApiQuery({ name: "department", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  findAll(
    @Query("department") department?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.careersService.findAll({
      department,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("departments")
  @ApiOperation({ summary: "Get all job departments" })
  getDepartments() {
    return this.careersService.getDepartments();
  }

  @Post("inquiries")
  @ApiOperation({ summary: "Submit a general career inquiry" })
  submitInquiry(@Body() dto: SubmitCareerInquiryDto) {
    return this.careersService.submitInquiry(dto);
  }

  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all job postings (admin)" })
  @ApiQuery({ name: "status", enum: JobPostingStatus, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  findAllAdmin(
    @Query("status") status?: JobPostingStatus,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.careersService.findAll({
      status,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      includeDrafts: true,
    });
  }

  @Get("admin/applications")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List job applications (admin)" })
  @ApiQuery({ name: "jobPostingId", required: false })
  @ApiQuery({ name: "status", enum: JobApplicationStatus, required: false })
  getApplications(
    @Query("jobPostingId") jobPostingId?: string,
    @Query("status") status?: JobApplicationStatus,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.careersService.getApplications({
      jobPostingId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("admin/inquiries")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List career inquiries (admin)" })
  @ApiQuery({ name: "status", enum: CareerInquiryStatus, required: false })
  getInquiries(
    @Query("status") status?: CareerInquiryStatus,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.careersService.getInquiries({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a job posting (admin)" })
  @ApiResponse({ status: 201, type: JobPosting })
  create(@Body() dto: CreateJobPostingDto, @Request() req) {
    return this.careersService.create(dto, req.user.id);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get job posting by slug" })
  findBySlug(@Param("slug") slug: string) {
    return this.careersService.findBySlug(slug);
  }

  @Post(":id/apply")
  @ApiOperation({ summary: "Submit a job application" })
  submitApplication(
    @Param("id") id: string,
    @Body() dto: SubmitJobApplicationDto
  ) {
    return this.careersService.submitApplication(id, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a job posting (admin)" })
  update(@Param("id") id: string, @Body() dto: UpdateJobPostingDto) {
    return this.careersService.update(id, dto);
  }

  @Patch(":id/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Publish or unpublish a job posting" })
  publish(@Param("id") id: string, @Body() dto: PublishJobPostingDto) {
    return this.careersService.publish(id, dto.publish !== false);
  }

  @Patch(":id/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Close a job posting" })
  close(@Param("id") id: string) {
    return this.careersService.close(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a job posting" })
  remove(@Param("id") id: string) {
    return this.careersService.remove(id);
  }

  @Patch("admin/applications/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update application status" })
  updateApplicationStatus(
    @Param("id") id: string,
    @Body() dto: UpdateApplicationStatusDto
  ) {
    return this.careersService.updateApplicationStatus(id, dto.status);
  }

  @Patch("admin/inquiries/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update inquiry status" })
  updateInquiryStatus(
    @Param("id") id: string,
    @Body() body: { status: CareerInquiryStatus }
  ) {
    return this.careersService.updateInquiryStatus(id, body.status);
  }
}
