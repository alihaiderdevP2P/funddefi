"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import type { ReactNode } from "react";
import { getI18n } from "@/lib/i18n/i18n";
import type {
  SupportedLocale,
  TranslationKey,
  TranslationParams,
} from "@/lib/i18n/i18n";

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  getAcceptLanguageHeader: () => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Get default locale from environment
const getDefaultLocale = (): SupportedLocale => {
  if (typeof window !== "undefined") {
    const envDefault =
      process.env.NEXT_PUBLIC_LANG_DEFAULT ||
      (window as any).__NEXT_PUBLIC_LANG_DEFAULT__;
    if (envDefault && ["en", "es", "fr"].includes(envDefault)) {
      return envDefault as SupportedLocale;
    }
  }
  return "en";
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] =
    useState<SupportedLocale>(getDefaultLocale());
  const i18n = useMemo(() => getI18n(), []);

  useEffect(() => {
    // Initialize locale from localStorage or browser
    if (typeof window !== "undefined") {
      const savedLocale =
        (localStorage.getItem("locale") as SupportedLocale) || i18n.getLocale();
      if (savedLocale && ["en", "es", "fr"].includes(savedLocale)) {
        setLocaleState(savedLocale);
        i18n.setLocale(savedLocale);
      } else {
        // Use default from env if no saved preference
        const defaultLocale = getDefaultLocale();
        setLocaleState(defaultLocale);
        i18n.setLocale(defaultLocale);
      }
    }
  }, [i18n]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      if (locale === newLocale) return; // Prevent unnecessary updates

      // Use requestAnimationFrame to batch updates and avoid forced reflow
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
          setLocaleState(newLocale);
          i18n.setLocale(newLocale);
          // Debounce event dispatch to prevent multiple re-renders
          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.dispatchEvent(new Event("localechange"));
            }, 0);
          }
        });
      } else {
        setLocaleState(newLocale);
        i18n.setLocale(newLocale);
        // Debounce event dispatch to prevent multiple re-renders
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.dispatchEvent(new Event("localechange"));
          }, 0);
        }
      }
    },
    [i18n, locale]
  );

  // Memoize translation function with stable reference
  const translate = useCallback(
    (key: TranslationKey, params?: TranslationParams) => {
      // Use current locale from i18n instance to ensure latest translations
      return i18n.t(key, params);
    },
    [i18n, locale] // Only recreate when locale changes
  );

  // Memoize header function
  const getAcceptLanguageHeader = useCallback(() => {
    return i18n.getAcceptLanguageHeader();
  }, [i18n, locale]);

  // Stable context value - only update when dependencies change
  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: translate,
      getAcceptLanguageHeader,
    }),
    [locale, setLocale, translate, getAcceptLanguageHeader]
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
