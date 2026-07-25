# Complete i18n Setup - Frontend & Backend ✅

## Overview

Your project now has **full internationalization (i18n) support** for both **Frontend (Next.js)** and **Backend (NestJS)** with translations for:

- **English (en)** - Default
- **Spanish (es)** - Español
- **French (fr)** - Français

## Architecture

### Frontend i18n

- **Location**: `lib/i18n/`
- **Hook**: `useI18n()` from `hooks/use-i18n.tsx`
- **Provider**: `I18nProvider` (already added to `app/layout.tsx`)
- **Component**: `LanguageSwitcher` for changing languages

### Backend i18n

- **Location**: `backend/src/i18n/`
- **Service**: `I18nService` (injected in services)
- **Module**: `I18nModule` (global, already added to `app.module.ts`)

## How They Work Together

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│                 │
│  User selects   │
│  language: "es"  │
│  ↓              │
│  Saved to       │
│  localStorage   │
│  ↓              │
│  API Request    │
│  with header:   │
│  Accept-Language│
│  "es-ES,..."    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend       │
│  (NestJS)       │
│                 │
│  Detects        │
│  Accept-Language│
│  header         │
│  ↓              │
│  Returns        │
│  Spanish error  │
│  messages       │
└─────────────────┘
```

## Usage Examples

### Frontend (React Components)

```tsx
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button>{t("auth.login")}</button>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Change programmatically */}
      <button onClick={() => setLocale("es")}>Switch to Spanish</button>
    </div>
  );
}
```

### Backend (NestJS Services)

```typescript
import { I18nService } from "../i18n/i18n.service";

@Injectable()
export class YourService {
  constructor(private readonly i18nService: I18nService) {}

  async someMethod(locale: string = "en") {
    throw new UnauthorizedException(
      this.i18nService.translate("auth.invalid_credentials", locale)
    );
  }
}
```

### Backend (Controllers)

```typescript
import { I18nService } from "../i18n/i18n.service";
import { Headers } from "@nestjs/common";

@Controller("example")
export class YourController {
  constructor(
    private readonly yourService: YourService,
    private readonly i18nService: I18nService
  ) {}

  @Post("action")
  async action(
    @Body() dto: YourDto,
    @Headers("accept-language") acceptLanguage?: string
  ) {
    const locale = this.i18nService.getLocaleFromHeader(acceptLanguage);
    return this.yourService.action(dto, locale);
  }
}
```

## Translation Keys

### Frontend Translations (`lib/i18n/translations/`)

- `common.*` - Common UI elements
- `auth.*` - Authentication
- `campaigns.*` - Campaigns
- `dashboard.*` - Dashboard
- `wallet.*` - Wallet
- `errors.*` - Error messages
- `messages.*` - Success messages

### Backend Translations (`backend/src/i18n/translations/`)

- `auth.*` - Authentication errors
- `users.*` - User management
- `campaigns.*` - Campaign errors
- `funding.*` - Funding errors
- `common.*` - Common errors

## Automatic API Integration

The frontend **automatically** sends the language preference to the backend:

```typescript
// lib/api.ts automatically adds:
headers: {
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8" // Based on user's selection
}
```

The backend **automatically** detects and uses this language for error messages.

## Quick Start

### 1. Add Language Switcher to Your Header

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

// In your header/navigation component
<LanguageSwitcher />;
```

### 2. Use Translations in Components

```tsx
const { t } = useI18n();
<h1>{t("common.welcome")}</h1>
<button>{t("auth.login")}</button>
```

### 3. Test It

1. Add `LanguageSwitcher` to a page
2. Change language
3. Make an API request (e.g., wrong login)
4. Check Network tab: Should see `Accept-Language` header
5. Backend error should be in selected language

## Files Created

### Frontend

- `lib/i18n/i18n.ts` - Core i18n service
- `lib/i18n/translations/en.json` - English
- `lib/i18n/translations/es.json` - Spanish
- `lib/i18n/translations/fr.json` - French
- `hooks/use-i18n.tsx` - React hook & provider
- `components/language-switcher.tsx` - Language switcher UI
- `lib/i18n/README.md` - Frontend documentation

### Backend

- `backend/src/i18n/i18n.service.ts` - I18n service
- `backend/src/i18n/i18n.module.ts` - I18n module
- `backend/src/i18n/translations/en.json` - English
- `backend/src/i18n/translations/es.json` - Spanish
- `backend/src/i18n/translations/fr.json` - French
- `backend/src/i18n/decorators/locale.decorator.ts` - Locale decorator
- `backend/src/i18n/interceptors/i18n.interceptor.ts` - I18n interceptor
- `backend/src/i18n/README.md` - Backend documentation

## Files Modified

### Frontend

- `app/layout.tsx` - Added `I18nProvider`
- `lib/api.ts` - Added automatic `Accept-Language` header

### Backend

- `backend/src/app.module.ts` - Added `I18nModule`
- `backend/src/auth/auth.service.ts` - Added i18n translations
- `backend/src/auth/auth.controller.ts` - Added locale detection
- `backend/src/campaigns/campaigns.service.ts` - Added i18n translations
- `backend/src/campaigns/campaigns.controller.ts` - Added locale detection

## Language Detection Flow

### Frontend

1. Check `localStorage.getItem("locale")`
2. If not found, detect from `navigator.language`
3. Default to "en"

### Backend

1. Check `Accept-Language` header from request
2. Parse header (e.g., "es-ES,es;q=0.9")
3. Match to supported locale (en, es, fr)
4. Default to "en" if not supported

## Testing

### Test Frontend

```bash
# Start frontend
npm run dev

# Open browser, change language using LanguageSwitcher
# Verify UI text changes
```

### Test Backend

```bash
cd backend
npm run start:dev

# Test with curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Accept-Language: es" \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"wrong"}'

# Should return: {"statusCode": 401, "message": "Credenciales inválidas"}
```

## Next Steps

1. ✅ **Add LanguageSwitcher** to your main navigation
2. ✅ **Replace hardcoded strings** with `t()` calls
3. ✅ **Add more translation keys** as needed
4. ✅ **Test thoroughly** with all three languages

## Documentation

- **Frontend**: `lib/i18n/README.md`
- **Backend**: `backend/src/i18n/README.md`
- **Complete Setup**: This file

🎉 **Your entire application (frontend + backend) now supports multilingual functionality!**
