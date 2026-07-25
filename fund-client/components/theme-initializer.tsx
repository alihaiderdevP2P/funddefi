"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { loadThemePreference } from "@/lib/theme-preferences";

export function ThemeInitializer() {
  const { setTheme } = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) return;

      const savedTheme = loadThemePreference();
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch {
      // ignore invalid stored theme preferences
    }
  }, [setTheme]);

  return null;
}
