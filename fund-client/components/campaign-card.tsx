import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Clock, Users, Target, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: number;
  title: string;
  description: string;
  category: string;
  raised: number;
  goal: number;
  backers: number;
  daysLeft: number;
  image: string;
  creator: string;
  featured?: boolean;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage = (campaign.raised / campaign.goal) * 100;

  return (
    <Card className="campaign-card group">
      <div className="relative overflow-hidden rounded-t-lg">
        <ImageWithFallback
          src={campaign.image || "/placeholder.jpg"}
          alt={campaign.title}
          className="w-full aspect-video group-hover:scale-105 transition-transform duration-300"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {campaign.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{campaign.category}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            {campaign.daysLeft} days left
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          <Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {campaign.description}
        </CardDescription>
        <div className="text-sm text-muted-foreground">
          by {campaign.creator}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                ${campaign.raised.toLocaleString()} / $
                {campaign.goal.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              {campaign.backers} backers
            </div>
            <div className="flex items-center text-sm font-medium text-primary">
              <Target className="w-4 h-4 mr-1" />
              {Math.round(progressPercentage)}% funded
            </div>
          </div>

          <Button className="w-full" asChild>
            <Link href={`/campaigns/${campaign.id}`}>
              View Campaign
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
