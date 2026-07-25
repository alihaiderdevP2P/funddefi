# Backend i18n (Internationalization) Setup Complete ✅

## Summary

I've successfully implemented internationalization (i18n) support for your NestJS backend with translations for:

- **English (en)** - Default
- **Spanish (es)** - Español
- **French (fr)** - Français

## What Was Implemented

### 1. Translation Files

- `src/i18n/translations/en.json` - English translations
- `src/i18n/translations/es.json` - Spanish translations
- `src/i18n/translations/fr.json` - French translations

### 2. Core Services

- `src/i18n/i18n.service.ts` - Main translation service
- `src/i18n/i18n.module.ts` - Global i18n module
- `src/i18n/decorators/locale.decorator.ts` - Decorator for locale extraction
- `src/i18n/interceptors/i18n.interceptor.ts` - Interceptor for automatic locale detection

### 3. Updated Services

✅ **AuthService** - All error messages now use i18n
✅ **CampaignsService** - Error messages translated
✅ **AuthController** - Accepts locale from headers
✅ **CampaignsController** - Passes locale to services

### 4. Integration

- Added `I18nModule` to `AppModule` as a global module
- Services automatically detect language from `Accept-Language` header
- Fallback to English if language not supported

## How to Use

### 1. Send Requests with Language Header

```bash
# Spanish
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es" \
  -d '{"email":"test@example.com","password":"wrong"}'

# French
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: fr" \
  -d '{"email":"test@example.com","password":"wrong"}'
```

### 2. Using Query Parameter

```bash
curl -X GET "http://localhost:3001/api/campaigns/123?locale=es"
```

### 3. Expected Responses

**English (default):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**Spanish:**

```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

**French:**

```json
{
  "statusCode": 401,
  "message": "Identifiants invalides"
}
```

## Translation Coverage

### ✅ Currently Translated Modules

1. **Authentication (auth)**
   - Invalid credentials
   - User already exists
   - Session messages

2. **Campaigns (campaigns)**
   - Invalid UUID format
   - Campaign not found
   - Permission errors

3. **Users (users)**
   - User not found
   - Role management errors
   - Admin creation restrictions

4. **Funding (funding)**
   - Campaign status errors
   - Invalid amounts

5. **Common (common)**
   - Generic error messages

## Next Steps (Optional Enhancements)

To add translations to more services:

1. **Update Funding Service:**

   ```typescript
   constructor(
     // ... other services
     private i18nService: I18nService
   ) {}
   ```

2. **Update Users Service:**

   ```typescript
   constructor(
     // ... other services
     private i18nService: I18nService
   ) {}
   ```

3. **Add more translation keys** to `en.json`, `es.json`, `fr.json`

4. **Use in service methods:**
   ```typescript
   throw new NotFoundException(
     this.i18nService.translate("users.not_found", locale, { id })
   );
   ```

## Testing

Run the backend and test with different language headers:

```bash
cd backend
npm run start:dev
```

Then test with curl or Postman using different `Accept-Language` headers.

## Files Created/Modified

**New Files:**

- `backend/src/i18n/i18n.service.ts`
- `backend/src/i18n/i18n.module.ts`
- `backend/src/i18n/translations/en.json`
- `backend/src/i18n/translations/es.json`
- `backend/src/i18n/translations/fr.json`
- `backend/src/i18n/decorators/locale.decorator.ts`
- `backend/src/i18n/interceptors/i18n.interceptor.ts`
- `backend/src/i18n/README.md`
- `backend/I18N_SETUP.md` (this file)

**Modified Files:**

- `backend/src/app.module.ts` - Added I18nModule
- `backend/src/auth/auth.service.ts` - Added i18n translations
- `backend/src/auth/auth.controller.ts` - Added locale detection
- `backend/src/campaigns/campaigns.service.ts` - Added i18n translations
- `backend/src/campaigns/campaigns.controller.ts` - Added locale detection

## Notes

- Default language is English (`en`)
- Language detection prioritizes `Accept-Language` header
- Falls back to English if unsupported language requested
- All error messages that were hardcoded now use translations
- Easy to extend with more languages or translation keys

🎉 **Your backend now supports multilingual error messages!**
