"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">FundFlow</span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("home.footer.description")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("home.footer.platform")}
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/campaigns"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.browseCampaigns")}
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.nav.startCampaign")}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.howItWorks")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("home.footer.resources")}
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/docs"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.documentation")}
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.support")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("home.footer.company")}
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.nav.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.careers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors inline-block min-h-10 py-1"
                >
                  {t("home.footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>{t("home.footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
