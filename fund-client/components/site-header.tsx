"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnect } from "@/components/wallet-connect";
import { UserNavigation } from "@/components/user-navigation";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export type SiteHeaderVariant = "default" | "admin";

interface NavItem {
  href: string;
  label: string;
  match?: "exact" | "prefix";
  icon?: ReactNode;
}

interface SiteHeaderProps {
  variant?: SiteHeaderVariant;
  showWallet?: boolean;
  showLaunchCta?: boolean;
  className?: string;
}

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  variant = "default",
  showWallet = true,
  showLaunchCta = true,
  className,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isAuthenticated, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const defaultNav: NavItem[] = [
    {
      href: "/campaigns",
      label: t("home.nav.campaigns"),
      match: "prefix",
    },
    {
      href: "/create",
      label: t("home.nav.startCampaign"),
      match: "exact",
    },
    {
      href: "/about",
      label: t("home.nav.about"),
      match: "exact",
    },
  ];

  if (isAuthenticated) {
    defaultNav.push({
      href: "/dashboard",
      label: "Dashboard",
      match: "prefix",
    });
  }
  if (isAdmin) {
    defaultNav.push({
      href: "/admin",
      label: "Admin",
      match: "prefix",
      icon: <Shield className="w-4 h-4" />,
    });
  }

  const adminNav: NavItem[] = [
    { href: "/dashboard", label: "User Dashboard", match: "prefix" },
    { href: "/campaigns", label: "Public View", match: "prefix" },
    { href: "/settings", label: "Settings", match: "exact" },
  ];

  const navItems = variant === "admin" ? adminNav : defaultNav;

  const brand =
    variant === "admin" ? (
      <Link href="/admin" className="flex items-center space-x-2 shrink-0">
        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        <span className="font-bold text-lg sm:text-xl text-foreground">
          Admin
        </span>
      </Link>
    ) : (
      <Link href="/" className="flex items-center space-x-2 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl text-foreground">FundFlow</span>
      </Link>
    );

  return (
    <header
      className={cn(
        "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50",
        className
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {brand}

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => {
            const active = isActive(
              pathname,
              item.href,
              item.match ?? "exact"
            );
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 transition-colors whitespace-nowrap",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 md:gap-2">
            {variant === "default" && <LanguageSwitcher />}
            <ThemeToggle />
            {showWallet && variant === "default" && (
              <div className="hidden lg:block">
                <WalletConnect />
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <UserNavigation />
          </div>

          {showLaunchCta &&
            !isAuthenticated &&
            variant === "default" && (
              <Button size="sm" className="hidden lg:inline-flex" asChild>
                <Link href="/create">{t("home.nav.launchCampaign")}</Link>
              </Button>
            )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)] p-0 flex flex-col">
              <SheetHeader className="border-b border-border px-4 py-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  {variant === "admin" ? (
                    <>
                      <Shield className="w-5 h-5 text-primary" />
                      Admin Menu
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Menu
                    </>
                  )}
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 p-4 overflow-y-auto flex-1">
                {navItems.map((item) => {
                  const active = isActive(
                    pathname,
                    item.href,
                    item.match ?? "exact"
                  );
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-md px-3 text-base transition-colors",
                        active
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-border p-4 space-y-4 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  {variant === "default" && <LanguageSwitcher />}
                  <ThemeToggle />
                </div>

                {showWallet && variant === "default" && (
                  <div className="w-full [&_button]:w-full">
                    <WalletConnect />
                  </div>
                )}

                <div className="pt-1">
                  <UserNavigation />
                </div>

                {showLaunchCta &&
                  !isAuthenticated &&
                  variant === "default" && (
                    <Button className="w-full" asChild>
                      <Link href="/create" onClick={close}>
                        {t("home.nav.launchCampaign")}
                      </Link>
                    </Button>
                  )}

                {isAuthenticated && variant === "default" && (
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/create" onClick={close}>
                      {t("home.nav.startCampaign")}
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
