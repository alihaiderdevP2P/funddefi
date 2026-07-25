"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { shareCampaign } from "@/lib/campaign-share";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CampaignShareButtonProps {
  title: string;
  summary?: string;
  className?: string;
}

export function CampaignShareButton({
  title,
  summary,
  className,
}: CampaignShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const result = await shareCampaign({ title, summary });
    if (result === "copied") {
      toast({
        title: "Link copied",
        description: "Campaign link copied to your clipboard.",
      });
    } else if (result === "shared") {
      toast({ title: "Thanks for sharing!" });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("flex-1 bg-transparent", className)}
      onClick={handleShare}
      aria-label="Share campaign"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}
