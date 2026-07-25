"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  Mail,
  Send,
  CheckCircle,
  Clock,
  Bug,
  Users,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Flag,
  ArrowRight,
  Copy,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  supportAPI,
  type HelpCategory,
  type HelpArticle,
  type SubmitTicketInput,
} from "@/lib/support-api";
import { SUPPORT_FAQS, CATEGORY_ICONS } from "@/lib/support-data";
import { SupportLiveChat } from "@/components/support/support-live-chat";

const CATEGORY_ICON_MAP: Record<string, typeof HelpCircle> = {
  general: HelpCircle,
  technical: Bug,
  campaigns: Users,
  payments: CheckCircle2,
};

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  priority?: string;
  subject?: string;
  description?: string;
}

function validateTicketForm(form: {
  name: string;
  email: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Full name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Invalid email format";
  }
  if (!form.category) errors.category = "Please select a category";
  if (!form.priority) errors.priority = "Please select a priority";
  if (!form.subject.trim()) {
    errors.subject = "Subject is required";
  } else if (form.subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters";
  }
  if (!form.description.trim()) {
    errors.description = "Description is required";
  } else if (form.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  return errors;
}

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    category: "",
    priority: "",
    subject: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [estimatedResponse, setEstimatedResponse] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setTicketForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await supportAPI.getCategories();
      setCategories(data);
    } catch {
      toast({
        title: "Could not load help articles",
        description: "Showing cached content. Ensure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await supportAPI.search(searchQuery.trim());
        setSearchResults(data.articles);
        setShowSearchResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORT_FAQS;
    const q = searchQuery.toLowerCase();
    return SUPPORT_FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            (a.summary && a.summary.toLowerCase().includes(q))
        ),
      }))
      .filter((cat) => cat.articles.length > 0);
  }, [categories, searchQuery]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateTicketForm(ticketForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmittingTicket(true);

    try {
      const payload: SubmitTicketInput = {
        fullName: ticketForm.name.trim(),
        email: ticketForm.email.trim(),
        category: ticketForm.category as SubmitTicketInput["category"],
        priority: ticketForm.priority as SubmitTicketInput["priority"],
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
      };

      const data = await supportAPI.submitTicket(payload);

      setTicketId(data.ticketNumber);
      setEstimatedResponse(data.estimatedResponseTime);

      setTicketForm({
        name: user?.name || "",
        email: user?.email || "",
        category: "",
        priority: "",
        subject: "",
        description: "",
      });

      document
        .getElementById("support-ticket")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "Failed to Create Ticket",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const scrollToTicket = (prefill?: { category?: string; subject?: string }) => {
    if (prefill?.category) {
      setTicketForm((prev) => ({
        ...prev,
        category: prefill.category || prev.category,
        subject: prefill.subject || prev.subject,
      }));
    }
    document
      .getElementById("support-ticket")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const renderArticleContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const formatted = line.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
      return (
        <p
          key={i}
          className="text-muted-foreground mb-2"
          dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            <Link href="/campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
              Campaigns
            </Link>
            <Link href="/create" className="text-muted-foreground hover:text-foreground transition-colors">
              Start Campaign
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/support" className="text-foreground font-medium" aria-current="page">
              Support
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/create">Start Campaign</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              How can we <span className="text-primary">help you?</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support
              team. We&apos;re here to help you succeed with FundFlow.
            </p>

            <div className="max-w-md mx-auto relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"
                aria-hidden="true"
              />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                aria-label="Search help articles and FAQs"
                role="searchbox"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}

              {showSearchResults && searchQuery.trim() && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto text-left"
                  role="listbox"
                  aria-label="Search results"
                >
                  {searchResults.length === 0 && !isSearching ? (
                    <p className="p-4 text-sm text-muted-foreground">
                      No articles found for &quot;{searchQuery}&quot;
                    </p>
                  ) : (
                    searchResults.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        className="w-full text-left p-3 hover:bg-muted/50 transition-colors border-b last:border-0"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowSearchResults(false);
                        }}
                        role="option"
                      >
                        <p className="font-medium text-sm">{article.title}</p>
                        {article.summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {article.summary}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                  {filteredFaqs.length > 0 && (
                    <div className="p-2 border-t">
                      <p className="text-xs text-muted-foreground px-2 py-1">
                        {filteredFaqs.length} matching FAQ
                        {filteredFaqs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    className="w-full p-2 text-xs text-muted-foreground hover:bg-muted/50"
                    onClick={() => setShowSearchResults(false)}
                  >
                    Close results
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl mb-2">Support Center</CardTitle>
                <CardDescription className="text-base">
                  Get help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" className="w-full group-hover:bg-primary/90" asChild>
                  <a href="#contact">
                    Visit Support
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl mb-2">Community</CardTitle>
                <CardDescription className="text-base">
                  Join our vibrant community
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full group-hover:bg-purple-50 dark:group-hover:bg-purple-950"
                  asChild
                >
                  <a href="https://discord.gg/fundflow" target="_blank" rel="noopener noreferrer">
                    Join Discord
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-red-500/50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Flag className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-2xl mb-2">Report Issue</CardTitle>
                <CardDescription className="text-base">
                  Found a bug? Let us know!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full group-hover:bg-red-50 dark:group-hover:bg-red-950"
                  onClick={() =>
                    scrollToTicket({
                      category: "bug",
                      subject: "Bug Report: ",
                    })
                  }
                >
                  Report Bug
                  <Bug className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20" id="categories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find help organized by topic and issue type.
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {(searchQuery.trim() ? filteredCategories : categories).map(
                (category) => {
                  const IconComponent =
                    CATEGORY_ICON_MAP[category.id] || HelpCircle;
                  const meta = CATEGORY_ICONS[category.id];

                  return (
                    <Card
                      key={category.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 ${meta?.color || "bg-blue-500"} rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent className="w-5 h-5 text-white" aria-hidden="true" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                            <CardDescription className="text-sm">
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.articles.slice(0, 3).map((article) => (
                            <button
                              key={article.id}
                              type="button"
                              className="flex items-center justify-between w-full p-2 rounded hover:bg-muted/50 transition-colors text-left"
                              onClick={() => setSelectedArticle(article)}
                            >
                              <span className="text-sm font-medium line-clamp-1">
                                {article.title}
                              </span>
                              <Badge variant="outline" className="text-xs shrink-0 ml-2">
                                published
                              </Badge>
                            </button>
                          ))}
                          {category.totalArticles > 3 && (
                            <p className="text-sm text-muted-foreground text-center pt-2">
                              +{category.totalArticles - 3} more articles
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quick answers to the most common questions about FundFlow.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No FAQs match your search.
              </p>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border rounded-lg px-4 bg-background"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Badge variant="secondary" className="shrink-0">
                          {faq.tag}
                        </Badge>
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground pl-1">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Still need help? Choose the best way to reach our support team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">Live Chat</CardTitle>
                <CardDescription>Get instant help from our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                    Available 24/7
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    Response time: &lt; 5 mins
                  </div>
                </div>
                <Button className="w-full" onClick={() => setIsChatOpen(true)}>
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">Email Support</CardTitle>
                <CardDescription>Send us a detailed message</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                    Available 24/7
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    Response time: &lt; 24 hours
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <a href="mailto:support@fundflow.io?subject=Support Request">
                    Send Email
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">Phone Support</CardTitle>
                <CardDescription>Speak directly with our team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" aria-hidden="true" />
                    Mon-Fri, 9am-5pm
                  </div>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
                    Response time: &lt; 10 mins
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <a href="tel:+18003863356">Call Now</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="support-ticket" className="py-20 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Submit a Support Ticket
              </h2>
              <p className="text-muted-foreground">
                Can&apos;t find what you&apos;re looking for? Submit a detailed support
                ticket.
              </p>
            </div>

            {ticketId && (
              <Card className="mb-6 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
                    <CardTitle className="text-green-900 dark:text-green-100">
                      Ticket Created Successfully!
                    </CardTitle>
                  </div>
                  <CardDescription className="text-green-800 dark:text-green-200">
                    Your ticket ID:{" "}
                    <strong className="font-mono">{ticketId}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    We&apos;ve received your support request and sent a confirmation
                    email. Our team will respond within{" "}
                    {estimatedResponse || "24 hours"}.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(ticketId);
                        toast({
                          title: "Ticket ID Copied",
                          description: "Ticket ID copied to clipboard",
                        });
                      }}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Ticket ID
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTicketId(null);
                        setEstimatedResponse(null);
                      }}
                      className="flex-1"
                    >
                      Submit Another Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!ticketId && (
              <Card>
                <CardHeader>
                  <CardTitle>Support Ticket</CardTitle>
                  <CardDescription>
                    Provide as much detail as possible to help us assist you better.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={ticketForm.name}
                          onChange={(e) =>
                            setTicketForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          aria-invalid={!!formErrors.name}
                          aria-describedby={formErrors.name ? "name-error" : undefined}
                        />
                        {formErrors.name && (
                          <p id="name-error" className="text-sm text-destructive mt-1">
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={ticketForm.email}
                          onChange={(e) =>
                            setTicketForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          aria-invalid={!!formErrors.email}
                          aria-describedby={formErrors.email ? "email-error" : undefined}
                        />
                        {formErrors.email && (
                          <p id="email-error" className="text-sm text-destructive mt-1">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={ticketForm.category}
                          onValueChange={(value) =>
                            setTicketForm((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger id="category" aria-invalid={!!formErrors.category}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Support</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="campaign">Campaign Management</SelectItem>
                            <SelectItem value="payment">Payment Issue</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.category && (
                          <p className="text-sm text-destructive mt-1">{formErrors.category}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority *</Label>
                        <Select
                          value={ticketForm.priority}
                          onValueChange={(value) =>
                            setTicketForm((prev) => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger id="priority" aria-invalid={!!formErrors.priority}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.priority && (
                          <p className="text-sm text-destructive mt-1">{formErrors.priority}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={ticketForm.subject}
                        onChange={(e) =>
                          setTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                        }
                        aria-invalid={!!formErrors.subject}
                      />
                      {formErrors.subject && (
                        <p className="text-sm text-destructive mt-1">{formErrors.subject}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide detailed information about your issue..."
                        rows={6}
                        value={ticketForm.description}
                        onChange={(e) =>
                          setTicketForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        aria-invalid={!!formErrors.description}
                      />
                      {formErrors.description && (
                        <p className="text-sm text-destructive mt-1">
                          {formErrors.description}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmittingTicket}
                    >
                      {isSubmittingTicket ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Submitting Ticket...
                        </>
                      ) : (
                        <>
                          Submit Ticket
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">FundFlow</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Building the future of crowdfunding with blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/campaigns" className="hover:text-foreground transition-colors">Browse Campaigns</Link></li>
                <li><Link href="/create" className="hover:text-foreground transition-colors">Start Campaign</Link></li>
                <li><Link href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>© 2024 FundFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <SupportLiveChat open={isChatOpen} onOpenChange={setIsChatOpen} />

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription>
              {selectedArticle?.summary}
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="mt-4">{renderArticleContent(selectedArticle.content)}</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
