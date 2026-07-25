/** Format ETH amounts for display (campaign detail, cards, etc.) */
export function formatEthAmount(
  amount: number,
  options?: { compact?: boolean; maxDecimals?: number }
): string {
  const n = Number(amount) || 0;
  const maxDecimals = options?.maxDecimals ?? 4;

  if (options?.compact) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  }

  if (n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  if (n < 1) return n.toFixed(maxDecimals).replace(/\.?0+$/, "");
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function formatEthLabel(amount: number, compact = false): string {
  return `${formatEthAmount(amount, { compact })} ETH`;
}

export function calcFundingProgress(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.max(0, (raised / goal) * 100));
}
