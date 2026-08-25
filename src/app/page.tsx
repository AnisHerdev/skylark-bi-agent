"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import {
  Sparkles,
  TrendingUp,
  Activity,
  FileText,
  ArrowRight,
  Layers,
  Square,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

const STORAGE_KEY = "skylark_chat_history_v1";

const STARTER_CARDS = [
  {
    category: "Pipeline & Revenue",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700/60",
    query: "How is our pipeline looking this quarter?",
    description: "Analyze current deal volumes, total pipeline value, and stage distribution.",
  },
  {
    category: "Sector Comparison",
    icon: Layers,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-500/10",
    borderHover: "hover:border-teal-300 dark:hover:border-teal-700/60",
    query: "Compare Energy vs Manufacturing pipeline.",
    description: "Sector-by-sector breakdown of deal counts, win rates, and total PO values.",
  },
  {
    category: "Operations & Delivery",
    icon: Activity,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderHover: "hover:border-blue-300 dark:hover:border-blue-700/60",
    query: "How many work orders are delayed?",
    description: "Track execution status, bottleneck projects, and unbilled work order balances.",
  },
  {
    category: "Leadership Briefing",
    icon: FileText,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-700/60",
    query: "Generate a leadership update.",
    description: "Synthesize an executive summary with wins, operational alerts, and risks.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. Load Chat History from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatMessageType[] = JSON.parse(saved);
        // Revive ISO date strings to Date objects
        const hydrated = parsed.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(hydrated);
      }
    } catch (e) {
      console.warn("Failed to load chat history from localStorage", e);
    } finally {
      setIsStorageLoaded(true);
    }
  }, []);

  // 2. Persist Chat History to LocalStorage on change (only after initial load)
  useEffect(() => {
    if (!isStorageLoaded) return;
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to save chat history to localStorage", e);
    }
  }, [messages, isStorageLoaded]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // 3. Stop Generation handler
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  const handleSend = async (content: string) => {
    if (loading) return;

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
        onSelectPrompt={handleSend}
        onNewAnalysis={handleClearChat}
      />

      {/* Main Canvas Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-all duration-200">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onClearChat={handleClearChat}
          onExecutiveBriefing={() => handleSend("Generate a comprehensive leadership update.")}
          hasMessages={messages.length > 0}
        />

        {/* Scrollable Chat Area */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8"
        >
          <div className="mx-auto max-w-4xl">
            {messages.length === 0 ? (
              <div className="flex min-h-[75vh] flex-col items-center justify-center py-8">
                {/* Hero Icon & Title */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-8 ring-emerald-50 dark:ring-emerald-950/40">
                  <Sparkles className="h-7 w-7" />
                </div>

                <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                  Skylark Business Intelligence
                </h1>
                <p className="mt-2 max-w-lg text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Ask natural language questions to analyze sales pipelines, work orders, client health, and executive briefings.
                </p>

                {/* Starter Prompt Cards Grid */}
                <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {STARTER_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.category}
                        onClick={() => handleSend(card.query)}
                        className={`group relative flex flex-col text-left rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 ${card.borderHover}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {card.category}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-slate-600" />
                        </div>

                        <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {card.query}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
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

                {/* Loading / Thinking State with Stop Action */}
                {loading && (
                  <div className="flex items-start gap-3 mb-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-mint-pulse [animation-delay:-0.3s]" />
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-mint-pulse [animation-delay:-0.15s]" />
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-mint-pulse" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Querying live Monday boards & generating intelligence...
                        </span>
                      </div>

                      <button
                        onClick={handleStop}
                        className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:border-rose-900 dark:hover:text-rose-400"
                        title="Cancel generation"
                      >
                        <Square className="h-3 w-3 fill-current" />
                        <span>Stop</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Input Dock */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          loading={loading}
          disabled={loading}
        />
      </div>
    </div>
  );
}
