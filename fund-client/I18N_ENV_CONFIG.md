# i18n Environment Configuration ✅

## Overview

The i18n system now supports environment variable configuration for default and fallback languages in both **Frontend** and **Backend**.

## Configuration

### Frontend Configuration (Next.js)

Add these variables to your `.env` or `.env.local` file:

```env
# Default language when user first visits (en, es, fr)
NEXT_PUBLIC_LANG_DEFAULT=es

# Fallback language when translation key is not found (en, es, fr)
NEXT_PUBLIC_LANG_FALLBACK=en
```

### Backend Configuration (NestJS)

Add these variables to your `backend/.env` file:

```env
# Default language for backend responses (en, es, fr)
LANG_DEFAULT=es

# Fallback language when translation key is not found (en, es, fr)
LANG_FALLBACK=en
```

## How It Works

### Frontend Flow

1. **On First Visit**:
   - Checks `localStorage` for saved preference
   - If not found, uses `NEXT_PUBLIC_LANG_DEFAULT` (defaults to "en")
   - Falls back to browser language detection if default is "en"

2. **Translation Fallback**:
   - If translation key not found in current locale
   - Falls back to `NEXT_PUBLIC_LANG_FALLBACK` locale
   - If still not found, returns the translation key

### Backend Flow

1. **Default Response Language**:
   - If no `Accept-Language` header is provided
   - Uses `LANG_DEFAULT` (defaults to "en")

2. **Translation Fallback**:
   - If translation key not found in requested locale
   - Falls back to `LANG_FALLBACK` locale
   - If still not found, returns the translation key

## Example Configuration

### Set Spanish as Default

**Frontend `.env`:**

```env
NEXT_PUBLIC_LANG_DEFAULT=es
NEXT_PUBLIC_LANG_FALLBACK=en
```

**Backend `.env`:**

```env
LANG_DEFAULT=es
LANG_FALLBACK=en
```

**Result:**

- ✅ New users see Spanish interface by default
- ✅ Missing translations fall back to English
- ✅ Users can still switch languages manually

### Set French as Default

**Frontend `.env`:**

```env
NEXT_PUBLIC_LANG_DEFAULT=fr
NEXT_PUBLIC_LANG_FALLBACK=en
```

**Backend `.env`:**

```env
LANG_DEFAULT=fr
LANG_FALLBACK=en
```

**Result:**

- ✅ New users see French interface by default
- ✅ Missing translations fall back to English
- ✅ API responses default to French when no header is sent

## Supported Languages

- 🇺🇸 **en** - English
- 🇪🇸 **es** - Spanish (Español)
- 🇫🇷 **fr** - French (Français)

## Priority Order

### Frontend

1. User's saved preference (`localStorage`)
2. `NEXT_PUBLIC_LANG_DEFAULT` env variable
3. Browser language detection (if default is "en")
4. Fallback to "en"

### Backend

1. `Accept-Language` header from request
2. `LANG_DEFAULT` env variable
3. Fallback to "en"

## Testing

### Test Default Language

1. **Clear localStorage**:

   ```javascript
   localStorage.removeItem("locale");
   ```

2. **Set environment variable**:

   ```env
   NEXT_PUBLIC_LANG_DEFAULT=es
   ```

3. **Refresh page**:
   - Should show Spanish interface
   - Language switcher should show 🇪🇸 ES as selected

### Test Fallback Language

1. **Add missing translation** (temporarily):
   - Remove a key from `lib/i18n/translations/es.json`

2. **Set fallback**:

   ```env
   NEXT_PUBLIC_LANG_FALLBACK=en
   ```

3. **Switch to Spanish**:
   - Missing translations should show English text
   - Not the translation key

## Files Modified

### Frontend

- ✅ `lib/i18n/i18n.ts` - Reads `NEXT_PUBLIC_LANG_DEFAULT` and `NEXT_PUBLIC_LANG_FALLBACK`
- ✅ `hooks/use-i18n.tsx` - Uses default from env on initialization

### Backend

- ✅ `backend/src/i18n/i18n.service.ts` - Reads `LANG_DEFAULT` and `LANG_FALLBACK`
- ✅ Uses ConfigService and falls back to `process.env`

## Environment Variables Reference

| Variable        | Frontend                    | Backend         | Default | Description                       |
| --------------- | --------------------------- | --------------- | ------- | --------------------------------- |
| `LANG_DEFAULT`  | `NEXT_PUBLIC_LANG_DEFAULT`  | `LANG_DEFAULT`  | `en`    | Default language for new users    |
| `LANG_FALLBACK` | `NEXT_PUBLIC_LANG_FALLBACK` | `LANG_FALLBACK` | `en`    | Fallback when translation missing |

## Notes

- ⚠️ **Frontend variables** must have `NEXT_PUBLIC_` prefix to be accessible in browser
- ⚠️ **Restart required** after changing environment variables
- ✅ **User preferences** (localStorage) override default language
- ✅ **API headers** (Accept-Language) override backend default

## Quick Start

1. **Create `.env` files** with your preferred defaults
2. **Restart servers** (frontend and backend)
3. **Clear browser cache** or test in incognito
4. **Verify** default language is applied

🎉 **Your i18n system is now fully configurable via environment variables!**
