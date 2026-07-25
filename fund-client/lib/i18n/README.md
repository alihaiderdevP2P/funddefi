# Frontend i18n (Internationalization) Documentation

## Overview

The frontend now supports internationalization (i18n) with translations for English (en), Spanish (es), and French (fr). The frontend automatically sends the user's language preference to the backend API, ensuring consistent multilingual support across both frontend and backend.

## Architecture

- **Translation Files**: JSON files in `lib/i18n/translations/` (en.json, es.json, fr.json)
- **I18n Service**: Core translation service (`lib/i18n/i18n.ts`)
- **React Hook**: `useI18n()` hook for React components (`hooks/use-i18n.ts`)
- **Language Switcher**: Component to change language (`components/language-switcher.tsx`)
- **API Integration**: Automatically sends `Accept-Language` header to backend

## Usage in Components

### Basic Usage

```tsx
"use client";

import { useI18n } from "@/hooks/use-i18n";

export function MyComponent() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button>{t("auth.login")}</button>
    </div>
  );
}
```

### With Parameters

```tsx
const { t } = useI18n();

// If translation has parameters like "You have {count} campaigns"
const message = t("campaigns.count", { count: 5 });
// Returns: "You have 5 campaigns" (in current language)
```

### Change Language

```tsx
const { locale, setLocale } = useI18n();

// Change to Spanish
setLocale("es");

// Change to French
setLocale("fr");

// Change to English
setLocale("en");
```

### Using Language Switcher Component

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
  return (
    <header>
      {/* Other header content */}
      <LanguageSwitcher />
    </header>
  );
}
```

## Translation Keys

Translations are organized by namespace:

### Common (`common.*`)

- `welcome`, `loading`, `error`, `success`
- `save`, `cancel`, `delete`, `edit`
- `create`, `update`, `search`, `filter`

### Auth (`auth.*`)

- `login`, `logout`, `register`
- `email`, `password`, `name`
- `forgotPassword`, `rememberMe`

### Campaigns (`campaigns.*`)

- `title`, `create`, `myCampaigns`
- `goal`, `raised`, `backers`
- `fundCampaign`, `viewDetails`

### Dashboard (`dashboard.*`)

- `title`, `overview`, `analytics`
- `totalRaised`, `totalBacked`

### Wallet (`wallet.*`)

- `connect`, `disconnect`, `connected`
- `walletAddress`, `balance`, `network`

### Errors (`errors.*`)

- `invalidCredentials`, `userAlreadyExists`
- `networkError`, `unauthorized`, `forbidden`

### Messages (`messages.*`)

- `loginSuccess`, `logoutSuccess`
- `campaignCreated`, `fundingSuccess`

## Language Detection

The system detects language in this order:

1. **Saved Preference**: Checks `localStorage.getItem("locale")`
2. **Browser Language**: Detects from `navigator.language`
3. **Default**: Falls back to English ("en")

## Backend Integration

When the frontend makes API requests, it automatically includes the `Accept-Language` header based on the user's selected language:

```typescript
// Automatically set in lib/api.ts interceptor
Accept-Language: "es-ES,es;q=0.9,en;q=0.8" // For Spanish
```

The backend will return error messages and responses in the requested language.

## Adding New Translations

1. **Add key to all translation files**:

```json
// lib/i18n/translations/en.json
{
  "campaigns": {
    "newFeature": "New Feature"
  }
}

// lib/i18n/translations/es.json
{
  "campaigns": {
    "newFeature": "Nueva Función"
  }
}

// lib/i18n/translations/fr.json
{
  "campaigns": {
    "newFeature": "Nouvelle Fonctionnalité"
  }
}
```

2. **Use in component**:

```tsx
{
  t("campaigns.newFeature");
}
```

## Example: Full Component

```tsx
"use client";

import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export function ExampleComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>Current language: {locale}</p>

      <Button onClick={() => setLocale("es")}>
        {t("common.switchToSpanish")}
      </Button>

      <LanguageSwitcher />

      <button>{t("auth.login")}</button>
    </div>
  );
}
```

## Testing

Test different languages:

1. Add `LanguageSwitcher` to a page
2. Change language using the switcher
3. Verify UI text changes
4. Check browser Network tab - API requests should include `Accept-Language` header
5. Backend error messages should be in selected language

## Files Created

- `lib/i18n/i18n.ts` - Core i18n service
- `lib/i18n/translations/en.json` - English translations
- `lib/i18n/translations/es.json` - Spanish translations
- `lib/i18n/translations/fr.json` - French translations
- `hooks/use-i18n.ts` - React hook and provider
- `components/language-switcher.tsx` - Language switcher component
- `lib/i18n/README.md` - This documentation

## Integration with Backend

The frontend i18n system works seamlessly with the backend:

1. **User selects language** in frontend → Stored in `localStorage`
2. **API requests** automatically include `Accept-Language` header
3. **Backend responds** with translated error messages
4. **Frontend displays** translated UI elements

Both systems use the same language codes: `en`, `es`, `fr`

## Next Steps

1. Add `LanguageSwitcher` to your header/navigation
2. Replace hardcoded strings with `t()` calls
3. Add more translation keys as needed
4. Test with all three languages

🎉 **Your frontend now supports multilingual UI with automatic backend integration!**
