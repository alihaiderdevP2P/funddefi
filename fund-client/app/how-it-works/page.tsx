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
  Play,
  Users,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Clock,
  DollarSign,
  Target,
  Heart,
  Rocket,
  Globe,
  Lock,
  TrendingUp,
  Star,
  Award,
  MessageSquare,
  FileText,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Connect Your Wallet",
    description:
      "Link your MetaMask, WalletConnect, or Coinbase Wallet to get started with FundFlow.",
    icon: Shield,
    details: [
      "Secure blockchain connection",
      "Multiple wallet support",
      "No account registration needed",
      "Instant access to platform",
    ],
    color: "bg-blue-500",
  },
  {
    number: 2,
    title: "Create Your Campaign",
    description:
      "Set up your project with compelling content, funding goals, and rewards for backers.",
    icon: Rocket,
    details: [
      "Step-by-step campaign builder",
      "AI-powered content suggestions",
      "Reward tier management",
      "Smart contract deployment",
    ],
    color: "bg-green-500",
  },
  {
    number: 3,
    title: "Share & Promote",
    description:
      "Spread the word about your campaign through social media and our platform's discovery features.",
    icon: Globe,
    details: [
      "Built-in sharing tools",
      "Social media integration",
      "Community features",
      "Analytics dashboard",
    ],
    color: "bg-purple-500",
  },
  {
    number: 4,
    title: "Receive Funding",
    description:
      "Collect funds securely through blockchain transactions and deliver rewards to your backers.",
    icon: DollarSign,
    details: [
      "Automatic fund collection",
      "Smart contract execution",
      "Reward fulfillment tracking",
      "Transparent reporting",
    ],
    color: "bg-orange-500",
  },
];

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "All transactions are secured by smart contracts and recorded on the blockchain for complete transparency.",
    benefits: [
      "Immutable records",
      "No intermediaries",
      "Transparent transactions",
      "Reduced fraud",
    ],
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description:
      "Funds are automatically distributed when campaign goals are met, with no waiting periods.",
    benefits: [
      "Automatic execution",
      "No manual processing",
      "24/7 availability",
      "Global accessibility",
    ],
  },
  {
    icon: Users,
    title: "Global Community",
    description:
      "Reach backers worldwide without geographical restrictions or currency limitations.",
    benefits: [
      "Worldwide reach",
      "Multiple currencies",
      "24/7 funding",
      "Diverse backers",
    ],
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Insights",
    description:
      "Get intelligent recommendations for campaign optimization and content improvement.",
    benefits: [
      "Content suggestions",
      "Performance analytics",
      "Optimization tips",
      "Success predictions",
    ],
  },
];

const benefits = [
  {
    title: "For Creators",
    icon: Rocket,
    items: [
      "No upfront costs to launch campaigns",
      "Keep 95% of funds raised (5% platform fee)",
      "Global reach and accessibility",
      "AI-powered campaign optimization",
      "Transparent and secure funding process",
      "Community building tools",
    ],
  },
  {
    title: "For Backers",
    icon: Heart,
    items: [
      "Support innovative projects worldwide",
      "Receive exclusive rewards and perks",
      "Transparent project tracking",
      "Secure blockchain transactions",
      "Community engagement opportunities",
      "Early access to new products",
    ],
  },
];

const faqs = [
  {
    question: "How does FundFlow differ from traditional crowdfunding?",
    answer:
      "FundFlow uses blockchain technology and smart contracts to eliminate intermediaries, reduce fees, and provide transparent, secure funding. Traditional platforms often have higher fees and longer processing times.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "We support MetaMask, WalletConnect, and Coinbase Wallet. These are the most popular and secure Web3 wallets available.",
  },
  {
    question: "How are funds secured?",
    answer:
      "All funds are held in smart contracts on the blockchain. These contracts automatically execute when campaign conditions are met, ensuring secure and transparent fund management.",
  },
  {
    question: "What happens if a campaign doesn't reach its goal?",
    answer:
      "If a campaign doesn't reach its funding goal by the end date, all backers are automatically refunded through the smart contract. This is handled automatically and transparently.",
  },
  {
    question: "How long does it take to receive funds?",
    answer:
      "Once your campaign reaches its goal, funds are automatically transferred to your wallet within 24-48 hours, depending on blockchain network conditions.",
  },
  {
    question: "Are there any geographical restrictions?",
    answer:
      "No! FundFlow is accessible worldwide. Anyone with an internet connection and a supported wallet can create campaigns or back projects from anywhere in the world.",
  },
];

const stats = [
  { number: "500+", label: "Successful Campaigns", icon: Award },
  { number: "$2.5M+", label: "Total Raised", icon: DollarSign },
  { number: "10K+", label: "Active Backers", icon: Users },
  { number: "95%", label: "Success Rate", icon: TrendingUp },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground" />
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
            <Link href="/how-it-works" className="text-foreground font-medium">
              How It Works
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
              How FundFlow <span className="text-primary">Works</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover how blockchain technology is revolutionizing
              crowdfunding. Learn about our transparent, secure, and efficient
              funding process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/create">
                  Start Your Campaign
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/campaigns">Explore Campaigns</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with FundFlow in just four simple steps.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-center gap-8"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center text-white text-2xl font-bold`}
                    >
                      {step.number}
                    </div>
                  </div>

                  <div className="flex-1">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-4">
                          <div
                            className={`w-12 h-12 ${step.color} rounded-lg flex items-center justify-center`}
                          >
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">
                              {step.title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {step.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-3">
                          {step.details.map((detail, detailIndex) => (
                            <div
                              key={detailIndex}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">
                                {detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose FundFlow?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the benefits of blockchain-powered crowdfunding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              FundFlow creates value for both creators and backers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {benefit.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about FundFlow.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators and backers who are already using
              FundFlow to bring their ideas to life and support innovative
              projects.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/create">
                  Create Your Campaign
                  <Rocket className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/campaigns">
                  Explore Campaigns
                  <Heart className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Learn More</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Read our comprehensive documentation
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/docs">
                    View Docs
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Get Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help? Our support team is here
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/support">
                    Contact Support
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Success Stories</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See how others have succeeded
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/blog">
                    Read Stories
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
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
                  <Play className="w-5 h-5 text-primary-foreground" />
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
    </div>
  );
}
