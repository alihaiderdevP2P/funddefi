"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Users,
  Target,
  DollarSign,
  Image,
  FileText,
  Gift,
  Eye,
  ArrowRight,
  Lightbulb,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "Project Details",
    description: "Set up your campaign basics",
    icon: FileText,
    items: [
      "Compelling title and subtitle",
      "Choose the right category",
      "Upload project image",
      "Set your location",
    ],
    tips: [
      "Use clear, descriptive titles",
      "Choose high-quality images",
      "Be specific about your location",
    ],
  },
  {
    id: 2,
    title: "Funding Goals",
    description: "Define your financial targets",
    icon: Target,
    items: [
      "Set realistic funding goal",
      "Choose campaign duration",
      "Understand all-or-nothing model",
      "Plan for platform fees (5%)",
    ],
    tips: [
      "Research similar projects",
      "Include all costs in your goal",
      "30-45 days is optimal duration",
    ],
  },
  {
    id: 3,
    title: "Tell Your Story",
    description: "Connect with potential backers",
    icon: Users,
    items: [
      "Write compelling project description",
      "Explain the problem you're solving",
      "Share your passion and expertise",
      "Be transparent about risks",
    ],
    tips: [
      "Use storytelling techniques",
      "Include personal anecdotes",
      "Show your expertise",
      "Address potential concerns",
    ],
  },
  {
    id: 4,
    title: "Create Rewards",
    description: "Design attractive backer incentives",
    icon: Gift,
    items: [
      "Offer meaningful rewards",
      "Set appropriate pledge amounts",
      "Estimate delivery dates",
      "Consider shipping costs",
    ],
    tips: [
      "Start with lower-priced rewards",
      "Make rewards exclusive",
      "Be realistic about delivery",
      "Include digital rewards",
    ],
  },
  {
    id: 5,
    title: "Review & Launch",
    description: "Final check before going live",
    icon: Eye,
    items: [
      "Double-check all information",
      "Preview your campaign",
      "Test the funding flow",
      "Launch to the world",
    ],
    tips: [
      "Get feedback from friends",
      "Check for typos",
      "Ensure all links work",
      "Be ready to promote",
    ],
  },
];

const bestPractices = [
  {
    icon: Lightbulb,
    title: "AI-Powered Assistant",
    description:
      "Leverage our AI to generate compelling content, optimize your campaign description, and get personalized recommendations.",
    features: [
      "Smart content generation",
      "Campaign optimization tips",
      "Personalized recommendations",
      "Real-time analytics",
    ],
    stats: "95% success rate with AI assistance",
  },
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "Your campaign is secured by smart contracts, ensuring transparent and trustless funding with automatic refunds if goals aren't met.",
    features: [
      "Smart contract escrow",
      "Automatic refunds",
      "Transparent transactions",
      "Immutable records",
    ],
    stats: "100% secure, 0% fraud",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description:
      "Once your goal is reached, funds are automatically released to your wallet - no waiting for payment processing.",
    features: [
      "Automatic fund release",
      "No payment delays",
      "Global accessibility",
      "Multiple cryptocurrencies",
    ],
    stats: "Instant payouts in 2 minutes",
  },
];

export function CampaignCreationGuide() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          How to Create a Successful Campaign
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Follow our proven 5-step process to launch a campaign that resonates
          with backers and achieves your funding goals.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card key={step.id} className="relative">
            <div className="flex items-start space-x-4 p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <Badge variant="outline" className="text-sm">
                    Step {step.id}
                  </Badge>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>

                <p className="text-muted-foreground mb-4">{step.description}</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      What to Include
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {step.tips.map((tip, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-6 bg-background border-2 border-border rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-muted-foreground rotate-90" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Best Practices */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-8">
          Why Choose FundFlow?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {bestPractices.map((practice, index) => (
            <Card
              key={index}
              className={`text-center cursor-pointer transition-all duration-300 ${
                hoveredCard === index
                  ? "shadow-lg scale-105"
                  : "hover:shadow-md"
              } ${expandedCard === index ? "ring-2 ring-primary/20" : ""}`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => toggleCard(index)}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors ${
                    hoveredCard === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <practice.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  {practice.title}
                  {expandedCard === index ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </CardTitle>
                <Badge variant="secondary" className="mx-auto">
                  {practice.stats}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {practice.description}
                </CardDescription>

                {expandedCard === index && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t pt-3">
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        Key Features
                      </h4>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {practice.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        asChild
                      >
                        <Link href="/create">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">500+</div>
            <div className="text-sm text-muted-foreground">
              Successful Campaigns
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">$2.5M+</div>
            <div className="text-sm text-muted-foreground">Total Raised</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <div className="bg-muted/30 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Follow our step-by-step guide and launch your campaign in minutes
            with our intuitive creation process.
          </p>
          <Button size="lg" asChild>
            <Link href="/create">
              Start Creating Your Campaign
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
