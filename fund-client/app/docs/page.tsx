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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Search,
  ArrowRight,
  Code,
  Wallet,
  Shield,
  Zap,
  Users,
  FileText,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  GraduationCap,
  Target,
  Rocket,
} from "lucide-react";
import Link from "next/link";

const documentationSections = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of FundFlow and how to get started",
    icon: BookOpen,
    color: "bg-blue-500",
    articles: [
      {
        title: "Introduction to FundFlow",
        slug: "introduction",
        difficulty: "Beginner",
      },
      {
        title: "Creating Your First Campaign",
        slug: "first-campaign",
        difficulty: "Beginner",
      },
      {
        title: "Connecting Your Wallet",
        slug: "wallet-connection",
        difficulty: "Beginner",
      },
      {
        title: "Understanding Smart Contracts",
        slug: "smart-contracts",
        difficulty: "Intermediate",
      },
    ],
  },
  {
    id: "campaigns",
    title: "Campaign Management",
    description:
      "Everything you need to know about creating and managing campaigns",
    icon: Users,
    color: "bg-green-500",
    articles: [
      {
        title: "Campaign Creation Guide",
        slug: "campaign-creation",
        difficulty: "Beginner",
      },
      {
        title: "Setting Up Rewards",
        slug: "rewards-setup",
        difficulty: "Beginner",
      },
      {
        title: "Campaign Promotion Tips",
        slug: "promotion-tips",
        difficulty: "Intermediate",
      },
      {
        title: "Managing Backers",
        slug: "backer-management",
        difficulty: "Intermediate",
      },
    ],
  },
  {
    id: "blockchain",
    title: "Blockchain & Web3",
    description: "Technical documentation for blockchain integration",
    icon: Code,
    color: "bg-purple-500",
    articles: [
      {
        title: "Smart Contract Architecture",
        slug: "contract-architecture",
        difficulty: "Advanced",
      },
      {
        title: "Gas Optimization",
        slug: "gas-optimization",
        difficulty: "Advanced",
      },
      {
        title: "Security Best Practices",
        slug: "security-practices",
        difficulty: "Advanced",
      },
      {
        title: "API Integration",
        slug: "api-integration",
        difficulty: "Intermediate",
      },
    ],
  },
  {
    id: "funding",
    title: "Funding & Payments",
    description: "How funding works and payment processing",
    icon: Wallet,
    color: "bg-orange-500",
    articles: [
      {
        title: "How Funding Works",
        slug: "funding-process",
        difficulty: "Beginner",
      },
      {
        title: "Payment Methods",
        slug: "payment-methods",
        difficulty: "Beginner",
      },
      { title: "Refund Policy", slug: "refund-policy", difficulty: "Beginner" },
      {
        title: "Tax Implications",
        slug: "tax-implications",
        difficulty: "Intermediate",
      },
    ],
  },
];

const quickStart = [
  {
    step: 1,
    title: "Connect Your Wallet",
    description:
      "Link your MetaMask, WalletConnect, or Coinbase Wallet to get started",
    icon: Wallet,
  },
  {
    step: 2,
    title: "Create Your Campaign",
    description:
      "Set up your project details, funding goals, and rewards for backers",
    icon: Users,
  },
  {
    step: 3,
    title: "Launch & Promote",
    description:
      "Share your campaign and start collecting funds from supporters",
    icon: Zap,
  },
  {
    step: 4,
    title: "Receive Funding",
    description:
      "Get your funds automatically when your campaign reaches its goal",
    icon: CheckCircle,
  },
];

const apiExamples = [
  {
    title: "Create Campaign",
    language: "JavaScript",
    code: `const campaign = await fundflow.createCampaign({
  title: "My Awesome Project",
  description: "A revolutionary new product",
  goalAmount: 10, // ETH
  endDate: "2024-12-31",
  category: "technology"
});`,
  },
  {
    title: "Fund Campaign",
    language: "JavaScript",
    code: `const funding = await fundflow.fundCampaign({
  campaignId: "0x123...",
  amount: 1, // ETH
  rewardId: "reward-1"
});`,
  },
  {
    title: "Get Campaign Data",
    language: "JavaScript",
    code: `const campaign = await fundflow.getCampaign("0x123...");
console.log(campaign.title, campaign.raisedAmount);`,
  },
];

// Difficulty level details
const difficultyDetails = {
  Beginner: {
    icon: GraduationCap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    title: "Beginner Level",
    description: "Perfect for newcomers to blockchain and crowdfunding",
    details: [
      "No prior blockchain experience required",
      "Step-by-step guides with clear instructions",
      "Explains fundamental concepts in simple terms",
      "Covers basic platform features and navigation",
      "Includes helpful tips and best practices",
      "Suitable for first-time users and creators",
    ],
    recommendedFor:
      "New users, first-time creators, beginners to blockchain technology",
  },
  Intermediate: {
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    title: "Intermediate Level",
    description: "For users with some blockchain or crowdfunding experience",
    details: [
      "Assumes basic understanding of blockchain concepts",
      "Covers advanced features and optimization techniques",
      "Includes integration guides and API documentation",
      "Explores best practices for campaign management",
      "Provides insights into platform analytics",
      "Helps optimize campaign performance",
    ],
    recommendedFor:
      "Users familiar with basics, campaign creators looking to optimize, developers integrating APIs",
  },
  Advanced: {
    icon: Rocket,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    title: "Advanced Level",
    description: "Technical documentation for developers and experts",
    details: [
      "Deep dive into smart contract architecture",
      "Advanced gas optimization techniques",
      "Security best practices and audits",
      "Complex integration scenarios",
      "Custom development guides",
      "Platform internals and technical details",
    ],
    recommendedFor:
      "Developers, technical experts, blockchain engineers, advanced integrators",
  },
};

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [showDifficultyDetails, setShowDifficultyDetails] = useState(false);
  const [selectedDifficultyForDetails, setSelectedDifficultyForDetails] =
    useState<string | null>(null);

  // Get all unique difficulty levels
  const difficultyLevels = ["All", "Beginner", "Intermediate", "Advanced"];

  const handleDifficultyClick = (
    difficulty: string,
    showDetails: boolean = false
  ) => {
    if (showDetails && difficulty !== "All") {
      setSelectedDifficultyForDetails(difficulty);
      setShowDifficultyDetails(true);
    } else {
      setSelectedDifficulty(difficulty === "All" ? null : difficulty);
    }
  };

  const filteredSections = documentationSections
    .map((section) => ({
      ...section,
      articles: section.articles.filter((article) => {
        // Search filter
        const matchesSearch =
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.slug.toLowerCase().includes(searchQuery.toLowerCase());

        // Difficulty filter
        const matchesDifficulty =
          selectedDifficulty === null ||
          selectedDifficulty === "All" ||
          article.difficulty === selectedDifficulty;

        return matchesSearch && matchesDifficulty;
      }),
    }))
    .filter((section) => section.articles.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
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
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link href="/docs" className="text-foreground font-medium">
              Docs
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/create">Start Campaign</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              FundFlow <span className="text-primary">Documentation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to know about building, launching, and
              managing blockchain-powered crowdfunding campaigns.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documentation..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Quick Start Guide
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get up and running with FundFlow in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {quickStart.map((step, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium text-primary mb-2">
                    Step {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Documentation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse our comprehensive guides and technical documentation.
            </p>

            {/* Difficulty Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground font-medium">
                Filter by difficulty:
              </span>
              {difficultyLevels.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={
                    selectedDifficulty === difficulty ||
                    (difficulty === "All" && selectedDifficulty === null)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    difficulty === "All"
                      ? setSelectedDifficulty(null)
                      : handleDifficultyClick(difficulty, true)
                  }
                  className="transition-all"
                >
                  {difficulty}
                </Button>
              ))}
              {selectedDifficulty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDifficulty(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear filter
                </Button>
              )}
            </div>

            {/* Results Count */}
            {selectedDifficulty && (
              <p className="text-sm text-muted-foreground mb-8">
                Showing{" "}
                {filteredSections.reduce(
                  (count, section) => count + section.articles.length,
                  0
                )}{" "}
                article
                {filteredSections.reduce(
                  (count, section) => count + section.articles.length,
                  0
                ) !== 1
                  ? "s"
                  : ""}{" "}
                with difficulty:{" "}
                <span className="font-semibold text-foreground">
                  {selectedDifficulty}
                </span>
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {filteredSections.map((section) => (
              <Card
                key={section.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 ${section.color} rounded-lg flex items-center justify-center`}
                    >
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.articles.map((article, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{article.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              article.difficulty === "Beginner"
                                ? "default"
                                : article.difficulty === "Intermediate"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDifficultyClick(article.difficulty, true);
                            }}
                          >
                            {article.difficulty}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Examples */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              API Examples
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with our JavaScript SDK and API integration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {apiExamples.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {example.title}
                    <Badge variant="secondary">{example.language}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need More Help?
            </h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Info className="w-6 h-6 text-blue-500" />
                  </div>
                  <CardTitle>Support Center</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Get help from our support team
                  </CardDescription>
                  <Button variant="outline" asChild>
                    <Link href="/support">Visit Support</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <CardTitle>Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Join our Discord community
                  </CardDescription>
                  <Button variant="outline">
                    Join Discord
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-purple-500" />
                  </div>
                  <CardTitle>Report Issue</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Found a bug? Let us know
                  </CardDescription>
                  <Button variant="outline" asChild>
                    <Link href="/contact">Report Bug</Link>
                  </Button>
                </CardContent>
              </Card>
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
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  FundFlow
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                Building the future of crowdfunding with blockchain technology.
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
            <p>© 2024 FundFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Difficulty Details Dialog */}
      <Dialog
        open={showDifficultyDetails}
        onOpenChange={setShowDifficultyDetails}
      >
        <DialogContent className="max-w-2xl">
          {selectedDifficultyForDetails &&
            difficultyDetails[
              selectedDifficultyForDetails as keyof typeof difficultyDetails
            ] && (
              <>
                <DialogHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        difficultyDetails[
                          selectedDifficultyForDetails as keyof typeof difficultyDetails
                        ].bgColor
                      }`}
                    >
                      {(() => {
                        const DetailIcon =
                          difficultyDetails[
                            selectedDifficultyForDetails as keyof typeof difficultyDetails
                          ].icon;
                        return (
                          <DetailIcon
                            className={`w-6 h-6 ${
                              difficultyDetails[
                                selectedDifficultyForDetails as keyof typeof difficultyDetails
                              ].color
                            }`}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">
                        {
                          difficultyDetails[
                            selectedDifficultyForDetails as keyof typeof difficultyDetails
                          ].title
                        }
                      </DialogTitle>
                      <DialogDescription className="text-base mt-2">
                        {
                          difficultyDetails[
                            selectedDifficultyForDetails as keyof typeof difficultyDetails
                          ].description
                        }
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  {/* What's Covered */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-primary" />
                      What's Covered
                    </h3>
                    <ul className="space-y-2">
                      {difficultyDetails[
                        selectedDifficultyForDetails as keyof typeof difficultyDetails
                      ].details.map((detail, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-muted-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended For */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      Recommended For
                    </h3>
                    <p className="text-muted-foreground">
                      {
                        difficultyDetails[
                          selectedDifficultyForDetails as keyof typeof difficultyDetails
                        ].recommendedFor
                      }
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => setShowDifficultyDetails(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedDifficulty(selectedDifficultyForDetails);
                        setShowDifficultyDetails(false);
                      }}
                    >
                      Filter by {selectedDifficultyForDetails}
                    </Button>
                  </div>
                </div>
              </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
