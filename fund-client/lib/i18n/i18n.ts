import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";
import frTranslations from "./translations/fr.json";

export type SupportedLocale = "en" | "es" | "fr";
export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<SupportedLocale, Translations> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
};

// Get default and fallback from environment variables
const getDefaultLocale = (): SupportedLocale => {
  const envDefault =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LANG_DEFAULT) ||
    (typeof window !== "undefined" &&
      (window as any).__NEXT_PUBLIC_LANG_DEFAULT__);
  if (envDefault && ["en", "es", "fr"].includes(envDefault)) {
    return envDefault as SupportedLocale;
  }
  return "en"; // Default fallback
};

const getFallbackLocale = (): SupportedLocale => {
  const envFallback =
    (typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_LANG_FALLBACK) ||
    (typeof window !== "undefined" &&
      (window as any).__NEXT_PUBLIC_LANG_FALLBACK__);
  if (envFallback && ["en", "es", "fr"].includes(envFallback)) {
    return envFallback as SupportedLocale;
  }
  return "en"; // Default fallback
};

class I18nService {
  private locale: SupportedLocale = getDefaultLocale();
  private fallbackLocale: SupportedLocale = getFallbackLocale();
  // Cache for translation lookups to improve performance
  private translationCache: Map<string, string> = new Map();
  private cacheKeyPrefix: string = "";

  constructor() {
    // Get locale from localStorage or browser preference
    if (typeof window !== "undefined") {
      const savedLocale = localStorage.getItem("locale") as SupportedLocale;
      if (savedLocale && ["en", "es", "fr"].includes(savedLocale)) {
        this.locale = savedLocale;
      } else {
        // Use default from env if no saved preference
        this.locale = getDefaultLocale();
        // Detect from browser only if default is not set
        const browserLang = navigator.language.split("-")[0];
        if (
          this.locale === "en" &&
          (browserLang === "es" || browserLang === "fr")
        ) {
          this.locale = browserLang as SupportedLocale;
        }
      }
      this.updateCachePrefix();
    }
  }

  private updateCachePrefix(): void {
    this.cacheKeyPrefix = `${this.locale}_${this.fallbackLocale}_`;
    // Clear cache when locale changes
    this.translationCache.clear();
  }

  setLocale(locale: SupportedLocale): void {
    if (this.locale === locale) return; // Prevent unnecessary updates
    this.locale = locale;
    this.updateCachePrefix();
    if (typeof window !== "undefined") {
      // Use requestAnimationFrame to avoid forced reflow
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
          localStorage.setItem("locale", locale);
        });
      } else {
        localStorage.setItem("locale", locale);
      }
    }
  }

  getLocale(): SupportedLocale {
    return this.locale;
  }

  /**
   * Translate a key to the current locale (with caching for performance)
   * @param key Translation key (e.g., "auth.login" or "campaigns.title")
   * @param params Optional parameters to replace in translation (e.g., {count: 5})
   * @returns Translated string
   */
  t(key: TranslationKey, params?: TranslationParams): string {
    // Create cache key
    const cacheKey = params
      ? `${this.cacheKeyPrefix}${key}_${JSON.stringify(params)}`
      : `${this.cacheKeyPrefix}${key}`;

    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    const keys = key.split(".");
    let value: any = translations[this.locale];

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to configured fallback locale if key not found
        value = translations[this.fallbackLocale];
        for (const dk of keys) {
          if (value && typeof value === "object" && dk in value) {
            value = value[dk];
          } else {
            const result = key; // Return key if translation not found
            // Cache the result
            if (!params) {
              this.translationCache.set(cacheKey, result);
            }
            return result;
          }
        }
        break;
      }
    }

    if (typeof value !== "string") {
      const result = key;
      // Cache the result
      if (!params) {
        this.translationCache.set(cacheKey, result);
      }
      return result;
    }

    // Replace parameters in translation
    let result = value;
    if (params) {
      result = value.replace(
        /\{(\w+)\}/g,
        (match: string, paramKey: string) => {
          return params[paramKey] !== undefined
            ? String(params[paramKey])
            : match;
        }
      );
    } else {
      // Cache non-parameterized translations
      this.translationCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get Accept-Language header value for API requests
   */
  getAcceptLanguageHeader(): string {
    const localeMap: Record<SupportedLocale, string> = {
      en: "en-US,en;q=0.9",
      es: "es-ES,es;q=0.9,en;q=0.8",
      fr: "fr-FR,fr;q=0.9,en;q=0.8",
    };
    return localeMap[this.locale] || localeMap.en;
  }
}

// Create singleton instance
let i18nInstance: I18nService | null = null;

export function getI18n(): I18nService {
  if (!i18nInstance) {
    i18nInstance = new I18nService();
  }
  return i18nInstance;
}

// Export convenience function
export function t(key: TranslationKey, params?: TranslationParams): string {
  return getI18n().t(key, params);
}

// Export default for backward compatibility
export default getI18n();
