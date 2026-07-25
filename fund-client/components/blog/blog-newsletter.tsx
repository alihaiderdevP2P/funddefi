"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogAPI } from "@/lib/blog-api";
import Link from "next/link";

interface BlogNewsletterProps {
  className?: string;
}

export function BlogNewsletter({ className }: BlogNewsletterProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;

    const trimmed = email.trim();
    if (!trimmed) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(trimmed)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await blogAPI.subscribeNewsletter(trimmed, honeypot);
      setSubscribed(true);
      setEmail("");
      toast({
        title: "Subscribed!",
        description: result.message,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          .response?.data?.message;
      const text = Array.isArray(message)
        ? message[0]
        : message || "Subscription failed. Please try again.";

      if (text.toLowerCase().includes("already subscribed")) {
        toast({
          title: "Already subscribed",
          description: "This email is already on our mailing list.",
        });
      } else {
        toast({
          title: "Subscription failed",
          description: text,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <section className={className}>
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-8 pb-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">You&apos;re subscribed!</h3>
              <p className="text-muted-foreground">
                Thank you for joining the FundFlow newsletter. We&apos;ll send you
                the latest articles and insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Stay Updated</h2>
        <p className="text-muted-foreground mb-8">
          Get the latest articles, tips, and insights delivered to your inbox.
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate aria-label="Newsletter subscription">
              {/* Honeypot — hidden from users, catches bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    aria-label="Email address"
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" disabled={loading} className="shrink-0">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                We respect your privacy.{" "}
                <Link
                  href="/blog/unsubscribe"
                  className="underline hover:text-foreground"
                >
                  Unsubscribe
                </Link>{" "}
                at any time.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
