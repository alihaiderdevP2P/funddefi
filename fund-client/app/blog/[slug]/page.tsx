"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Eye,
  Heart,
  Share2,
  Tag,
  Loader2,
} from "lucide-react";
import { useBlogPost } from "@/hooks/use-blog";
import {
  BlogContent,
  formatBlogDate,
  shareBlogPost,
} from "@/components/blog/blog-content";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { post, loading, error, like, liked } = useBlogPost(slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">{error || "Article not found"}</p>
        <Button variant="outline" onClick={() => router.push("/blog")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FundFlow</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Articles
            </Link>
          </Button>
        </div>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            {post.readTime}
          </span>
          <span className="flex items-center text-sm text-muted-foreground">
            <Eye className="w-4 h-4 mr-1" />
            {post.views} views
          </span>
          <span className="flex items-center text-sm text-muted-foreground">
            <Heart className="w-4 h-4 mr-1" />
            {post.likes} likes
          </span>
        </div>

        <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center space-x-4 mb-8">
          <img
            src={post.authorAvatar}
            alt={post.author}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-medium">{post.author}</p>
            <p className="text-sm text-muted-foreground">
              {formatBlogDate(post.publishedAt)}
            </p>
          </div>
        </div>

        <div className="relative w-full h-72 lg:h-96 mb-10 rounded-xl overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          {post.excerpt}
        </p>

        {post.content && <BlogContent content={post.content} />}

        <div className="mt-10 pt-8 border-t">
          <h4 className="font-semibold mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((t) => (
              <Badge key={t} variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {t}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 p-4 bg-muted rounded-lg">
            <Button variant="outline" size="sm" onClick={() => shareBlogPost(post)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Article
            </Button>
            <Button variant="outline" size="sm" onClick={like} disabled={liked}>
              <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current text-red-500" : ""}`} />
              {liked ? "Liked" : "Like"}
            </Button>
            <span className="flex items-center text-sm text-muted-foreground ml-auto">
              {post.likes} likes · {post.views} views (live)
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}
