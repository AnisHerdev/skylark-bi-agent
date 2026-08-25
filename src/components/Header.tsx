"use client";

import { useTheme } from "./ThemeProvider";
import {
  Sun,
  Moon,
  Laptop,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onClearChat: () => void;
  onExecutiveBriefing: () => void;
  hasMessages: boolean;
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  onClearChat,
  onExecutiveBriefing,
  hasMessages,
}: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Skylark BI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 1-Click Executive Briefing Button */}
        <button
          onClick={onExecutiveBriefing}
          title="Generate instant leadership briefing"
          className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
        >
          <Zap className="h-3.5 w-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Executive Briefing</span>
          <span className="sm:hidden">Briefing</span>
        </button>

        {/* Clear Chat Button */}
        {hasMessages && (
          <button
            onClick={onClearChat}
            title="Reset conversation"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        )}

        {/* Theme Selector Popover */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            aria-label="Toggle theme menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-emerald-400" />
            ) : (
              <Sun className="h-4 w-4 text-emerald-600" />
            )}
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-2xl">
              <button
                onClick={() => {
                  setTheme("light");
                  setThemeMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === "light"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  setThemeMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => {
                  setTheme("system");
                  setThemeMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  theme === "system"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>System</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
