"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Archive,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Globe,
  FileText,
  Mail,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  blogAPI,
  type BlogPost,
  type BlogPostStatus,
  type NewsletterSubscriber,
  type NewsletterStats,
} from "@/lib/blog-api";
import { uploadImage } from "@/lib/upload-image";

const CATEGORIES = [
  "Technology",
  "Guide",
  "About",
  "Editorial",
  "Community",
  "Finance",
  "Case Study",
];

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "Technology",
  tags: "",
  imageUrl: "",
  featured: false,
  status: "draft" as BlogPostStatus,
};

export function AdminBlogTab() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscriberStats, setSubscriberStats] = useState<NewsletterStats | null>(null);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscribersLoading, setSubscribersLoading] = useState(true);

  const loadSubscribers = useCallback(async () => {
    setSubscribersLoading(true);
    try {
      const data = await blogAPI.getNewsletterSubscribers({
        search: subscriberSearch.trim() || undefined,
        limit: 100,
      });
      setSubscribers(data.subscribers);
      setSubscriberStats(data.stats);
    } catch {
      // non-critical
    } finally {
      setSubscribersLoading(false);
    }
  }, [subscriberSearch]);

  useEffect(() => {
    const t = setTimeout(loadSubscribers, 300);
    return () => clearTimeout(t);
  }, [loadSubscribers]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        search?: string;
        status?: BlogPostStatus;
        limit?: number;
      } = { limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter as BlogPostStatus;

      const data = await blogAPI.getAllAdmin(params);
      setPosts(data.posts);
      setTotal(data.total);
    } catch {
      toast({
        title: "Failed to load blog posts",
        description: "Ensure the backend is running and blog migration is applied.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content || "",
      category: post.category,
      tags: post.tags.join(", "),
      imageUrl: post.image,
      featured: post.featured,
      status: post.status,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, token);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim(),
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl || undefined,
        featured: form.featured,
        status: publishNow ? ("published" as BlogPostStatus) : form.status,
      };

      if (editingPost) {
        await blogAPI.update(editingPost.id, payload);
        if (publishNow && editingPost.status !== "published") {
          await blogAPI.publish(editingPost.id, true);
        } else if (!publishNow && editingPost.status === "published" && form.status === "draft") {
          await blogAPI.publish(editingPost.id, false);
        }
        toast({ title: "Article updated" });
      } else {
        const created = await blogAPI.create(payload);
        if (publishNow && created.status !== "published") {
          await blogAPI.publish(created.id, true);
        }
        toast({ title: publishNow ? "Article published" : "Draft saved" });
      }

      setDialogOpen(false);
      await load();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string, publish: boolean) => {
    setActionId(id);
    try {
      await blogAPI.publish(id, publish);
      toast({ title: publish ? "Published" : "Unpublished" });
      await load();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const handleArchive = async (id: string) => {
    setActionId(id);
    try {
      await blogAPI.archive(id);
      toast({ title: "Article archived" });
      await load();
    } catch {
      toast({ title: "Archive failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    setActionId(id);
    try {
      await blogAPI.delete(id);
      toast({ title: "Article deleted" });
      await load();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  const statusColor = (status: BlogPostStatus) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">
            Create, publish, and manage blog articles in real time
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No articles yet. Create your first blog post.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{total} article(s)</p>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
                >
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      className="w-full sm:w-24 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <Badge variant={statusColor(post.status)}>
                        {post.status}
                      </Badge>
                      {post.featured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{post.category}</span>
                      <span>{post.readTime}</span>
                      <span>{post.views} views</span>
                      <span>{post.likes} likes</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.status === "published" && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(post)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {post.status === "draft" && (
                      <Button
                        size="sm"
                        disabled={actionId === post.id}
                        onClick={() => handlePublish(post.id, true)}
                      >
                        {actionId === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Globe className="w-4 h-4 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                    )}
                    {post.status === "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionId === post.id}
                        onClick={() => handlePublish(post.id, false)}
                      >
                        Unpublish
                      </Button>
                    )}
                    {post.status !== "archived" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionId === post.id}
                        onClick={() => handleArchive(post.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={actionId === post.id}
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Newsletter Subscribers
          </CardTitle>
          <CardDescription>
            Manage blog newsletter sign-ups from the Stay Updated section
          </CardDescription>
          {subscriberStats && (
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{subscriberStats.active}</span>
                <span className="text-muted-foreground">active</span>
              </div>
              <div className="text-sm text-muted-foreground">
                +{subscriberStats.thisMonth} this month
              </div>
              <div className="text-sm text-muted-foreground">
                {subscriberStats.unsubscribed} unsubscribed
              </div>
            </div>
          )}
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers by email..."
              className="pl-10"
              value={subscriberSearch}
              onChange={(e) => setSubscriberSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {subscribersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : subscribers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No subscribers yet. They will appear when users subscribe on the blog page.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 border rounded-lg text-sm"
                >
                  <span className="font-medium truncate">{sub.email}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={sub.status === "active" ? "default" : "outline"}
                    >
                      {sub.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Article" : "Create Article"}
            </DialogTitle>
            <DialogDescription>
              Write your article content. Markdown formatting is supported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article title"
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short summary for cards and SEO"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Full article content (markdown supported)"
                rows={12}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="blockchain, web3, crowdfunding"
                />
              </div>
            </div>

            <div>
              <Label>Featured Image</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="Image URL or upload"
                />
                <Button variant="outline" disabled={uploading} asChild>
                  <label className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </Button>
              </div>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 h-32 object-cover rounded"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label htmlFor="featured">Featured article</Label>
              </div>
              {!editingPost && (
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as BlogPostStatus })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => handleSave(false)}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
            </Button>
            <Button disabled={saving} onClick={() => handleSave(true)}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
