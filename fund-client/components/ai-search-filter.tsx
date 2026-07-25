"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

interface AISearchFilterProps {
  onSearchResults: (results: any[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

interface AISearchResult {
  campaignId: string;
  title: string;
  category: string;
  matchScore: number;
  reason: string;
  estimatedInterest: string;
  tags: string[];
  fundingGoal: number;
  raisedAmount: number;
  backersCount: number;
  daysLeft: number;
  imageUrl: string;
}

export function AISearchFilter({
  onSearchResults,
  onLoadingChange,
}: AISearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [fundingRange, setFundingRange] = useState([0, 1000000]);
  const [riskTolerance, setRiskTolerance] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "technology", label: "Technology" },
    { value: "gaming", label: "Gaming" },
    { value: "health", label: "Health" },
    { value: "environment", label: "Environment" },
    { value: "art", label: "Art & Design" },
    { value: "music", label: "Music" },
    { value: "film", label: "Film & Video" },
    { value: "food", label: "Food & Craft" },
    { value: "publishing", label: "Publishing" },
  ];

  const performAISearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search query to find campaigns",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    onLoadingChange(true);

    try {
      const response = await fetch("/api/ai/campaign-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: "search-user",
          searchQuery,
          preferences: {
            categories: selectedCategory !== "all" ? [selectedCategory] : [],
            riskTolerance: riskTolerance.toUpperCase(),
            minFundingGoal: fundingRange[0],
            maxFundingGoal: fundingRange[1],
          },
        }),
      });

      const data = await response.json();
      if (data.recommendations) {
        onSearchResults(data.recommendations.recommendations);
        setAiInsights(data.recommendations.insights || []);
        toast({
          title: "AI Search Complete",
          description: `Found ${data.recommendations.recommendations.length} relevant campaigns`,
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to perform AI search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI-Powered Campaign Search
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Smart Search
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Query</label>
          <div className="flex gap-2">
            <Input
              placeholder="Describe what you're looking for... (e.g., 'sustainable energy projects', 'innovative tech gadgets')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={performAISearch}
              disabled={isLoading}
              className="px-6"
            >
              {isLoading ? (
                <Brain className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Tolerance</label>
            <Select value={riskTolerance} onValueChange={setRiskTolerance}>
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Funding Goal: ${fundingRange[0].toLocaleString()} - $
              {fundingRange[1].toLocaleString()}
            </label>
            <Slider
              value={fundingRange}
              onValueChange={setFundingRange}
              max={1000000}
              min={0}
              step={10000}
              className="w-full"
            />
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              AI Insights
            </label>
            <div className="space-y-2">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <p className="text-sm text-muted-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Search Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              • Be specific about your interests (e.g., "renewable energy",
              "mobile apps")
            </li>
            <li>
              • Mention your preferred project stage (early, established, near
              completion)
            </li>
            <li>
              • Include any specific features or technologies you're interested
              in
            </li>
            <li>
              • AI will analyze campaign descriptions, goals, and success
              factors
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
