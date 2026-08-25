"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}

export function MetricCard({ label, value, subtext, trend }: MetricCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-800 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/70 dark:border-emerald-700"
      : trend === "down"
        ? "text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-950/70 dark:border-rose-700"
        : "text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="rounded-2xl border border-slate-300/80 bg-white p-4 shadow-2xs transition-all hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {value}
      </div>
      {subtext && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold border ${trendColor}`}>
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
}
