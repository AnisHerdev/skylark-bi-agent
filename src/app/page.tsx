"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import {
  ChatMessage as ChatMessageType,
  DashboardData,
} from "@/lib/types";
import {
  TrendingUp,
  Workflow,
  ArrowRight,
  Layers,
  Square,
} from "lucide-react";
import {
  SkylarkLogo,
  SkylarkIntelligenceIcon,
  ExecutiveBriefingIcon,
} from "@/components/icons/SkylarkIcons";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

const STORAGE_KEY = "skylark_chat_history_v1";
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const STARTER_CARDS = [
  {
    category: "Pipeline & Revenue",
    icon: TrendingUp,
    color: "text-emerald-800 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-400 dark:hover:border-emerald-600",
    query: "How is our pipeline looking this quarter?",
    description: "Analyze active deal volumes, total pipeline value, and stage distribution.",
  },
  {
    category: "Sector Intelligence",
    icon: Layers,
    color: "text-teal-800 dark:text-teal-400",
    bgColor: "bg-teal-500/10",
    borderHover: "hover:border-teal-400 dark:hover:border-teal-600",
    query: "Compare Energy vs Manufacturing pipeline.",
    description: "Sector-by-sector breakdown of deal counts, win rates, and total PO values.",
  },
  {
    category: "Operations & Delivery",
    icon: Workflow,
    color: "text-blue-800 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderHover: "hover:border-blue-400 dark:hover:border-blue-600",
    query: "How many work orders are delayed?",
    description: "Track execution status, bottleneck projects, and unbilled work order balances.",
  },
  {
    category: "Executive Briefing",
    icon: ExecutiveBriefingIcon,
    color: "text-indigo-800 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderHover: "hover:border-indigo-400 dark:hover:border-indigo-600",
    query: "Generate a comprehensive leadership update.",
    description: "Synthesize an executive briefing with revenue wins, delivery alerts, and risks.",
  },
];

export default function Home() {
  // Navigation View State: Primary view is Executive Dashboard
  const [activeView, setActiveView] = useState<"dashboard" | "chat">("dashboard");

  // Dashboard Data & Sync State
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(null);
  const [timeAgoText, setTimeAgoText] = useState<string>("Syncing...");

  // Chat State
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatMessageType[] = JSON.parse(saved);
        return parsed.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      }
    } catch (e) {
      console.warn("Failed to load chat history from localStorage", e);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(false);

  // 1. Fetch Dashboard Data
  const loadDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setDashboardLoading(true);
    }
    setIsSyncing(true);

    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to load dashboard: ${res.statusText}`);
      }
      const data: DashboardData = await res.json();
      setDashboardData(data);
      setLastSyncedTime(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setDashboardLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  // 2. 5-Minute Auto-Sync Polling Engine with Visibility Detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadDashboardData(true);
      }
    }, AUTO_SYNC_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && lastSyncedTime) {
        const elapsed = Date.now() - lastSyncedTime.getTime();
        if (elapsed > AUTO_SYNC_INTERVAL_MS) {
          loadDashboardData(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadDashboardData, lastSyncedTime]);

  // Dynamic "Synced Xm ago" ticker
  useEffect(() => {
    const updateTicker = () => {
      if (!lastSyncedTime) {
        setTimeAgoText("Live (5m auto-sync)");
        return;
      }
      const diffSec = Math.floor((Date.now() - lastSyncedTime.getTime()) / 1000);
      if (diffSec < 60) {
        setTimeAgoText("Synced just now");
      } else {
        const mins = Math.floor(diffSec / 60);
        setTimeAgoText(`Synced ${mins}m ago`);
      }
    };

    updateTicker();
    const tickerInterval = setInterval(updateTicker, 30000);
    return () => clearInterval(tickerInterval);
  }, [lastSyncedTime]);

  // Persist Chat History to LocalStorage
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to save chat history to localStorage", e);
    }
  }, [messages]);

  // Auto-scroll to latest message in Chat View
  useEffect(() => {
    if (activeView === "chat") {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading, activeView]);

  // Stop Generation handler
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  const handleSend = async (content: string) => {
    if (loading) return;

    // Switch to chat view immediately
    setActiveView("chat");

    const userMsg: ChatMessageType = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMsg: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        dataQuality: data.dataQuality,
        suggestions: data.suggestions,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      if (err instanceof Error && (err.name === "AbortError" || controller.signal.aborted)) {
        const abortedMsg: ChatMessageType = {
          id: generateId(),
          role: "assistant",
          content: "*(Analysis was stopped by user)*",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, abortedMsg]);
      } else {
        const errMsg: ChatMessageType = {
          id: generateId(),
          role: "assistant",
          content: `Sorry, something went wrong: ${
            err instanceof Error ? err.message : "Unknown error"
          }. Please verify your Gemini API key and Monday.com configuration.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    handleStop();
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage", e);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onSelectPrompt={handleSend}
        onNewAnalysis={handleClearChat}
      />

      {/* Main Canvas Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-all duration-200">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          onClearChat={handleClearChat}
          onExecutiveBriefing={() => handleSend("Generate a comprehensive leadership update.")}
          hasMessages={messages.length > 0}
          onSyncNow={() => loadDashboardData(true)}
          isSyncing={isSyncing}
          lastSyncedText={timeAgoText}
        />

        {/* View 1: Executive Dashboard View */}
        {activeView === "dashboard" && (
          <main
            id="view-dashboard"
            role="region"
            aria-labelledby="tab-dashboard"
            className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 md:px-8"
          >
            <div className="mx-auto max-w-6xl">
              <ExecutiveDashboard
                data={dashboardData}
                loading={dashboardLoading}
                onSelectQuery={handleSend}
                onRefresh={() => loadDashboardData(false)}
              />
            </div>
          </main>
        )}

        {/* View 2: AI Strategic Inquiries Conversational Workspace */}
        {activeView === "chat" && (
          <>
            <main
              id="view-chat"
              ref={scrollRef}
              role="region"
              aria-labelledby="tab-chat"
              className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 md:px-8"
            >
              <div className="mx-auto max-w-4xl">
                {messages.length === 0 ? (
                  <div className="flex min-h-[70vh] flex-col items-center justify-center py-6">
                    {/* Hero Icon & Title */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-700/20 dark:bg-emerald-600">
                      <SkylarkLogo className="h-7 w-7 text-white" />
                    </div>

                    <h1 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
                      Skylark Business Intelligence
                    </h1>
                    <p className="mt-1.5 max-w-md text-center text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Ask strategic questions across sales pipelines, work order execution, customer health, and executive briefings.
                    </p>

                    {/* Starter Prompt Cards Grid */}
                    <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {STARTER_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                          <button
                            key={card.category}
                            onClick={() => handleSend(card.query)}
                            className={`group relative flex flex-col text-left rounded-2xl border border-slate-300/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-all hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-900 ${card.borderHover}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                  {card.category}
                                </span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-700 dark:text-slate-500 dark:group-hover:text-emerald-400" aria-hidden="true" />
                            </div>

                            <div className="mt-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {card.query}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                              {card.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pb-4">
                    {messages.map((msg, idx) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        isLatestAssistant={idx === messages.length - 1 && msg.role === "assistant"}
                        onSelectSuggestion={(q) => handleSend(q)}
                      />
                    ))}

                    {/* Loading / Thinking State */}
                    {loading && (
                      <div className="flex items-start gap-3 mb-6" aria-live="polite">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs dark:bg-emerald-600">
                          <SkylarkIntelligenceIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-300/80 bg-white px-5 py-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5" aria-hidden="true">
                              <div className="h-2 w-2 rounded-full bg-emerald-600 animate-mint-pulse [animation-delay:-0.3s]" />
                              <div className="h-2 w-2 rounded-full bg-emerald-600 animate-mint-pulse [animation-delay:-0.15s]" />
                              <div className="h-2 w-2 rounded-full bg-emerald-600 animate-mint-pulse" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Querying live Monday boards & generating intelligence...
                            </span>
                          </div>

                          <button
                            onClick={handleStop}
                            className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950 dark:hover:border-rose-800 dark:hover:text-rose-300"
                            title="Cancel analysis"
                            aria-label="Cancel analysis"
                          >
                            <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                            <span>Stop</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>

            {/* Single Elegant Input Dock */}
            <ChatInput
              onSend={handleSend}
              onStop={handleStop}
              loading={loading}
              disabled={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}
