"use client";

import { useEffect } from "react";
import {
  TrendingUp,
  Workflow,
  ShieldAlert,
  PlusCircle,
  LayoutDashboard,
  X,
} from "lucide-react";
import {
  SkylarkLogo,
  SkylarkIntelligenceIcon,
  ExecutiveBriefingIcon,
} from "./icons/SkylarkIcons";

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
    color: "text-emerald-700 dark:text-emerald-400",
    queries: [
      "How is our pipeline looking this quarter?",
      "Which sector has the highest deal value?",
      "Compare Energy vs Manufacturing pipeline.",
      "What is our overall deal win rate?",
    ],
  },
  {
    title: "Operations & Delivery",
    icon: Workflow,
    color: "text-teal-700 dark:text-teal-400",
    queries: [
      "How many work orders are delayed?",
      "Break down work orders by execution status.",
      "Which projects have pending unbilled invoices?",
    ],
  },
  {
    title: "Risk & Governance",
    icon: ShieldAlert,
    color: "text-amber-800 dark:text-amber-400",
    queries: [
      "Show clients with high risk scores.",
      "Which clients have dead deals or stalled projects?",
    ],
  },
  {
    title: "Executive Summaries",
    icon: ExecutiveBriefingIcon,
    color: "text-indigo-700 dark:text-indigo-400",
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
  // Close on Escape key press on mobile
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onCloseMobile();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Rail */}
      <aside
        id="navigation-sidebar"
        role="navigation"
        aria-label="Sidebar Navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/90 bg-slate-50/95 transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:static ${
          isOpen
            ? "w-72 translate-x-0 opacity-100 shadow-xl lg:shadow-none"
            : "w-0 -translate-x-full border-r-0 opacity-0 overflow-hidden lg:translate-x-0"
        }`}
      >
        <div className="w-72 flex h-full flex-col">
          {/* Brand Header */}
          <div className="flex h-14 items-center justify-between border-b border-slate-200/90 px-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs dark:bg-emerald-600">
                <SkylarkLogo className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Skylark BI
                </span>
                <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                  Executive Intelligence
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Primary View Switcher */}
          <div className="p-3 space-y-1 border-b border-slate-200/90 dark:border-slate-800">
            <button
              onClick={() => {
                onViewChange("dashboard");
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                activeView === "dashboard"
                  ? "bg-emerald-700 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950"
                  : "text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => {
                onViewChange("chat");
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                activeView === "chat"
                  ? "bg-emerald-700 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950"
                  : "text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <SkylarkIntelligenceIcon className="h-4 w-4 shrink-0" />
              <span>Strategic Inquiries</span>
            </button>
          </div>

          {/* New Conversation Trigger */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewAnalysis();
                onViewChange("chat");
                onCloseMobile();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-emerald-700/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span>New Analysis Query</span>
            </button>
          </div>

          {/* Categorized Inquiry Playbooks */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400 px-1">
              Analysis Playbooks
            </div>

            {PROMPT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.title} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Icon className={`h-3.5 w-3.5 ${category.color}`} aria-hidden="true" />
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
                        className="group flex w-full text-left rounded-lg px-2.5 py-1.5 text-xs leading-snug text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-slate-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200"
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
