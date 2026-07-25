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
  TrendingUp,
  Users,
  Shield,
  Zap,
  Globe,
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { StartCampaignCTA } from "@/components/start-campaign-cta";

export default function AboutPage() {
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
            <Link
              href="/campaigns"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Campaign
            </Link>
            <Link href="/about" className="text-foreground font-medium">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/campaigns">Browse Campaigns</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/create">Start Campaign</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              About FundFlow
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Democratizing Funding Through
              <span className="text-primary"> Blockchain Technology</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're building the future of crowdfunding by eliminating
              intermediaries, reducing fees, and creating a transparent, secure
              platform for creators and backers worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/create">
                  Start Your Campaign
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators who have successfully funded their
              projects on FundFlow.
            </p>
            <div className="max-w-md mx-auto">
              <StartCampaignCTA variant="card" size="lg" showFeatures={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  FundFlow
                </span>
              </div>
              <p className="text-muted-foreground">
                Decentralized crowdfunding platform built on blockchain
                technology with AI-powered features.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/campaigns"
                    className="hover:text-foreground transition-colors"
                  >
                    Browse Campaigns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className="hover:text-foreground transition-colors"
                  >
                    Start Campaign
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-foreground transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 FundFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
