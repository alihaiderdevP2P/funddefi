# Frontend i18n Setup Complete ✅

## Summary

I've successfully implemented internationalization (i18n) support for the **Frontend** (Next.js) that integrates seamlessly with the **Backend** (NestJS) i18n system.

## What Was Created

### 1. Translation Files

- `lib/i18n/translations/en.json` - English translations
- `lib/i18n/translations/es.json` - Spanish translations
- `lib/i18n/translations/fr.json` - French translations

### 2. Core Services

- `lib/i18n/i18n.ts` - Translation service with locale detection
- `hooks/use-i18n.ts` - React hook and context provider
- `components/language-switcher.tsx` - Language switcher UI component

### 3. Integration

- ✅ Added `I18nProvider` to `app/layout.tsx`
- ✅ Updated `lib/api.ts` to automatically send `Accept-Language` header
- ✅ Language preference saved in `localStorage`

## How It Works

### Frontend → Backend Integration

1. **User selects language** in frontend (via `LanguageSwitcher`)
2. **Language saved** to `localStorage` as `"locale"`
3. **All API requests** automatically include `Accept-Language` header
4. **Backend responds** with translated error messages
5. **Frontend displays** translated UI using `useI18n()` hook

### Example Flow

```typescript
// 1. User changes language
const { setLocale } = useI18n();
setLocale("es"); // → Saved to localStorage

// 2. API request automatically includes header
// Headers: { "Accept-Language": "es-ES,es;q=0.9,en;q=0.8" }

// 3. Backend returns Spanish error
// Response: { "message": "Credenciales inválidas" }

// 4. Frontend shows Spanish UI
{
  t("auth.login");
} // → "Iniciar Sesión"
```

## Usage Examples

### In Components

```tsx
"use client";

import { useI18n } from "@/hooks/use-i18n";

export function LoginButton() {
  const { t } = useI18n();

  return <button>{t("auth.login")}</button>;
  // Shows: "Login" (en), "Iniciar Sesión" (es), "Connexion" (fr)
}
```

### Language Switcher

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

// Add to your header/navigation
<LanguageSwitcher />;
```

### Change Language Programmatically

```tsx
const { locale, setLocale } = useI18n();

// Switch to Spanish
setLocale("es");

// Switch to French
setLocale("fr");
```

## Available Translation Keys

### Common

- `common.welcome`, `common.loading`, `common.save`, etc.

### Auth

- `auth.login`, `auth.logout`, `auth.register`, `auth.email`, etc.

### Campaigns

- `campaigns.title`, `campaigns.create`, `campaigns.goal`, etc.

### Dashboard

- `dashboard.title`, `dashboard.overview`, `dashboard.analytics`, etc.

### Wallet

- `wallet.connect`, `wallet.disconnect`, `wallet.connected`, etc.

### Errors

- `errors.invalidCredentials`, `errors.networkError`, etc.

### Messages

- `messages.loginSuccess`, `messages.campaignCreated`, etc.

## Quick Start

1. **Add Language Switcher to Header**:

   ```tsx
   import { LanguageSwitcher } from "@/components/language-switcher";

   <LanguageSwitcher />;
   ```

2. **Use translations in components**:

   ```tsx
   const { t } = useI18n();
   <h1>{t("common.welcome")}</h1>;
   ```

3. **Test**: Change language and verify:
   - UI text changes
   - API requests include `Accept-Language` header
   - Backend error messages are translated

## Files Modified

- `app/layout.tsx` - Added `I18nProvider`
- `lib/api.ts` - Added automatic `Accept-Language` header

## Files Created

- `lib/i18n/i18n.ts`
- `lib/i18n/translations/en.json`
- `lib/i18n/translations/es.json`
- `lib/i18n/translations/fr.json`
- `hooks/use-i18n.ts`
- `components/language-switcher.tsx`
- `lib/i18n/README.md`
- `I18N_FRONTEND_SETUP.md` (this file)

## Backend ↔ Frontend Synchronization

Both systems are now synchronized:

| Feature        | Frontend      | Backend          |
| -------------- | ------------- | ---------------- |
| Languages      | en, es, fr    | en, es, fr       |
| Storage        | localStorage  | Session/Header   |
| API Header     | ✅ Auto-added | ✅ Auto-detected |
| Error Messages | ✅ Translated | ✅ Translated    |
| UI Elements    | ✅ Translated | N/A              |

## Testing

1. Open browser DevTools → Network tab
2. Change language using `LanguageSwitcher`
3. Make an API request (e.g., login with wrong password)
4. Check request headers: Should see `Accept-Language: es-ES,...` (for Spanish)
5. Check response: Error message should be in selected language
6. Verify UI elements change language immediately

## Next Steps

1. **Add Language Switcher** to your main navigation/header
2. **Replace hardcoded strings** with `t()` calls throughout the app
3. **Add more translation keys** as you build features
4. **Test thoroughly** with all three languages

🎉 **Your frontend and backend are now fully integrated with i18n support!**
