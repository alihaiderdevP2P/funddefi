export async function shareCampaign(options: {
  title: string;
  summary?: string;
  url?: string;
}): Promise<"shared" | "copied" | "cancelled"> {
  const url =
    options.url ||
    (typeof window !== "undefined" ? window.location.href : "");

  const shareData = {
    title: options.title,
    text: options.summary || `Support "${options.title}" on FundFlow`,
    url,
  };

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "cancelled";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }

  return "cancelled";
}
