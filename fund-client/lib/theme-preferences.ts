export const APP_PREFERENCES_KEY = "app_preferences";

export type ThemePreference = "light" | "dark" | "system";

export function saveThemePreference(theme: ThemePreference) {
  if (typeof window === "undefined") return;

  try {
    const saved = localStorage.getItem(APP_PREFERENCES_KEY);
    const prefs = saved ? JSON.parse(saved) : {};
    prefs.theme = theme;
    localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // ignore invalid stored preferences
  }
}

export function loadThemePreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(APP_PREFERENCES_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    if (parsed.theme === "light" || parsed.theme === "dark" || parsed.theme === "system") {
      return parsed.theme;
    }
  } catch {
    // ignore invalid stored preferences
  }

  return null;
}
