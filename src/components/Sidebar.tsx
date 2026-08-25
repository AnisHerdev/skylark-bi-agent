"use client";

import {
  TrendingUp,
  Activity,
  AlertOctagon,
  FileSpreadsheet,
  PlusCircle,
  BarChart2,
  LayoutDashboard,
  MessageSquareText,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  activeView: "dashboard" | "chat";
  onViewChange: (view: "dashboard" | "chat") => void;
  onSelectPrompt: (prompt: string) => void;
  onNewAnalysis: () => void;
}

const PROMPT_CATEGORIES = [
  {
    title: "Pipeline & Sales",
    icon: TrendingUp,
    color: "text-emerald-500 dark:text-emerald-400",
    queries: [
      "How is our pipeline looking this quarter?",
      "Which sector has the highest deal value?",
      "Compare Energy vs Manufacturing pipeline.",
      "What is our overall deal win rate?",
    ],
  },
  {
    title: "Operations & Work Orders",
    icon: Activity,
    color: "text-teal-500 dark:text-teal-400",
    queries: [
      "How many work orders are delayed?",
      "Break down work orders by execution status.",
      "Which projects have pending unbilled invoices?",
    ],
  },
  {
    title: "Risk & Client Health",
    icon: AlertOctagon,
    color: "text-amber-500 dark:text-amber-400",
    queries: [
      "Show clients with high risk scores.",
      "Which clients have dead deals or stalled projects?",
    ],
  },
  {
    title: "Executive Summaries",
    icon: FileSpreadsheet,
    color: "text-blue-500 dark:text-blue-400",
    queries: [
      "Generate a comprehensive leadership update.",
      "Provide an executive summary of current revenue & pipeline.",
    ],
  },
];

export function Sidebar({
  isOpen,
  onCloseMobile,
  activeView,
  onViewChange,
  onSelectPrompt,
  onNewAnalysis,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Rail */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-slate-50 transition-all duration-200 ease-in-out dark:border-slate-800/80 dark:bg-slate-950 lg:static ${
          isOpen
            ? "w-72 translate-x-0 opacity-100"
            : "w-0 -translate-x-full border-r-0 opacity-0 overflow-hidden lg:translate-x-0"
        }`}
      >
        <div className="w-72 flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-14 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20">
                <BarChart2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Skylark BI
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary View Switcher in Sidebar */}
          <div className="p-3 space-y-1.5 border-b border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={() => {
                onViewChange("dashboard");
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeView === "dashboard"
                  ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950"
                  : "text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => {
                onViewChange("chat");
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                activeView === "chat"
                  ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950"
                  : "text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <MessageSquareText className="h-4 w-4" />
              <span>AI BI Agent Chat</span>
            </button>
          </div>

          {/* Action Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewAnalysis();
                onViewChange("chat");
                onCloseMobile();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.98] dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Conversation</span>
            </button>
          </div>


          {/* Categorized Quick Queries */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500 px-1">
              Analysis Playbooks
            </div>

            {PROMPT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.title} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Icon className={`h-3.5 w-3.5 ${category.color}`} />
                    <span>{category.title}</span>
                  </div>
                  <div className="space-y-0.5">
                    {category.queries.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          onSelectPrompt(q);
                          onCloseMobile();
                        }}
                        className="group flex w-full text-left rounded-lg px-2.5 py-1.5 text-[11.5px] leading-snug text-slate-600 transition-colors hover:bg-emerald-50/80 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
                      >
                        <span className="line-clamp-2">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
