import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SupportedLocale } from "../i18n.service";

export const Locale = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SupportedLocale => {
    const request = ctx.switchToHttp().getRequest();

    // First, check if locale was set by I18nInterceptor (most common case)
    if (request.locale && ["en", "es", "fr"].includes(request.locale)) {
      return request.locale as SupportedLocale;
    }

    // Check for explicit locale in query or body (override)
    const queryLocale = request.query?.locale;
    const bodyLocale = request.body?.locale;

    if (queryLocale || bodyLocale) {
      const locale = (queryLocale || bodyLocale) as SupportedLocale;
      if (["en", "es", "fr"].includes(locale)) {
        return locale;
      }
    }

    // Fallback to default
    return "en";
  }
);
