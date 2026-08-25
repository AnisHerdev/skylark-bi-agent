"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage as ChatMessageType } from "@/lib/types";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

const SAMPLE_QUESTIONS = [
  "How is our pipeline looking this quarter?",
  "Which sector has the highest deal value?",
  "How many work orders are delayed?",
  "Compare Energy vs Manufacturing pipeline.",
  "Generate a leadership update.",
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMsg: ChatMessageType = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
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
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: ChatMessageType = {
        id: generateId(),
        role: "assistant",
        content: `Sorry, something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Please check your API keys and monday.com configuration.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Skylark BI Agent
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ask questions about your sales and operations
        </p>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-2 text-4xl">🚀</div>
            <h2 className="mb-1 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Ask Skylark AI anything
            </h2>
            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
              Your AI business analyst for sales and operations data
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
              </div>
            </div>
          </div>
        )}
      </main>

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
