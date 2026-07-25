# Prettier Formatter Setup ✅

## Overview

Prettier has been configured for both **Frontend** (Next.js) and **Backend** (NestJS) to ensure consistent code formatting across the entire project.

## Configuration Files

### Root Level (Frontend)

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore during formatting

### Backend

- `backend/.prettierrc` - Prettier configuration for backend
- `backend/.prettierignore` - Backend-specific ignore patterns

## Configuration

Both frontend and backend use the same formatting rules:

```json
{
  "semi": true, // Use semicolons
  "trailingComma": "es5", // ES5-compatible trailing commas
  "singleQuote": false, // Use double quotes
  "printWidth": 80, // Line length limit
  "tabWidth": 2, // 2 spaces for indentation
  "useTabs": false, // Use spaces instead of tabs
  "arrowParens": "always", // Always use parentheses for arrow functions
  "endOfLine": "lf", // Unix-style line endings
  "bracketSpacing": true // Add spaces in object literals
}
```

## Usage

### Frontend (Next.js)

**Format all files:**

```bash
npm run format
```

**Check formatting (no changes):**

```bash
npm run format:check
```

**Format specific directories:**

```bash
npm run format:app
```

**Format everything (frontend + backend):**

```bash
npm run format:all
```

### Backend (NestJS)

**Format all TypeScript files:**

```bash
cd backend
npm run format
```

**Check formatting (no changes):**

```bash
cd backend
npm run format:check
```

## VS Code Integration

To automatically format on save, add this to your `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## What Gets Formatted

### Included

- `.ts`, `.tsx` - TypeScript files
- `.js`, `.jsx` - JavaScript files
- `.json` - JSON files
- `.css`, `.scss` - Stylesheets
- `.md` - Markdown files

### Ignored

- `node_modules/`
- `.next/`, `dist/`, `build/` - Build outputs
- `coverage/` - Test coverage
- `.env*` - Environment files
- `*.min.js`, `*.min.css` - Minified files
- Lock files (`package-lock.json`, `yarn.lock`, etc.)

## Pre-commit Hook (Optional)

To automatically format before commits, install `husky` and `lint-staged`:

```bash
npm install --save-dev husky lint-staged

# Add to package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md}": [
      "prettier --write"
    ]
  }
}
```

## Scripts Available

### Frontend

- `npm run format` - Format all files in project
- `npm run format:check` - Check if files are formatted
- `npm run format:app` - Format app, components, and lib directories
- `npm run format:all` - Format both frontend and backend

### Backend

- `npm run format` - Format all TypeScript files
- `npm run format:check` - Check if files are formatted

## Tips

1. **Run before committing:**

   ```bash
   npm run format:all
   ```

2. **Check CI/CD:**
   Add `npm run format:check` to your CI pipeline to ensure code is formatted.

3. **IDE Integration:**
   Most modern IDEs (VS Code, WebStorm) support Prettier with auto-format on save.

4. **Format specific files:**
   ```bash
   npx prettier --write path/to/file.ts
   ```

## Troubleshooting

**Prettier not formatting:**

- Ensure Prettier extension is installed in VS Code
- Check that `.prettierrc` file exists in the project root
- Restart your IDE after configuration changes

**Conflicts with ESLint:**

- Backend already has `eslint-config-prettier` installed to disable conflicting ESLint rules
- Frontend should also use `eslint-config-prettier` if ESLint is configured

## Next Steps

1. Format existing code:

   ```bash
   npm run format:all
   ```

2. Configure your IDE to format on save

3. Consider adding a pre-commit hook for automatic formatting

🎉 **Your codebase is now ready for consistent formatting!**
