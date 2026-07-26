/**
 * Platform success fee helpers (default 5% = 500 bps).
 * On-chain value on each Campaign is authoritative after factory deploy.
 */
export const DEFAULT_PLATFORM_FEE_BPS = 500;

export function getConfiguredFeeBps(): number {
  const raw = process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS;
  const parsed = raw != null && raw !== "" ? Number(raw) : DEFAULT_PLATFORM_FEE_BPS;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
    return DEFAULT_PLATFORM_FEE_BPS;
  }
  return Math.floor(parsed);
}

export function getConfiguredTreasuryAddress(): string | null {
  const addr = process.env.NEXT_PUBLIC_PLATFORM_TREASURY_ADDRESS?.trim();
  if (!addr || addr === "0x..." || addr.length < 42) return null;
  return addr;
}

export function calcPlatformFee(
  amountEth: number,
  bps: number = getConfiguredFeeBps()
): {
  gross: number;
  fee: number;
  net: number;
  bps: number;
  percent: number;
} {
  const safe = Number.isFinite(amountEth) && amountEth > 0 ? amountEth : 0;
  const fee = (safe * bps) / 10000;
  return {
    gross: safe,
    fee,
    net: Math.max(0, safe - fee),
    bps,
    percent: bps / 100,
  };
}

export function formatFeePercent(bps: number): string {
  const pct = bps / 100;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2)}%`;
}
