"use client";

export function LeadershipUpdate({ content }: { content: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
          Leadership Update
        </h3>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {content}
      </div>
    </div>
  );
}
