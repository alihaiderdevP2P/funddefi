"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";
import { StartCampaignCTA } from "@/components/start-campaign-cta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      <section className="py-16 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              About FundFlow
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Democratizing Funding Through
              <span className="text-primary"> Blockchain Technology</span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Join thousands of creators who have successfully funded their
              projects on FundFlow.
            </p>
            <div className="max-w-md mx-auto">
              <StartCampaignCTA variant="card" size="lg" showFeatures={true} />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
