"use client";

import { useState, useEffect } from "react";

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isEnded: boolean;
  label: string;
}

function compute(endDate: string | Date): CountdownResult {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const totalMs = Math.max(0, end - now);
  const isEnded = totalMs <= 0;

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  let label: string;
  if (isEnded) label = "Ended";
  else if (days > 0) label = `${days} day${days !== 1 ? "s" : ""} to go`;
  else if (hours > 0)
    label = `${hours}h ${minutes}m left`;
  else label = `${minutes}m ${seconds}s left`;

  return { days, hours, minutes, seconds, totalMs, isEnded, label };
}

export function useCountdown(endDate: string | Date) {
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    compute(endDate)
  );

  useEffect(() => {
    setCountdown(compute(endDate));
    const id = setInterval(() => setCountdown(compute(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return countdown;
}
