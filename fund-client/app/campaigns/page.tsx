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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Users,
  Target,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { useCampaigns } from "@/hooks/use-campaigns";
import { AISearchFilter } from "@/components/ai-search-filter";
import { useAuth } from "@/hooks/use-auth";
import { StartCampaignCTA } from "@/components/start-campaign-cta";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNavigation } from "@/components/user-navigation";

const categories = [
  "All",
  "technology",
  "creative",
  "community",
  "business",
  "environment",
  "health",
  "education",
];
const sortOptions = [
  "Most Recent",
  "Most Funded",
  "Ending Soon",
  "Most Backers",
];

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [page, setPage] = useState(1);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
  const [isAiSearchMode, setIsAiSearchMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const { campaigns, total, loading, error, refetch } = useCampaigns({
    status: "active",
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchTerm || undefined,
    page,
    limit: 12,
  });

  const handleAiSearchResults = (results: any[]) => {
    setAiSearchResults(results);
    setIsAiSearchMode(true);
  };

  const handleAiLoadingChange = (loading: boolean) => {
    setIsAiLoading(loading);
  };

  // Update allCampaigns when new campaigns are loaded
  useEffect(() => {
    if (page === 1) {
      setAllCampaigns(campaigns);
    } else {
      setAllCampaigns((prev) => [...prev, ...campaigns]);
    }
  }, [campaigns, page]);

  const displayCampaigns = isAiSearchMode ? aiSearchResults : allCampaigns;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setAllCampaigns([]);
  }, [searchTerm, selectedCategory, sortBy]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/campaigns" className="text-foreground font-medium">
              Campaigns
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Campaign
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserNavigation />
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Discover Campaigns
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore innovative projects from creators around the world. Back
              the ideas you believe in.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {total} campaigns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading && page === 1 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="campaign-card">
                  <div className="aspect-video bg-muted rounded-t-lg animate-pulse"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-2 bg-muted rounded animate-pulse"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-destructive text-lg mb-4">
                Error loading campaigns
              </div>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCampaigns.map((campaign, index) => {
                const progressPercentage =
                  (campaign.raisedAmount / campaign.goalAmount) * 100;
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(campaign.endDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                );

                return (
                  <Card
                    key={campaign.id}
                    className="campaign-card group flex flex-col h-full"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <ImageWithFallback
                        src={campaign.imageUrl || "/placeholder.jpg"}
                        alt={campaign.title}
                        className="w-full aspect-video group-hover:scale-105 transition-transform duration-300"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 3}
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        {campaign.status}
                      </Badge>
                    </div>

                    <CardHeader className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{campaign.category}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {daysLeft} days left
                        </div>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        <Link href={`/campaigns/${campaign.id}`}>
                          {campaign.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {campaign.summary}
                      </CardDescription>
                      <div className="text-sm text-muted-foreground mt-2">
                        by {campaign.creator.name}
                      </div>
                    </CardHeader>

                    <CardContent className="mt-auto">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {Number(campaign.raisedAmount).toFixed(1)} /{" "}
                              {Number(campaign.goalAmount).toFixed(0)} ETH
                            </span>
                          </div>
                          <Progress
                            value={progressPercentage}
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {campaign.backersCount} backers
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
              })}
            </div>
          )}

          {displayCampaigns.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-4">
                No campaigns found
              </div>
              <p className="text-muted-foreground mb-8">
                Try adjusting your search terms or filters to find more
                campaigns.
              </p>
              <div className="max-w-md mx-auto">
                <StartCampaignCTA
                  variant="card"
                  size="md"
                  showFeatures={false}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Load More */}
      {displayCampaigns.length > 0 && displayCampaigns.length < total && (
        <section className="pb-12">
          <div className="container mx-auto px-4 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Campaigns"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
