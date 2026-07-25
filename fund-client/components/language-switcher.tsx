"use client";

import { useI18n } from "@/hooks/use-i18n";
import { useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/lib/i18n/i18n";

const languages = [
  { value: "en" as const, region: "US", language: "EN" },
  { value: "es" as const, region: "ES", language: "ES" },
  { value: "fr" as const, region: "FR", language: "FR" },
] as const;

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const current =
    languages.find((lang) => lang.value === locale) ?? languages[0];

  const handleLanguageChange = useCallback(
    (newLocale: SupportedLocale) => {
      if (newLocale !== locale) {
        setLocale(newLocale);
      }
    },
    [locale, setLocale]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 min-w-[4.5rem] px-3 font-semibold uppercase tracking-wide"
          aria-label="Change language"
        >
          {current.region} {current.language}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[5.5rem] p-1">
        {languages.map((lang) => {
          const isActive = locale === lang.value;
          return (
            <DropdownMenuItem
              key={lang.value}
              onSelect={() => handleLanguageChange(lang.value)}
              className={cn(
                "flex items-center justify-center cursor-pointer uppercase tracking-wide text-sm py-2",
                isActive
                  ? "bg-accent font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lang.region} {lang.language}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
