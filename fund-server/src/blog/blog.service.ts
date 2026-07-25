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
  BlogPost,
  BlogPostStatus,
} from "./entities/blog-post.entity";
import { CreateBlogPostDto } from "./dto/create-blog-post.dto";
import { UpdateBlogPostDto } from "./dto/update-blog-post.dto";
import { WebsocketGateway } from "../websocket/websocket.gateway";

export interface BlogPostResponse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorAvatar: string;
  authorId: string;
  publishedAt: string | null;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  views: number;
  likes: number;
  featured: boolean;
  status: BlogPostStatus;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private blogRepository: Repository<BlogPost>,
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

  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.blogRepository.findOne({ where: { slug } });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private computeReadTimeMinutes(content: string): number {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  private mapPost(post: BlogPost, includeContent = true): BlogPostResponse {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      ...(includeContent ? { content: post.content } : {}),
      author: post.author?.name || "FundFlow Team",
      authorAvatar: post.author?.avatar || "/placeholder-user.jpg",
      authorId: post.authorId,
      publishedAt: post.publishedAt
        ? post.publishedAt.toISOString()
        : post.createdAt?.toISOString() || null,
      readTime: `${post.readTimeMinutes} min read`,
      category: post.category,
      tags: post.tags || [],
      image: post.imageUrl || "/quantum-computing-concept.png",
      views: post.views,
      likes: post.likes,
      featured: post.featured,
      status: post.status,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }

  async findAll(options?: {
    status?: BlogPostStatus;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    includeDrafts?: boolean;
  }): Promise<{ posts: BlogPostResponse[]; total: number }> {
    const {
      status,
      category,
      tag,
      search,
      featured,
      page = 1,
      limit = 20,
      includeDrafts = false,
    } = options || {};

    const queryBuilder = this.blogRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author");

    if (!includeDrafts) {
      queryBuilder.andWhere("post.status = :published", {
        published: BlogPostStatus.PUBLISHED,
      });
    } else if (status) {
      queryBuilder.andWhere("post.status = :status", { status });
    }

    if (category && category !== "All") {
      queryBuilder.andWhere("post.category = :category", { category });
    }

    if (tag) {
      queryBuilder.andWhere(":tag = ANY(post.tags)", { tag });
    }

    if (featured !== undefined) {
      queryBuilder.andWhere("post.featured = :featured", { featured });
    }

    if (search) {
      queryBuilder.andWhere(
        "(post.title ILIKE :search OR post.excerpt ILIKE :search OR :searchTag = ANY(post.tags))",
        { search: `%${search}%`, searchTag: search.toLowerCase() }
      );
    }

    queryBuilder
      .orderBy("post.publishedAt", "DESC", "NULLS LAST")
      .addOrderBy("post.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      posts: posts.map((p) => this.mapPost(p, false)),
      total,
    };
  }

  async findFeatured(): Promise<BlogPostResponse[]> {
    const { posts } = await this.findAll({ featured: true, limit: 6 });
    return posts;
  }

  async findBySlug(
    slug: string,
    incrementViews = true
  ): Promise<BlogPostResponse> {
    const post = await this.blogRepository.findOne({
      where: { slug },
      relations: ["author"],
    });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    if (post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException("Blog post not found");
    }

    if (incrementViews) {
      post.views += 1;
      await this.blogRepository.save(post);
      this.websocketGateway.broadcastBlogEngagement(post.id, {
        slug: post.slug,
        views: post.views,
        likes: post.likes,
      });
    }

    return this.mapPost(post, true);
  }

  async findById(id: string): Promise<BlogPostResponse> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    return this.mapPost(post, true);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.blogRepository
      .createQueryBuilder("post")
      .select("DISTINCT post.category", "category")
      .where("post.status = :status", { status: BlogPostStatus.PUBLISHED })
      .orderBy("post.category", "ASC")
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  async getTags(): Promise<string[]> {
    const result = await this.blogRepository.query(
      `SELECT DISTINCT unnest(tags) AS tag
       FROM blog_posts
       WHERE status = 'published'
       ORDER BY tag ASC`
    );

    return result.map((r: { tag: string }) => r.tag).filter(Boolean);
  }

  async create(
    dto: CreateBlogPostDto,
    authorId: string
  ): Promise<BlogPostResponse> {
    const baseSlug = dto.slug || this.slugify(dto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const post = this.blogRepository.create({
      title: dto.title,
      slug,
      excerpt: dto.excerpt || dto.content.slice(0, 200) + "...",
      content: dto.content,
      authorId,
      category: dto.category || "Technology",
      tags: dto.tags || [],
      imageUrl: dto.imageUrl,
      featured: dto.featured ?? false,
      status: dto.status || BlogPostStatus.DRAFT,
      readTimeMinutes: this.computeReadTimeMinutes(dto.content),
      publishedAt:
        dto.status === BlogPostStatus.PUBLISHED ? new Date() : null,
    });

    const saved = await this.blogRepository.save(post);
    const full = await this.findById(saved.id);

    if (saved.status === BlogPostStatus.PUBLISHED) {
      await this.broadcastPostEvent("published", full);
    }

    return full;
  }

  async update(
    id: string,
    dto: UpdateBlogPostDto
  ): Promise<BlogPostResponse> {
    const post = await this.blogRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    if (dto.title && dto.title !== post.title && !dto.slug) {
      post.slug = await this.ensureUniqueSlug(this.slugify(dto.title), id);
    }

    if (dto.slug && dto.slug !== post.slug) {
      post.slug = await this.ensureUniqueSlug(this.slugify(dto.slug), id);
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.content !== undefined) {
      post.content = dto.content;
      post.readTimeMinutes = this.computeReadTimeMinutes(dto.content);
    }
    if (dto.category !== undefined) post.category = dto.category;
    if (dto.tags !== undefined) post.tags = dto.tags;
    if (dto.imageUrl !== undefined) post.imageUrl = dto.imageUrl;
    if (dto.featured !== undefined) post.featured = dto.featured;

    await this.blogRepository.save(post);
    const full = await this.findById(id);
    await this.broadcastPostEvent("updated", full);
    return full;
  }

  async publish(id: string, publish: boolean): Promise<BlogPostResponse> {
    const post = await this.blogRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    if (publish) {
      post.status = BlogPostStatus.PUBLISHED;
      post.publishedAt = post.publishedAt || new Date();
    } else {
      post.status = BlogPostStatus.DRAFT;
    }

    await this.blogRepository.save(post);
    const full = await this.findById(id);
    await this.broadcastPostEvent(publish ? "published" : "unpublished", full);

    if (publish) {
      await this.websocketGateway.broadcastGlobalNotification({
        type: "info",
        title: "New Article Published",
        message: full.title,
        data: { slug: full.slug, postId: full.id },
      });
    }

    return full;
  }

  async archive(id: string): Promise<BlogPostResponse> {
    const post = await this.blogRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    post.status = BlogPostStatus.ARCHIVED;
    await this.blogRepository.save(post);
    const full = await this.findById(id);
    await this.broadcastPostEvent("archived", full);
    return full;
  }

  async remove(id: string): Promise<void> {
    const post = await this.blogRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException("Blog post not found");
    }

    await this.blogRepository.remove(post);
    this.websocketGateway.broadcastBlogPostUpdate({
      type: "deleted",
      post: { id, slug: post.slug },
    });
  }

  async like(slug: string): Promise<{ likes: number }> {
    const post = await this.blogRepository.findOne({ where: { slug } });

    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException("Blog post not found");
    }

    post.likes += 1;
    await this.blogRepository.save(post);

    this.websocketGateway.broadcastBlogEngagement(post.id, {
      slug: post.slug,
      views: post.views,
      likes: post.likes,
    });

    return { likes: post.likes };
  }

  private async broadcastPostEvent(
    type: "published" | "unpublished" | "updated" | "archived",
    post: BlogPostResponse
  ) {
    this.websocketGateway.broadcastBlogPostUpdate({
      type,
      post: { ...post, content: undefined },
    });
  }
}
