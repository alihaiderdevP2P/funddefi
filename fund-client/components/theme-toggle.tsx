"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  saveThemePreference,
  type ThemePreference,
} from "@/lib/theme-preferences";

const themeOptions = [
  {
    value: "light" as const,
    label: "Light",
    icon: Sun,
    activeClass:
      "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-100 dark:text-zinc-900",
    swatchClass: "bg-white border border-zinc-200",
  },
  {
    value: "dark" as const,
    label: "Dark",
    icon: Moon,
    activeClass:
      "bg-zinc-900 text-white font-medium dark:bg-zinc-900 dark:text-white",
    swatchClass: "bg-zinc-900 border border-zinc-700",
  },
  {
    value: "system" as const,
    label: "System",
    icon: Monitor,
    activeClass: "bg-sky-500/15 text-sky-700 font-medium dark:text-sky-300",
    swatchClass:
      "bg-gradient-to-r from-white via-zinc-300 to-zinc-900 border border-zinc-300",
  },
];

function applyTheme(
  value: ThemePreference,
  setTheme: (theme: ThemePreference) => void
) {
  setTheme(value);
  saveThemePreference(value);
}

function getSystemLabel(resolvedTheme?: string) {
  if (resolvedTheme === "dark") return "System · Dark";
  if (resolvedTheme === "light") return "System · Light";
  return "System";
}

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isSystem = theme === "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          {isSystem ? (
            <Monitor className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {themeOptions.map(({ value, label, icon: Icon, activeClass, swatchClass }) => {
          const isActive = theme === value;
          const displayLabel =
            value === "system" && isActive
              ? getSystemLabel(resolvedTheme)
              : label;

          return (
            <DropdownMenuItem
              key={value}
              onSelect={() => applyTheme(value, setTheme)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                isActive && activeClass
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn("h-3.5 w-3.5 rounded-full shrink-0", swatchClass)}
                  aria-hidden="true"
                />
                <Icon className="h-4 w-4" />
                <span>{displayLabel}</span>
              </span>
              {isActive && <Check className="h-4 w-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SimpleThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9"
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        applyTheme(nextTheme, setTheme);
      }}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
