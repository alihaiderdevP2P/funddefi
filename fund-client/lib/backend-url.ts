const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/;

/** Backend API base URL from env (e.g. https://api.example.com/api). */
export function getBackendApiUrl(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001/api"
  ).replace(/\/$/, "");
}

export function isLocalBackend(url: string): boolean {
  return LOCALHOST_PATTERN.test(url);
}

/**
 * Backend URL safe for server-side fetch in the current environment.
 * Returns null when only localhost is configured but the process runs on Vercel
 * (build or production), where localhost is unreachable.
 */
export function getReachableBackendApiUrl(): string | null {
  const url = getBackendApiUrl();

  if (!isLocalBackend(url)) {
    return url;
  }

  if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
    return url;
  }

  return null;
}
