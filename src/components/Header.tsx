"use client";

import { useTheme } from "./ThemeProvider";
import {
  Sun,
  Moon,
  Laptop,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  RefreshCw,
  LayoutDashboard,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SkylarkIntelligenceIcon, ExecutiveBriefingIcon } from "./icons/SkylarkIcons";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeView: "dashboard" | "chat";
  onViewChange: (view: "dashboard" | "chat") => void;
  onClearChat: () => void;
  onExecutiveBriefing: () => void;
  hasMessages: boolean;
  onSyncNow?: () => void;
  isSyncing?: boolean;
  lastSyncedText?: string;
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  activeView,
  onViewChange,
  onClearChat,
  onExecutiveBriefing,
  hasMessages,
  onSyncNow,
  isSyncing,
  lastSyncedText = "Live (5m auto-sync)",
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
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && themeMenuOpen) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [themeMenuOpen]);

  return (
    <header
      role="banner"
      className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/90 bg-white/95 px-3 sm:px-6 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={sidebarOpen}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/80 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* View Switcher Segmented Control (Desktop / Tablet) */}
        <nav
          role="tablist"
          aria-label="Workspace views"
          className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-300/80 dark:border-slate-700/80 dark:bg-slate-800/90"
        >
          <button
            role="tab"
            aria-selected={activeView === "dashboard"}
            aria-controls="view-dashboard"
            id="tab-dashboard"
            onClick={() => onViewChange("dashboard")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              activeView === "dashboard"
                ? "bg-white text-emerald-800 shadow-xs dark:bg-slate-900 dark:text-emerald-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Executive Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </button>

          <button
            role="tab"
            aria-selected={activeView === "chat"}
            aria-controls="view-chat"
            id="tab-chat"
            onClick={() => onViewChange("chat")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 ${
              activeView === "chat"
                ? "bg-white text-emerald-800 shadow-xs dark:bg-slate-900 dark:text-emerald-300"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <SkylarkIntelligenceIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">AI Strategic Inquiries</span>
            <span className="sm:hidden">AI Chat</span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Sync Status Badge & Manual Trigger */}
        {onSyncNow && (
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            aria-label={`Data synchronization status: ${lastSyncedText}. Click to refresh.`}
            title="Auto-syncing every 5 mins. Click to sync live data now."
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-300/80 bg-slate-50/80 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isSyncing ? "animate-spin text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
              }`}
              aria-hidden="true"
            />
            <span className="hidden md:inline">{lastSyncedText}</span>
            <span className="md:hidden">Sync</span>
          </button>
        )}

        {/* 1-Click Executive Briefing Trigger */}
        <button
          onClick={onExecutiveBriefing}
          aria-label="Generate comprehensive executive briefing"
          title="Generate instant leadership briefing"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 border border-emerald-300/80 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-emerald-700/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
        >
          <ExecutiveBriefingIcon className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          <span className="hidden sm:inline">Leadership Briefing</span>
          <span className="sm:hidden">Briefing</span>
        </button>

        {/* Clear Chat Button (in Chat View) */}
        {activeView === "chat" && hasMessages && (
          <button
            onClick={onClearChat}
            aria-label="Start new analysis conversation"
            title="Reset conversation"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-300/80 px-2.5 sm:px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">New Analysis</span>
          </button>
        )}

        {/* Theme Selector Popover */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            aria-label={`Toggle theme (currently ${theme})`}
            aria-haspopup="true"
            aria-expanded={themeMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300/80 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ) : (
              <Sun className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            )}
          </button>

          {themeMenuOpen && (
            <div
              role="menu"
              aria-label="Theme options"
              className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-2xl z-30"
            >
              {[
                { key: "light", label: "Light", icon: Sun },
                { key: "dark", label: "Dark", icon: Moon },
                { key: "system", label: "System", icon: Laptop },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  role="menuitem"
                  onClick={() => {
                    setTheme(key as "light" | "dark" | "system");
                    setThemeMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    theme === key
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                  {theme === key && <Check className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
