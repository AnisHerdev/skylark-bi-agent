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
      ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50"
      : trend === "down"
        ? "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50"
        : "text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/50";

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800/60">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </div>
      {subtext && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${trendColor}`}>
            <TrendIcon className="h-2.5 w-2.5" />
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
}
