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
import { Progress } from "@/components/ui/progress";
import { WalletConnect } from "@/components/wallet-connect";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { useFeaturedCampaigns } from "@/hooks/use-campaigns";
import { usePlatformStats } from "@/hooks/use-platform-stats";
import { useAuth } from "@/hooks/use-auth";
import { StartCampaignCTA } from "@/components/start-campaign-cta";
import { AICampaignRecommendations } from "@/components/ai-campaign-recommendations";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNavigation } from "@/components/user-navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/hooks/use-i18n";
import {
  HeroBackgroundSlider,
  HeroSlideIndicators,
  useHeroSlider,
  HERO_SLIDES,
} from "@/components/hero-background-slider";
import { HeroPlatformStats } from "@/components/hero-platform-stats";

export default function HomePage() {
  const { t } = useI18n();
  const { campaigns, loading: campaignsLoading } = useFeaturedCampaigns();
  const { stats, loading: statsLoading, isLive } = usePlatformStats();
  const { isAuthenticated, user } = useAuth();
  const { slideIndex, goToSlide } = useHeroSlider(HERO_SLIDES.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/campaigns"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("home.nav.campaigns")}
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("home.nav.startCampaign")}
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("home.nav.about")}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <WalletConnect />
            <UserNavigation />
            {!isAuthenticated && (
              <Button size="sm" asChild>
                <Link href="/create">{t("home.nav.launchCampaign")}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 min-h-[min(85vh,720px)] flex items-center">
        <HeroBackgroundSlider slideIndex={slideIndex} />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-6 border-white/20 bg-white/10 text-white backdrop-blur-sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              {t("home.hero.badge")}
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 text-balance drop-shadow-sm">
              {t("home.hero.title")}
            </h1>

            <p className="text-xl text-white/80 mb-8 text-pretty max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 shadow-lg" asChild>
                <Link href="/campaigns">
                  {t("home.hero.exploreCampaigns")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm"
                asChild
              >
                <Link href="/create">{t("home.hero.startYourCampaign")}</Link>
              </Button>
            </div>

            <HeroPlatformStats
              stats={stats}
              loading={statsLoading}
              isLive={isLive}
            />

            <HeroSlideIndicators
              slideIndex={slideIndex}
              slideCount={HERO_SLIDES.length}
              onSelect={goToSlide}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card
              className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() =>
                window.open("/how-it-works#blockchain-security", "_blank")
              }
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {t("home.features.blockchainSecurity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("home.features.blockchainSecurityDesc")}
                </CardDescription>
                <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("home.features.learnMore")}
                </div>
              </CardContent>
            </Card>

            <Card
              className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() =>
                window.open("/how-it-works#ai-assistance", "_blank")
              }
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {t("home.features.aiAssistance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("home.features.aiAssistanceDesc")}
                </CardDescription>
                <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("home.features.learnMore")}
                </div>
              </CardContent>
            </Card>

            <Card
              className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() =>
                window.open("/how-it-works#global-reach", "_blank")
              }
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {t("home.features.globalReach")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("home.features.globalReachDesc")}
                </CardDescription>
                <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("home.features.learnMore")}
                </div>
              </CardContent>
            </Card>

            <Card
              className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() =>
                window.open("/how-it-works#instant-payouts", "_blank")
              }
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {t("home.features.instantPayouts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t("home.features.instantPayoutsDesc")}
                </CardDescription>
                <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("home.features.learnMore")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t("home.featured.title")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t("home.featured.subtitle")}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/campaigns">
                {t("home.featured.viewAll")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignsLoading
              ? // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
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
                ))
              : campaigns.slice(0, 3).map((campaign, index) => {
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
                      className="campaign-card group hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg overflow-hidden">
                        <ImageWithFallback
                          src={campaign.imageUrl || "/placeholder.jpg"}
                          alt={campaign.title}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                        />
                      </div>
                      <CardHeader className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{campaign.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {t("home.featured.daysLeft", { count: daysLeft })}
                          </span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          <Link href={`/campaigns/${campaign.id}`}>
                            {campaign.title}
                          </Link>
                        </CardTitle>
                        <CardDescription>{campaign.summary}</CardDescription>
                        <div className="text-sm text-muted-foreground mt-2">
                          {t("home.featured.by", {
                            name:
                              campaign.creator?.name ||
                              t("home.featured.anonymous"),
                          })}
                        </div>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">
                                {t("home.featured.progress")}
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
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("home.featured.backers", {
                                count: campaign.backersCount,
                              })}
                            </span>
                            <span className="font-medium text-primary">
                              {t("home.featured.funded", {
                                percent: Math.round(progressPercentage),
                              })}
                            </span>
                          </div>
                          <Button className="w-full mt-4" asChild>
                            <Link href={`/campaigns/${campaign.id}`}>
                              {t("home.featured.viewCampaign")}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>
      </section>

      {/* AI Recommendations Section - Only show for authenticated users */}
      {isAuthenticated && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                {t("home.recommendations.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("home.recommendations.subtitle")}
              </p>
              <Badge
                variant="secondary"
                className="mt-4 flex items-center gap-2 w-fit mx-auto"
              >
                <Brain className="w-4 h-4" />
                {t("home.recommendations.poweredByAi")}
              </Badge>
            </div>
            <AICampaignRecommendations
              userAddress={user?.walletAddress || user?.id}
              limit={3}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <StartCampaignCTA
            variant="hero"
            showFeatures={true}
            platformStats={stats}
          />
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
                {t("home.footer.description")}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("home.footer.platform")}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/campaigns"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.browseCampaigns")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.nav.startCampaign")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.howItWorks")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("home.footer.resources")}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.documentation")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.support")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.blog")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                {t("home.footer.company")}
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.nav.about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.careers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    {t("home.footer.contact")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>{t("home.footer.copyright")}</p>
          </div>
        </div>
      </footer>

      {/* AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
}
