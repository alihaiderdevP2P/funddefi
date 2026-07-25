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
  Req,
} from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { BlogService } from "./blog.service";
import { NewsletterService } from "./newsletter.service";
import { CreateBlogPostDto } from "./dto/create-blog-post.dto";
import { UpdateBlogPostDto } from "./dto/update-blog-post.dto";
import { PublishBlogPostDto } from "./dto/publish-blog-post.dto";
import {
  SubscribeNewsletterDto,
  UnsubscribeNewsletterDto,
} from "./dto/subscribe-newsletter.dto";
import { BlogPost, BlogPostStatus } from "./entities/blog-post.entity";
import { NewsletterStatus } from "./entities/newsletter-subscriber.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("blog")
@Controller("blog")
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly newsletterService: NewsletterService
  ) {}

  @Get()
  @ApiOperation({ summary: "List published blog posts" })
  @ApiQuery({ name: "category", required: false })
  @ApiQuery({ name: "tag", required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  findAll(
    @Query("category") category?: string,
    @Query("tag") tag?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.blogService.findAll({
      category,
      tag,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("featured")
  @ApiOperation({ summary: "Get featured blog posts" })
  getFeatured() {
    return this.blogService.findFeatured();
  }

  @Get("categories")
  @ApiOperation({ summary: "Get all blog categories" })
  getCategories() {
    return this.blogService.getCategories();
  }

  @Get("tags")
  @ApiOperation({ summary: "Get all blog tags" })
  getTags() {
    return this.blogService.getTags();
  }

  @Post("newsletter/subscribe")
  @ApiOperation({ summary: "Subscribe to blog newsletter" })
  subscribeNewsletter(
    @Body() dto: SubscribeNewsletterDto,
    @Req() req: ExpressRequest
  ) {
    return this.newsletterService.subscribe(dto, {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  }

  @Post("newsletter/unsubscribe")
  @ApiOperation({ summary: "Unsubscribe from blog newsletter" })
  unsubscribeNewsletter(@Body() dto: UnsubscribeNewsletterDto) {
    return this.newsletterService.unsubscribe(dto);
  }

  @Get("newsletter/unsubscribe/:token")
  @ApiOperation({ summary: "One-click unsubscribe via email link token" })
  unsubscribeByToken(@Param("token") token: string) {
    return this.newsletterService.unsubscribeByToken(token);
  }

  @Get("newsletter/admin/subscribers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List newsletter subscribers (admin)" })
  @ApiQuery({ name: "status", enum: NewsletterStatus, required: false })
  @ApiQuery({ name: "search", required: false })
  getSubscribers(
    @Query("status") status?: NewsletterStatus,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.newsletterService.getSubscribers({
      status,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all blog posts (admin)" })
  @ApiQuery({ name: "status", enum: BlogPostStatus, required: false })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  findAllAdmin(
    @Query("status") status?: BlogPostStatus,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.blogService.findAll({
      status,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      includeDrafts: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a blog post (admin)" })
  @ApiResponse({ status: 201, type: BlogPost })
  create(@Body() dto: CreateBlogPostDto, @Request() req) {
    return this.blogService.create(dto, req.user.id);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get blog post by slug" })
  findBySlug(@Param("slug") slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post(":slug/like")
  @ApiOperation({ summary: "Like a blog post" })
  like(@Param("slug") slug: string) {
    return this.blogService.like(slug);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a blog post (admin)" })
  update(@Param("id") id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Patch(":id/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Publish or unpublish a blog post" })
  publish(@Param("id") id: string, @Body() dto: PublishBlogPostDto) {
    return this.blogService.publish(id, dto.publish !== false);
  }

  @Patch(":id/archive")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Archive a blog post" })
  archive(@Param("id") id: string) {
    return this.blogService.archive(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a blog post" })
  remove(@Param("id") id: string) {
    return this.blogService.remove(id);
  }
}
