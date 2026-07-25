"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Loader2, MailX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogAPI } from "@/lib/blog-api";

export default function UnsubscribePage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const result = await blogAPI.unsubscribeNewsletter(email.trim());
      setDone(true);
      toast({ title: "Unsubscribed", description: result.message });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Could not find this subscription.";
      toast({
        title: "Unsubscribe failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FundFlow</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20 max-w-md">
        <Card>
          <CardContent className="pt-8 pb-8">
            {done ? (
              <div className="text-center">
                <MailX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Unsubscribed</h1>
                <p className="text-muted-foreground mb-6">
                  You will no longer receive newsletter emails from FundFlow.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/blog">Back to Blog</Link>
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2 text-center">
                  Unsubscribe
                </h1>
                <p className="text-muted-foreground text-center mb-6">
                  Enter your email to unsubscribe from the FundFlow newsletter.
                </p>
                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email address"
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Unsubscribe"
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
