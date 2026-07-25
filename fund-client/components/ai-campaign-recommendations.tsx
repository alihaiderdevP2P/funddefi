"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, ExternalLink, Sparkles, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface Recommendation {
  campaignId: string;
  title: string;
  category: string;
  matchScore: number;
  reason: string;
  estimatedInterest: "LOW" | "MEDIUM" | "HIGH";
  tags: string[];
}

interface UserProfile {
  interests: string[];
  backingHistory: string;
  preferredCategories: string[];
  riskTolerance: "LOW" | "MEDIUM" | "HIGH";
}

interface AICampaignRecommendationsProps {
  userAddress?: string;
  limit?: number;
  backingHistory?: Array<{
    campaign: string;
    amount: number;
    category: string;
  }>;
}

export function AICampaignRecommendations({
  userAddress,
  limit = 3,
  backingHistory = [],
}: AICampaignRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    if (!userAddress) return;

    const history =
      backingHistory.length > 0
        ? backingHistory
        : [
            {
              campaign: "General Interest",
              amount: 0,
              category: "technology",
            },
          ];

    const categories = [
      ...new Set(history.map((h) => h.category).filter(Boolean)),
    ];
    const preferredCategories =
      categories.length > 0
        ? categories.map(
            (c) => c.charAt(0).toUpperCase() + c.slice(1)
          )
        : ["Technology", "Environment", "Health"];

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/campaign-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          backingHistory: history,
          preferences: {
            categories: preferredCategories,
            riskTolerance: "MEDIUM",
            minFundingGoal: 10000,
            maxFundingGoal: 200000,
          },
        }),
      });

      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(
          data.recommendations.recommendations.slice(0, limit)
        );
        setUserProfile(data.recommendations.userProfile);
        setInsights(data.recommendations.insights);
      }
    } catch (error) {
      toast({
        title: "Failed to Load Recommendations",
        description: "Unable to generate AI recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      generateRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress, backingHistory.length]);

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case "HIGH":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-gray-600";
  };

  if (!userAddress) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>AI Campaign Recommendations</CardTitle>
          </div>
          <CardDescription>
            Connect your wallet to get personalized campaign recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle>AI Campaign Recommendations</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRecommendations}
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Refresh"}
            </Button>
          </div>
          <CardDescription>
            Personalized recommendations based on your backing history and
            preferences
          </CardDescription>
        </CardHeader>

        {userProfile && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Risk Tolerance
                </div>
                <Badge
                  variant="outline"
                  className={getInterestColor(userProfile.riskTolerance)}
                >
                  {userProfile.riskTolerance}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Top Categories
                </div>
                <div className="text-sm font-medium">
                  {userProfile.preferredCategories.slice(0, 2).join(", ")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Interests</div>
                <div className="text-sm font-medium">
                  {userProfile.interests.slice(0, 2).join(", ")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Backing Style
                </div>
                <div className="text-sm font-medium">
                  {userProfile.backingHistory}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card
              key={rec.campaignId}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{rec.category}</Badge>
                      <Badge
                        className={getInterestColor(rec.estimatedInterest)}
                      >
                        {rec.estimatedInterest} Interest
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span
                          className={`text-sm font-medium ${getMatchScoreColor(
                            rec.matchScore
                          )}`}
                        >
                          {rec.matchScore}% Match
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.reason}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rec.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    {rec.campaignId &&
                    rec.campaignId !== "string" &&
                    rec.campaignId.length > 0 ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns/${rec.campaignId}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Campaign
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Campaign
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mock campaign progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      ${(Math.random() * 50000 + 10000).toFixed(0)} / $
                      {(Math.random() * 50000 + 75000).toFixed(0)}
                    </span>
                  </div>
                  <Progress value={Math.random() * 80 + 10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
