"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Star,
  CheckCircle,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import type { PlatformStats } from "@/hooks/use-platform-stats";
import { useI18n } from "@/hooks/use-i18n";

interface StartCampaignCTAProps {
  variant?: "hero" | "card" | "inline" | "featured";
  size?: "sm" | "md" | "lg";
  showFeatures?: boolean;
  className?: string;
  platformStats?: PlatformStats;
}

function formatTrustCount(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 100_000) / 10}M`;
  if (n >= 10_000) return `${Math.floor(n / 1_000)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function StartCampaignCTA({
  variant = "card",
  size = "md",
  showFeatures = true,
  className = "",
  platformStats,
}: StartCampaignCTAProps) {
  const { t } = useI18n();
  const features = [
    { icon: Shield, text: "Blockchain Security" },
    { icon: Zap, text: "Instant Payouts" },
    { icon: Users, text: "Global Reach" },
    { icon: Star, text: "AI Assistance" },
  ];

  if (variant === "hero") {
    return (
      <div className={`text-center ${className}`}>
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Rocket className="w-4 h-4 mr-2" />
            Launch Your Project Today
          </Badge>

          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Bring Your
            <span className="text-primary"> Vision to Life?</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who have successfully funded their
            projects with our blockchain-powered crowdfunding platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/create">
                Start Your Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8"
              asChild
            >
              <Link href="/campaigns">Explore Campaigns</Link>
            </Button>
          </div>

          {showFeatures && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                  onClick={() => {
                    const featureMap = {
                      0: "/how-it-works#blockchain-security",
                      1: "/how-it-works#instant-payouts",
                      2: "/how-it-works#global-reach",
                      3: "/how-it-works#ai-assistance",
                    };
                    window.open(
                      featureMap[index as keyof typeof featureMap],
                      "_blank"
                    );
                  }}
                >
                  <feature.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {platformStats && (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground tabular-nums">
                  {t("home.trust.projects", {
                    count: formatTrustCount(platformStats.totalCampaigns),
                  })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground tabular-nums">
                  {t("home.trust.backers", {
                    count: formatTrustCount(platformStats.totalBackers),
                  })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground tabular-nums">
                  {t("home.trust.activeCampaigns", {
                    count: platformStats.activeCampaigns,
                  })}
                </div>
              </div>
              <div className="text-center flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span className="text-lg font-semibold text-foreground">
                  {t("home.trust.secure")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card
        className={`border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 ${className}`}
      >
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Start Your Campaign Today</CardTitle>
          <CardDescription className="text-base">
            Launch your project with blockchain-powered crowdfunding and AI
            assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showFeatures && (
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm hover:text-primary transition-colors cursor-pointer group"
                  onClick={() => {
                    const featureMap = {
                      0: "/how-it-works#blockchain-security",
                      1: "/how-it-works#instant-payouts",
                      2: "/how-it-works#global-reach",
                      3: "/how-it-works#ai-assistance",
                    };
                    window.open(
                      featureMap[index as keyof typeof featureMap],
                      "_blank"
                    );
                  }}
                >
                  <feature.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-muted-foreground group-hover:text-primary">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <Button size="lg" className="w-full" asChild>
              <Link href="/create">
                <Rocket className="w-5 h-5 mr-2" />
                Launch Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/campaigns">Browse Examples</Link>
            </Button>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>5% platform fee</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between p-6 bg-muted/30 rounded-lg ${className}`}
      >
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h3 className="text-xl font-semibold mb-2">
            Ready to launch your project?
          </h3>
          <p className="text-muted-foreground">
            Create your campaign in minutes with our guided setup process
          </p>
        </div>
        <Button size={size === "md" ? "default" : size} asChild>
          <Link href="/create">
            Start Campaign
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 ${className}`}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative p-8 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4">
            Turn Your Ideas Into Reality
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Join the next generation of crowdfunding with blockchain technology,
            AI assistance, and global reach.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/create">
                <Rocket className="w-5 h-5 mr-2" />
                Start Your Campaign
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent"
              asChild
            >
              <Link href="/campaigns">View Success Stories</Link>
            </Button>
          </div>

          {showFeatures && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 hover:text-primary transition-colors cursor-pointer group"
                  onClick={() => {
                    const featureMap = {
                      0: "/how-it-works#blockchain-security",
                      1: "/how-it-works#instant-payouts",
                      2: "/how-it-works#global-reach",
                      3: "/how-it-works#ai-assistance",
                    };
                    window.open(
                      featureMap[index as keyof typeof featureMap],
                      "_blank"
                    );
                  }}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm text-muted-foreground text-center group-hover:text-primary">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
