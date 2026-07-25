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
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  MapPin,
  Clock,
  Briefcase,
  Heart,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Mail,
  Linkedin,
  Twitter,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useCareers } from "@/hooks/use-careers";
import { careersAPI, type JobPosting } from "@/lib/careers-api";
import { uploadDocument } from "@/lib/upload-document";

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Comprehensive health, dental, and vision coverage for you and your family.",
    details: [
      "Full medical, dental, and vision insurance",
      "Mental health and wellness programs",
      "Gym membership reimbursement",
      "Annual health and wellness stipend ($1,000)",
      "Parental leave (16 weeks paid)",
      "Employee assistance program (EAP)",
    ],
  },
  {
    icon: Zap,
    title: "Flexible Work",
    description: "Remote-first culture with flexible hours and unlimited PTO.",
    details: [
      "Work from anywhere in the world",
      "Flexible working hours to fit your lifestyle",
      "Unlimited paid time off",
      "Home office setup stipend ($2,000)",
      "Co-working space membership",
      "Annual team retreats and offsites",
    ],
  },
  {
    icon: Shield,
    title: "Security & Stability",
    description:
      "Competitive salary, equity options, and 401k matching program.",
    details: [
      "Competitive market-rate salaries",
      "Equity/stock options for all employees",
      "401(k) retirement plan with 4% company match",
      "Life and disability insurance",
      "Professional development budget ($3,000/year)",
      "Sabbatical program after 5 years",
    ],
  },
  {
    icon: Globe,
    title: "Global Impact",
    description:
      "Work on technology that empowers creators and democratizes funding.",
    details: [
      "Work on cutting-edge blockchain technology",
      "Help democratize access to funding worldwide",
      "Contribute to open-source projects",
      "Speak at conferences and events",
      "Collaborate with global team members",
      "Make a real difference in people's lives",
    ],
  },
];

export default function CareersPage() {
  const { jobs, loading, error } = useCareers();
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<JobPosting | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [applicationData, setApplicationData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    resume: null as File | null,
    coverLetter: "",
  });

  const [generalInquiryData, setGeneralInquiryData] = useState({
    name: "",
    email: "",
    role: "",
    message: "",
  });

  const [isBenefitDialogOpen, setIsBenefitDialogOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<
    (typeof benefits)[0] | null
  >(null);

  const handleBenefitClick = (benefit: (typeof benefits)[0]) => {
    setSelectedBenefit(benefit);
    setIsBenefitDialogOpen(true);
  };

  const handleApplyClick = (position: JobPosting) => {
    setSelectedPosition(position);
    setIsApplicationDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setApplicationData({ ...applicationData, resume: e.target.files[0] });
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition || !applicationData.resume) return;

    setIsSubmitting(true);
    try {
      const resumeUrl = await uploadDocument(applicationData.resume);
      await careersAPI.submitApplication(selectedPosition.id, {
        fullName: applicationData.fullName,
        email: applicationData.email,
        phone: applicationData.phone || undefined,
        linkedin: applicationData.linkedIn || undefined,
        github: applicationData.github || undefined,
        portfolio: applicationData.portfolio || undefined,
        resumeUrl,
        coverLetter: applicationData.coverLetter,
      });

      toast({
        title: "Application Submitted!",
        description: `Your application for ${selectedPosition.title} has been successfully submitted. We'll get back to you within 5 business days.`,
      });

      setIsApplicationDialogOpen(false);
      setApplicationData({
        fullName: "",
        email: "",
        phone: "",
        linkedIn: "",
        github: "",
        portfolio: "",
        resume: null,
        coverLetter: "",
      });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description:
          err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneralInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await careersAPI.submitInquiry({
        fullName: generalInquiryData.name,
        email: generalInquiryData.email,
        interestedRole: generalInquiryData.role,
        message: generalInquiryData.message,
      });

      toast({
        title: "Message Sent Successfully!",
        description:
          "Thank you for your interest in FundFlow! We've received your message and will get back to you within 2-3 business days.",
        duration: 5000,
      });

      setGeneralInquiryData({
        name: "",
        email: "",
        role: "",
        message: "",
      });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description:
          err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
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
            <Link href="/careers" className="text-foreground font-medium">
              Careers
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
              Join Our Mission to{" "}
              <span className="text-primary">Democratize Funding</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Help us build the future of crowdfunding with blockchain
              technology. We're looking for passionate individuals who want to
              make a real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="#open-positions">
                  View Open Positions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#culture">Learn About Our Culture</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="culture" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Culture & Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe in transparency, innovation, and empowering creators
              worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleBenefitClick(benefit)}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                  <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more →
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our team and help shape the future of decentralized
              crowdfunding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {loading ? (
              <div className="col-span-2 flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="col-span-2 text-center py-16 text-muted-foreground">
                <p>{error}</p>
                <p className="text-sm mt-2">
                  Ensure the backend is running and careers migration is applied.
                </p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-2 text-center py-16 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No open positions at the moment. Check back soon!</p>
              </div>
            ) : (
              jobs.map((position) => (
              <Card
                key={position.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {position.title}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {position.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {position.jobType}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{position.posted}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {position.description}
                  </p>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {position.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <ArrowRight className="w-3 h-3 mr-2 text-primary" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleApplyClick(position)}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Application Dialog */}
      <Dialog
        open={isApplicationDialogOpen}
        onOpenChange={setIsApplicationDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedPosition?.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your application. We'll review
              it and get back to you within 5 business days.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  placeholder="John Doe"
                  value={applicationData.fullName}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={applicationData.email}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={applicationData.phone}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                <Input
                  id="linkedIn"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={applicationData.linkedIn}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      linkedIn: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/username"
                  value={applicationData.github}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      github: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={applicationData.portfolio}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      portfolio: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="resume">Resume/CV *</Label>
              <div className="mt-1">
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg appearance-none cursor-pointer hover:border-muted-foreground/50 focus:outline-none"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {applicationData.resume ? (
                        <span className="text-foreground font-medium">
                          {applicationData.resume.name}
                        </span>
                      ) : (
                        <>
                          Click to upload or drag and drop
                          <br />
                          <span className="text-xs">
                            PDF, DOC, DOCX (Max 5MB)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <Input
                    id="resume"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                required
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                rows={6}
                value={applicationData.coverLetter}
                onChange={(e) =>
                  setApplicationData({
                    ...applicationData,
                    coverLetter: e.target.value,
                  })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApplicationDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <FileText className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Don't See Your Role?
            </h2>
            <p className="text-muted-foreground mb-8">
              We're always looking for talented individuals. Send us your resume
              and let us know how you'd like to contribute.
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Send us your information and we'll get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleGeneralInquirySubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inquiry-name">Full Name *</Label>
                      <Input
                        id="inquiry-name"
                        placeholder="John Doe"
                        required
                        value={generalInquiryData.name}
                        onChange={(e) =>
                          setGeneralInquiryData({
                            ...generalInquiryData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="inquiry-email">Email *</Label>
                      <Input
                        id="inquiry-email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={generalInquiryData.email}
                        onChange={(e) =>
                          setGeneralInquiryData({
                            ...generalInquiryData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="inquiry-role">Interested Role *</Label>
                    <Select
                      value={generalInquiryData.role}
                      onValueChange={(value) =>
                        setGeneralInquiryData({
                          ...generalInquiryData,
                          role: value,
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="inquiry-message">Message *</Label>
                    <Textarea
                      id="inquiry-message"
                      placeholder="Tell us about yourself and why you're interested in FundFlow..."
                      rows={4}
                      required
                      value={generalInquiryData.message}
                      onChange={(e) =>
                        setGeneralInquiryData({
                          ...generalInquiryData,
                          message: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Mail className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefit Details Dialog */}
      <Dialog open={isBenefitDialogOpen} onOpenChange={setIsBenefitDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedBenefit && (
            <>
              <DialogHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <selectedBenefit.icon className="w-8 h-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl text-center">
                  {selectedBenefit.title}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {selectedBenefit.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  What's Included:
                </h4>
                <ul className="space-y-3">
                  {selectedBenefit.details.map((detail, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <DialogFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsBenefitDialogOpen(false);
                    // Scroll to open positions
                    document.getElementById("open-positions")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  View Open Positions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  FundFlow
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                Building the future of crowdfunding with blockchain technology.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
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
