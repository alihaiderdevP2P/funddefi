import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  JobPosting,
  JobPostingStatus,
} from "./entities/job-posting.entity";
import {
  JobApplication,
  JobApplicationStatus,
} from "./entities/job-application.entity";
import {
  CareerInquiry,
  CareerInquiryStatus,
} from "./entities/career-inquiry.entity";
import { CreateJobPostingDto } from "./dto/create-job-posting.dto";
import { UpdateJobPostingDto } from "./dto/update-job-posting.dto";
import { SubmitJobApplicationDto } from "./dto/submit-job-application.dto";
import { SubmitCareerInquiryDto } from "./dto/submit-career-inquiry.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";

export interface JobPostingResponse {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  description: string;
  requirements: string[];
  status: JobPostingStatus;
  publishedAt: string | null;
  closesAt: string | null;
  posted: string;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationResponse {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  resumeUrl: string;
  coverLetter: string;
  status: JobApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CareerInquiryResponse {
  id: string;
  fullName: string;
  email: string;
  interestedRole: string;
  message: string;
  status: CareerInquiryStatus;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(JobPosting)
    private jobPostingRepository: Repository<JobPosting>,
    @InjectRepository(JobApplication)
    private applicationRepository: Repository<JobApplication>,
    @InjectRepository(CareerInquiry)
    private inquiryRepository: Repository<CareerInquiry>,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway
  ) {}

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.jobPostingRepository.findOne({
        where: { slug },
      });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private formatPostedDate(date: Date | null): string {
    if (!date) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    }
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  private async mapPosting(
    post: JobPosting,
    includeApplicationCount = true
  ): Promise<JobPostingResponse> {
    let applicationCount = 0;
    if (includeApplicationCount) {
      applicationCount = await this.applicationRepository.count({
        where: { jobPostingId: post.id },
      });
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      department: post.department,
      location: post.location,
      jobType: post.jobType,
      description: post.description,
      requirements: post.requirements || [],
      status: post.status,
      publishedAt: post.publishedAt?.toISOString() || null,
      closesAt: post.closesAt?.toISOString() || null,
      posted: this.formatPostedDate(post.publishedAt || post.createdAt),
      applicationCount,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  private mapApplication(app: JobApplication): JobApplicationResponse {
    return {
      id: app.id,
      jobPostingId: app.jobPostingId,
      jobTitle: app.jobPosting?.title || "",
      fullName: app.fullName,
      email: app.email,
      phone: app.phone || null,
      linkedin: app.linkedin || null,
      github: app.github || null,
      portfolio: app.portfolio || null,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  }

  private mapInquiry(inquiry: CareerInquiry): CareerInquiryResponse {
    return {
      id: inquiry.id,
      fullName: inquiry.fullName,
      email: inquiry.email,
      interestedRole: inquiry.interestedRole,
      message: inquiry.message,
      status: inquiry.status,
      createdAt: inquiry.createdAt.toISOString(),
      updatedAt: inquiry.updatedAt.toISOString(),
    };
  }

  async findAll(options?: {
    status?: JobPostingStatus;
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeDrafts?: boolean;
  }): Promise<{ jobs: JobPostingResponse[]; total: number }> {
    const {
      status,
      department,
      search,
      page = 1,
      limit = 20,
      includeDrafts = false,
    } = options || {};

    const queryBuilder =
      this.jobPostingRepository.createQueryBuilder("job");

    if (!includeDrafts) {
      queryBuilder.andWhere("job.status = :published", {
        published: JobPostingStatus.PUBLISHED,
      });
      queryBuilder.andWhere(
        "(job.closes_at IS NULL OR job.closes_at > :now)",
        { now: new Date() }
      );
    } else if (status) {
      queryBuilder.andWhere("job.status = :status", { status });
    }

    if (department) {
      queryBuilder.andWhere("job.department = :department", { department });
    }

    if (search) {
      queryBuilder.andWhere(
        "(job.title ILIKE :search OR job.description ILIKE :search OR job.department ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy("job.publishedAt", "DESC", "NULLS LAST")
      .addOrderBy("job.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    const mapped = await Promise.all(
      jobs.map((j) => this.mapPosting(j, !includeDrafts))
    );

    return { jobs: mapped, total };
  }

  async findBySlug(slug: string): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findOne({ where: { slug } });

    if (!job || job.status !== JobPostingStatus.PUBLISHED) {
      throw new NotFoundException("Job posting not found");
    }

    if (job.closesAt && job.closesAt < new Date()) {
      throw new NotFoundException("This position is no longer accepting applications");
    }

    return this.mapPosting(job, false);
  }

  async findById(id: string): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Job posting not found");
    }

    return this.mapPosting(job);
  }

  async getDepartments(): Promise<string[]> {
    const result = await this.jobPostingRepository
      .createQueryBuilder("job")
      .select("DISTINCT job.department", "department")
      .where("job.status = :status", { status: JobPostingStatus.PUBLISHED })
      .orderBy("job.department", "ASC")
      .getRawMany();

    return result.map((r) => r.department).filter(Boolean);
  }

  async create(
    dto: CreateJobPostingDto,
    authorId: string
  ): Promise<JobPostingResponse> {
    const baseSlug = dto.slug || this.slugify(dto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const job = this.jobPostingRepository.create({
      title: dto.title,
      slug,
      department: dto.department || "Engineering",
      location: dto.location || "Remote",
      jobType: dto.jobType || "Full-time",
      description: dto.description,
      requirements: dto.requirements || [],
      status: dto.status || JobPostingStatus.DRAFT,
      authorId,
      publishedAt:
        dto.status === JobPostingStatus.PUBLISHED ? new Date() : null,
      closesAt: dto.closesAt ? new Date(dto.closesAt) : null,
    });

    const saved = await this.jobPostingRepository.save(job);
    const full = await this.findById(saved.id);

    if (saved.status === JobPostingStatus.PUBLISHED) {
      await this.broadcastJobEvent("published", full);
    }

    return full;
  }

  async update(id: string, dto: UpdateJobPostingDto): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Job posting not found");
    }

    if (dto.title && dto.title !== job.title && !dto.slug) {
      job.slug = await this.ensureUniqueSlug(this.slugify(dto.title), id);
    }

    if (dto.slug && dto.slug !== job.slug) {
      job.slug = await this.ensureUniqueSlug(this.slugify(dto.slug), id);
    }

    if (dto.title !== undefined) job.title = dto.title;
    if (dto.department !== undefined) job.department = dto.department;
    if (dto.location !== undefined) job.location = dto.location;
    if (dto.jobType !== undefined) job.jobType = dto.jobType;
    if (dto.description !== undefined) job.description = dto.description;
    if (dto.requirements !== undefined) job.requirements = dto.requirements;
    if (dto.closesAt !== undefined) {
      job.closesAt = dto.closesAt ? new Date(dto.closesAt) : null;
    }

    await this.jobPostingRepository.save(job);
    const full = await this.findById(id);
    await this.broadcastJobEvent("updated", full);
    return full;
  }

  async publish(id: string, publish: boolean): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Job posting not found");
    }

    if (publish) {
      job.status = JobPostingStatus.PUBLISHED;
      job.publishedAt = job.publishedAt || new Date();
    } else {
      job.status = JobPostingStatus.DRAFT;
    }

    await this.jobPostingRepository.save(job);
    const full = await this.findById(id);
    await this.broadcastJobEvent(publish ? "published" : "unpublished", full);

    if (publish) {
      await this.websocketGateway.broadcastGlobalNotification({
        type: "info",
        title: "New Job Opening",
        message: full.title,
        data: { slug: full.slug, jobId: full.id },
      });
    }

    return full;
  }

  async close(id: string): Promise<JobPostingResponse> {
    const job = await this.jobPostingRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Job posting not found");
    }

    job.status = JobPostingStatus.CLOSED;
    await this.jobPostingRepository.save(job);
    const full = await this.findById(id);
    await this.broadcastJobEvent("closed", full);
    return full;
  }

  async remove(id: string): Promise<void> {
    const job = await this.jobPostingRepository.findOne({ where: { id } });

    if (!job) {
      throw new NotFoundException("Job posting not found");
    }

    await this.jobPostingRepository.remove(job);
    this.websocketGateway.broadcastCareersUpdate({
      type: "deleted",
      job: { id, slug: job.slug },
    });
  }

  async submitApplication(
    jobId: string,
    dto: SubmitJobApplicationDto
  ): Promise<{ id: string; message: string }> {
    const job = await this.jobPostingRepository.findOne({
      where: { id: jobId },
    });

    if (!job || job.status !== JobPostingStatus.PUBLISHED) {
      throw new NotFoundException("Job posting not found or not accepting applications");
    }

    if (job.closesAt && job.closesAt < new Date()) {
      throw new BadRequestException("This position is no longer accepting applications");
    }

    const application = this.applicationRepository.create({
      jobPostingId: jobId,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      linkedin: dto.linkedin,
      github: dto.github,
      portfolio: dto.portfolio,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
      status: JobApplicationStatus.NEW,
    });

    const saved = await this.applicationRepository.save(application);

    this.websocketGateway.broadcastCareersUpdate({
      type: "new_application",
      job: { id: jobId, title: job.title },
      applicationId: saved.id,
    });

    return {
      id: saved.id,
      message: "Application submitted successfully",
    };
  }

  async submitInquiry(
    dto: SubmitCareerInquiryDto
  ): Promise<{ id: string; message: string }> {
    const inquiry = this.inquiryRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      interestedRole: dto.interestedRole,
      message: dto.message,
      status: CareerInquiryStatus.NEW,
    });

    const saved = await this.inquiryRepository.save(inquiry);

    this.websocketGateway.broadcastCareersUpdate({
      type: "new_inquiry",
      inquiryId: saved.id,
    });

    return {
      id: saved.id,
      message: "Inquiry submitted successfully",
    };
  }

  async getApplications(options?: {
    jobPostingId?: string;
    status?: JobApplicationStatus;
    page?: number;
    limit?: number;
  }): Promise<{ applications: JobApplicationResponse[]; total: number }> {
    const { jobPostingId, status, page = 1, limit = 50 } = options || {};

    const queryBuilder = this.applicationRepository
      .createQueryBuilder("app")
      .leftJoinAndSelect("app.jobPosting", "job");

    if (jobPostingId) {
      queryBuilder.andWhere("app.jobPostingId = :jobPostingId", {
        jobPostingId,
      });
    }

    if (status) {
      queryBuilder.andWhere("app.status = :status", { status });
    }

    queryBuilder
      .orderBy("app.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      applications: applications.map((a) => this.mapApplication(a)),
      total,
    };
  }

  async updateApplicationStatus(
    id: string,
    status: JobApplicationStatus
  ): Promise<JobApplicationResponse> {
    const app = await this.applicationRepository.findOne({
      where: { id },
      relations: ["jobPosting"],
    });

    if (!app) {
      throw new NotFoundException("Application not found");
    }

    app.status = status;
    await this.applicationRepository.save(app);
    return this.mapApplication(app);
  }

  async getInquiries(options?: {
    status?: CareerInquiryStatus;
    page?: number;
    limit?: number;
  }): Promise<{ inquiries: CareerInquiryResponse[]; total: number }> {
    const { status, page = 1, limit = 50 } = options || {};

    const queryBuilder = this.inquiryRepository.createQueryBuilder("inquiry");

    if (status) {
      queryBuilder.andWhere("inquiry.status = :status", { status });
    }

    queryBuilder
      .orderBy("inquiry.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [inquiries, total] = await queryBuilder.getManyAndCount();

    return {
      inquiries: inquiries.map((i) => this.mapInquiry(i)),
      total,
    };
  }

  async updateInquiryStatus(
    id: string,
    status: CareerInquiryStatus
  ): Promise<CareerInquiryResponse> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException("Inquiry not found");
    }

    inquiry.status = status;
    await this.inquiryRepository.save(inquiry);
    return this.mapInquiry(inquiry);
  }

  private async broadcastJobEvent(
    type: "published" | "unpublished" | "updated" | "closed",
    job: JobPostingResponse
  ) {
    this.websocketGateway.broadcastCareersUpdate({
      type,
      job: job as unknown as Record<string, unknown>,
    });
  }
}
