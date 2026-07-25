# i18n Quick Start Guide

## ✅ Setup Complete!

Both **Frontend** and **Backend** now support i18n (English, Spanish, French).

## Quick Test

### 1. Restart Dev Server (Clean)

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Add Language Switcher to Header

Open any page with a header (e.g., `app/page.tsx`) and add:

```tsx
import { LanguageSwitcher } from "@/components/language-switcher";

// In your header/navigation:
<LanguageSwitcher />;
```

### 3. Use Translations

```tsx
import { useI18n } from "@/hooks/use-i18n";

function MyComponent() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <button>{t("auth.login")}</button>
    </div>
  );
}
```

## What's Working

✅ **Frontend**: Translations for UI elements  
✅ **Backend**: Translations for error messages  
✅ **Auto-Sync**: Frontend sends language to backend automatically  
✅ **Language Detection**: Browser language detection  
✅ **Persistence**: Language saved in localStorage

## Files Structure

```
lib/i18n/
  ├── i18n.ts                    # Core service
  ├── translations/
  │   ├── en.json               # English
  │   ├── es.json               # Spanish
  │   └── fr.json               # French
  └── README.md

hooks/
  └── use-i18n.tsx              # React hook

components/
  └── language-switcher.tsx     # Language switcher UI

backend/src/i18n/
  ├── i18n.service.ts           # Backend service
  ├── i18n.module.ts            # Backend module
  └── translations/
      ├── en.json
      ├── es.json
      └── fr.json
```

## Common Issues

### Issue: 404 errors on static files

**Solution**: Clear Next.js cache and restart:

```bash
rm -rf .next
npm run dev
```

### Issue: Translations not working

**Check**:

1. Is `I18nProvider` in `app/layout.tsx`? ✅ Yes
2. Are translation files in `lib/i18n/translations/`? ✅ Yes
3. Are you using `useI18n()` hook? ✅ Yes

### Issue: Backend not returning translated errors

**Check**:

1. Is `Accept-Language` header in Network tab? ✅ Should be auto-added
2. Is backend `I18nModule` imported? ✅ Yes
3. Are services using `i18nService.translate()`? ✅ Yes

## Next Steps

1. **Add Language Switcher** to your main navigation
2. **Replace hardcoded strings** with `t()` calls
3. **Test** with all three languages
4. **Add more translation keys** as needed

🎉 **Everything is set up and ready to use!**
