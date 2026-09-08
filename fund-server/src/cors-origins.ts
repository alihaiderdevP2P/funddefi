const DEFAULT_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080",
  "https://funddefi-client-six.vercel.app",
].join(",");

const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function configuredOrigins(): string[] {
  return (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS)
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isAllowedCorsOrigin(origin?: string): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  if (configuredOrigins().includes(normalized)) return true;
  return (
    process.env.NODE_ENV !== "production" && LOCAL_DEV_ORIGIN.test(normalized)
  );
}

export function corsOriginDelegate(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  callback(null, isAllowedCorsOrigin(origin));
}
