"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  contactAPI,
  type ContactConfig,
  type ChatMessage,
  type ContactMessageCategory,
  type ContactMessageSubject,
} from "@/lib/contact-api";
import {
  CONTACT_FAQS,
  CONTACT_SUBJECT_OPTIONS,
  CONTACT_CATEGORY_OPTIONS,
} from "@/lib/contact-data";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Bug,
  Lightbulb,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, typeof MessageSquare> = {
  general: MessageSquare,
  support: HelpCircle,
  bug: Bug,
  feature: Lightbulb,
  partnership: Users,
};

const DEFAULT_CONFIG: ContactConfig = {
  supportEmail: "support@fundflow.com",
  supportPhone: "+15550000000",
  supportPhoneDisplay: "+1 (555) 000-0000",
  chatHours: "Mon-Fri, 9 AM - 6 PM PST",
  isBusinessHours: true,
  office: {
    address: "123 Blockchain Blvd",
    city: "San Francisco, CA 94105",
    country: "United States",
    mapQuery: "123+Blockchain+Blvd+San+Francisco+CA+94105",
  },
  officeHours: [
    { days: "Monday - Friday", hours: "9:00 AM - 6:00 PM PST" },
    { days: "Saturday", hours: "10:00 AM - 4:00 PM PST" },
    { days: "Sunday", hours: "Closed" },
  ],
};

function ContactPageContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const campaignId = searchParams.get("campaign");
  const creatorId = searchParams.get("creator");
  const backerId = searchParams.get("backer");

  const [config, setConfig] = useState<ContactConfig>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "" as ContactMessageSubject | "",
    category: "" as ContactMessageCategory | "",
    message: "",
    honeypot: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  useEffect(() => {
    contactAPI
      .getConfig()
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_CONFIG))
      .finally(() => setConfigLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (campaignId || creatorId || backerId) {
      const parts: string[] = [];
      if (campaignId) parts.push(`Campaign: ${campaignId}`);
      if (creatorId) parts.push(`Creator: ${creatorId}`);
      if (backerId) parts.push(`Backer: ${backerId}`);
      setFormData((prev) => ({
        ...prev,
        subject: prev.subject || "campaign_support",
        category: prev.category || "general",
        message:
          prev.message ||
          `Hi,\n\nI'd like to get in touch regarding:\n${parts.join("\n")}\n\n`,
      }));
    }
  }, [campaignId, creatorId, backerId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.subject) {
      errors.subject = "Please choose a subject.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmittedRef(null);
    try {
      const result = await contactAPI.submitMessage({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject as ContactMessageSubject,
        category: (formData.category ||
          "general") as ContactMessageCategory,
        message: formData.message.trim(),
        userId: user?.id,
        relatedCampaignId: campaignId || undefined,
        relatedCreatorId: creatorId || undefined,
        relatedBackerId: backerId || undefined,
        companyWebsite: formData.honeypot || undefined,
      });

      setSubmittedRef(result.referenceNumber);
      toast({
        title: "Message sent",
        description: `Reference: ${result.referenceNumber}. We'll respond within 24 hours.`,
      });
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        category: "",
        message: "",
        honeypot: "",
      });
      setFormErrors({});
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
      const description = Array.isArray(msg)
        ? msg.join(", ")
        : typeof msg === "string"
          ? msg
          : "Please try again or email us directly.";
      toast({
        title: "Could not send message",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleEmailClick = () => {
    const subject = encodeURIComponent("FundFlow Support Request");
    window.location.href = `mailto:${config.supportEmail}?subject=${subject}`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${config.supportPhone}`;
  };

  const initChat = useCallback(async () => {
    setChatLoading(true);
    try {
      const existingId = contactAPI.getStoredChatSessionId();
      if (existingId) {
        const session = await contactAPI.getChatSession(existingId);
        if (session.status === "active") {
          setChatSessionId(existingId);
          setChatMessages(session.messages);
          return;
        }
        contactAPI.clearChatSession();
      }
      const created = await contactAPI.createChatSession({
        visitorName: user?.name,
        visitorEmail: user?.email,
      });
      setChatSessionId(created.sessionId);
      setChatMessages(created.messages);
    } catch {
      toast({
        title: "Chat unavailable",
        description: "Please use the contact form or email us directly.",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  }, [user, toast]);

  const handleChatClick = async () => {
    setIsChatOpen(true);
    if (!chatSessionId) {
      await initChat();
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !chatSessionId || chatSending) return;

    setChatSending(true);
    const content = chatInput.trim();
    setChatInput("");

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: chatSessionId,
      sender: "visitor",
      content,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, optimistic]);

    try {
      const { messages } = await contactAPI.sendChatMessage(
        chatSessionId,
        content
      );
      setChatMessages(messages);
    } catch {
      setChatMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setChatInput(content);
      toast({
        title: "Failed to send",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setChatSending(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "We help you as soon as we can.",
      contact: config.supportEmail,
      action: "Send Email",
      handler: handleEmailClick,
      ariaLabel: `Send email to ${config.supportEmail}`,
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Our team is ready to help you in real-time.",
      contact: config.chatHours,
      action: "Start Chat",
      handler: handleChatClick,
      ariaLabel: "Start live chat with support",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team.",
      contact: config.supportPhoneDisplay,
      action: "Call Now",
      handler: handlePhoneClick,
      ariaLabel: `Call ${config.supportPhoneDisplay}`,
    },
  ];

  const mapEmbedUrl = `https://www.google.com/maps?q=${config.office.mapQuery}&output=embed`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">FundFlow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8" aria-label="Main">
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
            <Link href="/contact" className="text-foreground font-medium">
              Contact
            </Link>
          </nav>

          <Button variant="outline" size="sm" asChild>
            <Link href="/create">Start Campaign</Link>
          </Button>
        </div>
      </header>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions? Need help? We&apos;re here to support you on your
              crowdfunding journey. Reach out through any channel below.
            </p>
            {(campaignId || creatorId || backerId) && (
              <Alert className="max-w-xl mx-auto text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You&apos;re contacting us about a campaign or user. Your
                  message will include that context automatically.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </section>

      <section className="py-20" aria-labelledby="help-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 id="help-heading" className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How Can We Help?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the best way to reach us based on your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {contactMethods.map((method) => (
              <Card
                key={method.title}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {method.contact}
                  </p>
                  <Button
                    className="w-full"
                    onClick={method.handler}
                    aria-label={method.ariaLabel}
                    disabled={configLoading && method.title === "Live Chat"}
                  >
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30" aria-labelledby="form-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 id="form-heading" className="text-3xl font-bold text-foreground mb-4">
                Send Us a Message
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and we&apos;ll get back to you as soon as
                possible.
              </p>
            </div>

            {submittedRef && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Thank you! Your reference number is{" "}
                  <strong className="font-mono">{submittedRef}</strong>. Save it
                  for follow-up.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contact Form</CardTitle>
                <CardDescription>
                  {isAuthenticated
                    ? `Signed in as ${user?.email}`
                    : "All fields marked * are required"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  noValidate
                  aria-label="Contact form"
                >
                  <div
                    className="absolute -left-[9999px] w-px h-px overflow-hidden"
                    aria-hidden="true"
                  >
                    <Label htmlFor="companyWebsite">Company website</Label>
                    <Input
                      id="companyWebsite"
                      name="companyWebsite"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) =>
                        handleInputChange("honeypot", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">
                        Full Name <span aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        aria-required="true"
                        aria-invalid={!!formErrors.name}
                        aria-describedby={
                          formErrors.name ? "name-error" : undefined
                        }
                        autoComplete="name"
                      />
                      {formErrors.name && (
                        <p
                          id="name-error"
                          className="text-sm text-destructive mt-1"
                          role="alert"
                        >
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">
                        Email Address <span aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        aria-required="true"
                        aria-invalid={!!formErrors.email}
                        aria-describedby={
                          formErrors.email ? "email-error" : undefined
                        }
                        autoComplete="email"
                      />
                      {formErrors.email && (
                        <p
                          id="email-error"
                          className="text-sm text-destructive mt-1"
                          role="alert"
                        >
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">
                      Subject <span aria-hidden="true">*</span>
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        handleInputChange("subject", value)
                      }
                    >
                      <SelectTrigger
                        id="subject"
                        aria-required="true"
                        aria-invalid={!!formErrors.subject}
                      >
                        <SelectValue placeholder="Choose a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_SUBJECT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.subject && (
                      <p className="text-sm text-destructive mt-1" role="alert">
                        {formErrors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_CATEGORY_OPTIONS.map((opt) => {
                          const Icon = CATEGORY_ICONS[opt.value] || MessageSquare;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center">
                                <Icon className="w-4 h-4 mr-2" aria-hidden />
                                {opt.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">
                      Message <span aria-hidden="true">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Please describe your question or issue in detail..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      aria-required="true"
                      aria-invalid={!!formErrors.message}
                      aria-describedby={
                        formErrors.message ? "message-error" : undefined
                      }
                    />
                    {formErrors.message && (
                      <p
                        id="message-error"
                        className="text-sm text-destructive mt-1"
                        role="alert"
                      >
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" aria-hidden />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2
              id="faq-heading"
              className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to common questions about FundFlow.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="max-w-4xl mx-auto"
          >
            {CONTACT_FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 bg-muted/30" aria-labelledby="office-heading">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2
                id="office-heading"
                className="text-3xl font-bold text-foreground mb-4"
              >
                Visit Our Office
              </h2>
              <p className="text-muted-foreground">
                Come say hello at our headquarters in San Francisco
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" aria-hidden />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <address className="text-muted-foreground not-italic">
                    {config.office.address}
                    <br />
                    {config.office.city}
                    <br />
                    {config.office.country}
                  </address>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" aria-hidden />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    {config.officeHours.map((row) => (
                      <li key={row.days}>
                        <span className="font-medium text-foreground">
                          {row.days}:
                        </span>{" "}
                        {row.hours}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg overflow-hidden border border-border aspect-video max-h-96">
              <iframe
                title="FundFlow office location on Google Maps"
                src={mapEmbedUrl}
                className="w-full h-full min-h-[280px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
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
                  <Link href="/campaigns" className="hover:text-foreground">
                    Browse Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-foreground">
                    Start Campaign
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-foreground">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-foreground">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
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

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md" aria-describedby="chat-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" aria-hidden />
              Live Chat Support
            </DialogTitle>
            <DialogDescription id="chat-desc">
              {config.isBusinessHours
                ? "Chat with our team. Messages are saved for follow-up."
                : `Agents are offline (${config.chatHours}). You can still leave a message.`}
            </DialogDescription>
          </DialogHeader>

          {chatLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ScrollArea className="h-96 pr-4" role="log" aria-live="polite">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "visitor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === "visitor"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === "visitor"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="sm:flex-col sm:space-y-2">
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    aria-label="Chat message"
                    disabled={chatSending || !chatSessionId}
                  />
                  <Button
                    onClick={handleSendChatMessage}
                    disabled={chatSending || !chatInput.trim() || !chatSessionId}
                    aria-label="Send chat message"
                  >
                    {chatSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center w-full">
                  {config.isBusinessHours
                    ? "Typically replies within minutes during business hours"
                    : "We'll email you within 24 hours if no agent is available"}
                </p>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}
