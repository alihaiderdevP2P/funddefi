"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Megaphone } from "lucide-react";
import { useCampaignUpdates } from "@/hooks/use-campaign-updates";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CampaignUpdatesPanelProps {
  campaignId: string;
  creatorId: string;
  currentUserId?: string;
}

export function CampaignUpdatesPanel({
  campaignId,
  creatorId,
  currentUserId,
}: CampaignUpdatesPanelProps) {
  const { updates, loading, error, createUpdate } =
    useCampaignUpdates(campaignId);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCreator = currentUserId === creatorId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || content.trim().length < 10) return;
    setSubmitting(true);
    try {
      await createUpdate({ title: title.trim(), content: content.trim() });
      setTitle("");
      setContent("");
      setShowForm(false);
      toast({ title: "Update published" });
    } catch {
      toast({ title: "Failed to publish update", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isCreator && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Megaphone className="w-4 h-4 mr-2" />
            {showForm ? "Cancel" : "Post update"}
          </Button>
        </div>
      )}

      {showForm && isCreator && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New project update</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="update-title">Title</Label>
                <Input
                  id="update-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  minLength={3}
                  placeholder="e.g. Prototype complete"
                />
              </div>
              <div>
                <Label htmlFor="update-content">Update</Label>
                <Textarea
                  id="update-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Share progress with your backers..."
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Publishing..." : "Publish update"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-sm text-muted-foreground text-center">{error}</p>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground" role="status">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden />
          <p>No updates yet.</p>
          {isCreator && (
            <p className="text-sm mt-2">
              Post your first update to keep backers informed.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4" role="feed" aria-label="Campaign updates">
          {updates.map((update) => (
            <Card key={update.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {update.author && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={update.author.avatar} />
                        <AvatarFallback>
                          {update.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleString()}
                        {update.author && ` · ${update.author.name}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line leading-relaxed">
                  {update.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
