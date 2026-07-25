"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Search,
  ArrowRight,
  Tag,
  Clock,
  Eye,
  Heart,
  Share2,
  Filter,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useBlog } from "@/hooks/use-blog";
import { blogAPI, type BlogPost } from "@/lib/blog-api";
import {
  BlogContent,
  formatBlogDate,
  shareBlogPost,
} from "@/components/blog/blog-content";
import { BlogNewsletter } from "@/components/blog/blog-newsletter";

function BlogPostCard({
  post,
  onReadMore,
  onShare,
  showShare = false,
}: {
  post: BlogPost;
  onReadMore: (post: BlogPost) => void;
  onShare: (post: BlogPost) => void;
  showShare?: boolean;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {post.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="text-sm text-muted-foreground">{post.readTime}</span>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {post.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{post.author}</p>
              <p className="text-xs text-muted-foreground">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {post.views}
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {post.likes}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
        <div className={showShare ? "flex space-x-2" : ""}>
          <Button
            className={showShare ? "flex-1" : "w-full group-hover:bg-primary/90 transition-colors"}
            onClick={() => onReadMore(post)}
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {showShare && (
            <Button variant="outline" size="sm" onClick={() => onShare(post)}>
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [liked, setLiked] = useState(false);

  const { posts, featuredPosts, categories, tags, loading, error, reload, updatePostEngagement } =
    useBlog({
      category: selectedCategory,
      tag: selectedTag,
      search: searchQuery,
    });

  const handleReadMore = useCallback(async (post: BlogPost) => {
    setLoadingPost(true);
    setIsArticleDialogOpen(true);
    setLiked(false);
    try {
      const full = await blogAPI.getBySlug(post.slug);
      setSelectedPost(full);
      updatePostEngagement(post.slug, { views: full.views });
    } catch {
      setSelectedPost(post);
    } finally {
      setLoadingPost(false);
    }
  }, [updatePostEngagement]);

  const handleLike = async () => {
    if (!selectedPost || liked) return;
    try {
      const { likes } = await blogAPI.like(selectedPost.slug);
      setSelectedPost({ ...selectedPost, likes });
      updatePostEngagement(selectedPost.slug, { likes });
      setLiked(true);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
              Campaigns
            </Link>
            <Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors">
              Start Campaign
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-foreground font-medium">Blog</Link>
          </nav>
          <Button variant="outline" size="sm" asChild>
            <Link href="/create">Start Campaign</Link>
          </Button>
        </div>
      </header>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              FundFlow <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Insights, tips, and stories from the world of blockchain-powered
              crowdfunding. Updated in real time as our team publishes.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium text-foreground mb-2">{error}</p>
          <p className="text-sm mb-6">
            Make sure the backend is running at{" "}
            <code className="text-xs bg-muted px-2 py-1 rounded">localhost:3001</code>
          </p>
          <Button onClick={reload} variant="outline">
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Featured Articles
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our most popular and impactful articles on crowdfunding and blockchain.
                </p>
              </div>
              {featuredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {featuredPosts.map((post) => (
                    <BlogPostCard
                      key={post.id}
                      post={post}
                      onReadMore={handleReadMore}
                      onShare={shareBlogPost}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No featured articles yet. Admins can publish from the dashboard.
                </p>
              )}
            </div>
          </section>

          <section className="py-10 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter by:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  All Articles
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Browse our complete collection of articles and insights.
                </p>
              </div>
              {posts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {posts.map((post) => (
                    <BlogPostCard
                      key={post.id}
                      post={post}
                      onReadMore={handleReadMore}
                      onShare={shareBlogPost}
                      showShare
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No articles found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedTag("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <BlogNewsletter />
        </div>
      </section>

      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">FundFlow</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Building the future of crowdfunding with blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/campaigns" className="hover:text-foreground transition-colors">Browse Campaigns</Link></li>
                <li><Link href="/create" className="hover:text-foreground transition-colors">Start Campaign</Link></li>
                <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>© 2024 FundFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {loadingPost ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : selectedPost ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{selectedPost.category}</Badge>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedPost.readTime}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedPost.views}
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {selectedPost.likes}
                    </span>
                  </div>
                </div>
                <DialogTitle className="text-2xl sm:text-3xl break-words pr-8">
                  {selectedPost.title}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center space-x-4 mt-4">
                    <img
                      src={selectedPost.authorAvatar}
                      alt={selectedPost.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedPost.author}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBlogDate(selectedPost.publishedAt)}
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedPost.content && <BlogContent content={selectedPost.content} />}
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        <Tag className="w-3 h-3 mr-1" />
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => shareBlogPost(selectedPost)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Article
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleLike} disabled={liked}>
                        <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current text-red-500" : ""}`} />
                        {liked ? "Liked" : "Like"}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${selectedPost.slug}`}>Full Page</Link>
                      </Button>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {selectedPost.likes} likes · {selectedPost.views} views
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
