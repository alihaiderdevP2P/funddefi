"use client";

import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useSavedCampaign } from "@/hooks/use-saved-campaign";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CampaignSaveButtonProps {
  campaignId: string;
  className?: string;
}

export function CampaignSaveButton({
  campaignId,
  className,
}: CampaignSaveButtonProps) {
  const { saved, loading, toggleSave } = useSavedCampaign(campaignId);
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      const isSaved = await toggleSave();
      toast({
        title: isSaved ? "Campaign saved" : "Removed from saved",
        description: isSaved
          ? "Find it anytime in your saved campaigns."
          : "This campaign was removed from your list.",
      });
    } catch {
      toast({
        title: "Could not update saved status",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("flex-1 bg-transparent", className)}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? "Unsave campaign" : "Save campaign"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart
          className={cn("w-4 h-4 mr-2", saved && "fill-primary text-primary")}
        />
      )}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
