# Internationalization (i18n) Documentation

## Overview

This backend now supports internationalization for English (en), Spanish (es), and French (fr) languages. Error messages and API responses can be returned in the user's preferred language.

## How It Works

### 1. Language Detection

The system automatically detects the user's preferred language from:

- `Accept-Language` HTTP header (e.g., `Accept-Language: es-ES,es;q=0.9`)
- `locale` query parameter (e.g., `?locale=es`)
- `locale` body parameter in POST requests

If no language is specified, it defaults to English (`en`).

### 2. Usage in Services

```typescript
import { I18nService } from "../i18n/i18n.service";

@Injectable()
export class YourService {
  constructor(private readonly i18nService: I18nService) {}

  someMethod(locale: string = "en") {
    const message = this.i18nService.translate(
      "auth.invalid_credentials",
      locale
    );
    throw new UnauthorizedException(message);
  }
}
```

### 3. Usage in Controllers

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

### 4. Translation Keys

Translations are organized by module:

- `auth.*` - Authentication messages
- `users.*` - User management messages
- `campaigns.*` - Campaign-related messages
- `funding.*` - Funding-related messages
- `common.*` - Common error messages

### 5. Parameters in Translations

You can use parameters in translations:

```json
{
  "users": {
    "not_found": "User with ID {id} not found"
  }
}
```

Usage:

```typescript
this.i18nService.translate("users.not_found", locale, { id: userId });
// Returns: "User with ID abc123 not found" (in the specified language)
```

## Supported Languages

- **English (en)** - Default
- **Spanish (es)** - Español
- **French (fr)** - Français

## API Examples

### Request with Accept-Language header

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es-ES" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Request with locale query parameter

```bash
curl -X POST http://localhost:3001/api/auth/login?locale=fr \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Translation Files

Translation files are located in:

- `src/i18n/translations/en.json` - English
- `src/i18n/translations/es.json` - Spanish
- `src/i18n/translations/fr.json` - French

## Adding New Translations

1. Add the key-value pair to all three translation files
2. Use the translation key in your service/controller code
3. Ensure proper parameter substitution if needed

Example:

```json
// en.json
{
  "campaigns": {
    "new_key": "Campaign created successfully"
  }
}

// es.json
{
  "campaigns": {
    "new_key": "Campaña creada exitosamente"
  }
}

// fr.json
{
  "campaigns": {
    "new_key": "Campagne créée avec succès"
  }
}
```

## Testing

Test different languages using:

```bash
# English (default)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

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

Expected responses:

- English: `{"statusCode": 401, "message": "Invalid credentials"}`
- Spanish: `{"statusCode": 401, "message": "Credenciales inválidas"}`
- French: `{"statusCode": 401, "message": "Identifiants invalides"}`
