"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Shield, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CampaignAssistantProps {
  onContentGenerated?: (content: string, type: string) => void;
  campaignData?: any;
}

export function AICampaignAssistant({
  onContentGenerated,
  campaignData,
}: CampaignAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [contentType, setContentType] = useState("campaign-description");
  const { toast } = useToast();

  const generateContent = async () => {
    if (!campaignData?.title && contentType !== "campaign-title") {
      toast({
        title: "Missing Information",
        description: "Please provide campaign details first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/content-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          context: campaignData,
        }),
      });

      const data = await response.json();
      if (data.content) {
        setGeneratedContent(data.content);
        onContentGenerated?.(data.content, contentType);
        toast({
          title: "Content Generated",
          description: "AI has generated content for your campaign",
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCampaign = async () => {
    if (!campaignData?.title || !campaignData?.description) {
      toast({
        title: "Missing Information",
        description:
          "Please provide campaign title and description for analysis",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/campaign-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      });

      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "AI has analyzed your campaign for success factors",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score <= 30) return "bg-green-100 text-green-800";
    if (score <= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getSuccessBadgeColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle>AI Campaign Assistant</CardTitle>
        </div>
        <CardDescription>
          Get AI-powered insights and content generation for your crowdfunding
          campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="analyze">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <select
                  id="content-type"
                  className="w-full p-2 border rounded-md"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  <option value="campaign-description">
                    Campaign Description
                  </option>
                  <option value="campaign-title">Campaign Titles</option>
                  <option value="reward-descriptions">
                    Reward Descriptions
                  </option>
                </select>
              </div>

              <Button
                onClick={generateContent}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>

              {generatedContent && (
                <div className="space-y-2">
                  <Label>Generated Content</Label>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={8}
                    className="w-full"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onContentGenerated?.(generatedContent, contentType)
                    }
                  >
                    Use This Content
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            <Button
              onClick={analyzeCampaign}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Campaign
                </>
              )}
            </Button>

            {analysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">
                          {analysis.riskScore}
                        </span>
                        <Badge
                          className={getRiskBadgeColor(analysis.riskScore)}
                        >
                          {analysis.riskScore <= 30
                            ? "Low"
                            : analysis.riskScore <= 60
                              ? "Medium"
                              : "High"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Success Probability
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">
                          {analysis.successProbability}%
                        </span>
                        <Badge
                          className={getSuccessBadgeColor(
                            analysis.successProbability
                          )}
                        >
                          {analysis.successProbability >= 70
                            ? "High"
                            : analysis.successProbability >= 40
                              ? "Medium"
                              : "Low"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.recommendations.map(
                        (rec: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm flex items-start space-x-2"
                          >
                            <span className="text-primary">•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Funding Goal Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Realistic:</span>
                      <Badge
                        variant={
                          analysis.fundingGoalAssessment.isRealistic
                            ? "default"
                            : "destructive"
                        }
                      >
                        {analysis.fundingGoalAssessment.isRealistic
                          ? "Yes"
                          : "No"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">
                        Suggested Range:
                      </span>
                      <span className="text-sm ml-2">
                        {analysis.fundingGoalAssessment.suggestedRange}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.fundingGoalAssessment.reasoning}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fraud Detection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered fraud detection runs automatically on all campaigns
                to ensure platform security.
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Shield className="w-3 h-3 mr-1" />
                Protected by AI Security
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
