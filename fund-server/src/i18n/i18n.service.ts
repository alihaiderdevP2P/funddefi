import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

export type SupportedLocale = "en" | "es" | "fr";

interface Translations {
  [key: string]: string | Translations;
}

@Injectable()
export class I18nService {
  private translations: Map<SupportedLocale, Translations> = new Map();
  private defaultLocale: SupportedLocale;
  private fallbackLocale: SupportedLocale;

  constructor(private configService?: ConfigService) {
    // Get default locale from environment variable
    const envDefault =
      this.configService?.get<string>("LANG_DEFAULT") ||
      process.env.LANG_DEFAULT ||
      "en";
    this.defaultLocale = ["en", "es", "fr"].includes(envDefault)
      ? (envDefault as SupportedLocale)
      : "en";

    // Get fallback locale from environment variable
    const envFallback =
      this.configService?.get<string>("LANG_FALLBACK") ||
      process.env.LANG_FALLBACK ||
      "en";
    this.fallbackLocale = ["en", "es", "fr"].includes(envFallback)
      ? (envFallback as SupportedLocale)
      : "en";

    this.loadTranslations();
  }

  private loadTranslations(): void {
    const locales: SupportedLocale[] = ["en", "es", "fr"];
    const translationsPath = path.join(__dirname, "translations");

    for (const locale of locales) {
      try {
        const filePath = path.join(translationsPath, `${locale}.json`);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        this.translations.set(locale, JSON.parse(fileContent));
      } catch (error) {
        console.error(
          `Failed to load translations for locale ${locale}:`,
          error
        );
      }
    }
  }

  /**
   * Translate a key to the specified locale
   * @param key Translation key (e.g., "auth.invalid_credentials")
   * @param locale Target locale (default: "en")
   * @param params Parameters to replace in the translation (e.g., {id: "123"})
   * @returns Translated string
   */
  translate(
    key: string,
    locale: SupportedLocale = this.defaultLocale,
    params?: Record<string, string | number>
  ): string {
    const translations =
      this.translations.get(locale) ||
      this.translations.get(this.defaultLocale) ||
      {};

    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to configured fallback locale if key not found
        const fallbackTranslations =
          this.translations.get(this.fallbackLocale) || {};
        value = fallbackTranslations;
        for (const dk of keys) {
          if (value && typeof value === "object" && dk in value) {
            value = value[dk];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined
          ? String(params[paramKey])
          : match;
      });
    }

    return value;
  }

  /**
   * Get the locale from request headers
   * @param acceptLanguage Accept-Language header value
   * @returns Detected locale
   */
  getLocaleFromHeader(acceptLanguage?: string): SupportedLocale {
    if (!acceptLanguage) {
      return this.defaultLocale; // Use configured default locale
    }

    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase());

    // Check for exact matches first
    for (const lang of languages) {
      if (lang === "en" || lang === "es" || lang === "fr") {
        return lang as SupportedLocale;
      }
    }

    // Check for language codes (e.g., "es-ES", "fr-FR")
    for (const lang of languages) {
      if (lang.startsWith("es")) return "es";
      if (lang.startsWith("fr")) return "fr";
      if (lang.startsWith("en")) return "en";
    }

    return this.defaultLocale;
  }

  /**
   * Set default locale
   */
  setDefaultLocale(locale: SupportedLocale): void {
    this.defaultLocale = locale;
  }

  /**
   * Get default locale
   */
  getDefaultLocale(): SupportedLocale {
    return this.defaultLocale;
  }
}
