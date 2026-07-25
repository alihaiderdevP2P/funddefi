"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

interface RoleAuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: ("user" | "admin" | "superadmin")[];
  title?: string;
  description?: string;
}

export function RoleAuthGuard({
  children,
  requiredRoles = ["user"],
  title,
  description,
}: RoleAuthGuardProps) {
  const { isAuthenticated, user, loading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Don't redirect immediately, show the auth prompt instead
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                FundFlow
              </span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {title || "Authentication Required"}
              </CardTitle>
              <CardDescription>
                {description || "Please sign in to access this feature"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground mb-6">
                <p>You need to be logged in to access this feature.</p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Link>
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check role permissions
  const hasRequiredRole = requiredRoles.some((role) => {
    switch (role) {
      case "user":
        return true; // All authenticated users have user role
      case "admin":
        return isAdmin;
      case "superadmin":
        return isSuperAdmin;
      default:
        return false;
    }
  });

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-destructive">
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to access this feature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground mb-6">
                <p>
                  This feature requires {requiredRoles.join(" or ")} role. Your
                  current role: <strong>{user?.role}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/campaigns">Browse Campaigns</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
