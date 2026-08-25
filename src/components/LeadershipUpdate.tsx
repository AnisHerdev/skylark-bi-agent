"use client";

import { FileText, Sparkles } from "lucide-react";

export function LeadershipUpdate({ content }: { content: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-xs dark:border-emerald-900/50 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Executive Leadership Briefing
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" />
          AI Synthesized
        </span>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {content}
      </div>
    </div>
  );
}
