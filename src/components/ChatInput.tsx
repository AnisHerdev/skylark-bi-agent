"use client";

import { useState, useRef, FormEvent } from "react";
import { Send, CornerDownLeft, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, loading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (loading && onStop) {
      onStop();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      const newHeight = Math.min(ta.scrollHeight, 140);
      ta.style.height = `${newHeight}px`;
      ta.style.overflowY = ta.scrollHeight > 140 ? "auto" : "hidden";
    }
  };

  return (
    <div className="border-t border-slate-200/90 bg-white/95 p-2.5 sm:p-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl flex items-end gap-2 rounded-2xl border border-slate-300/90 bg-slate-50/90 p-1.5 shadow-2xs transition-all focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/25 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-emerald-500 dark:focus-within:bg-slate-900"
      >
        <label htmlFor="bi-chat-input" className="sr-only">
          Ask Skylark BI a business question
        </label>
        <textarea
          id="bi-chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            loading
              ? "Synthesizing intelligence from live Monday boards..."
              : "Ask anything about sales, operations, or pipeline..."
          }
          disabled={loading}
          rows={1}
          style={{ overflowY: "hidden", outline: "none", boxShadow: "none" }}
          className="flex-1 max-h-36 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 shadow-none disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-400 leading-normal"
        />

        <div className="flex items-center gap-1.5 pb-0.5 pr-0.5 sm:pb-1 sm:pr-1">
          {loading ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generation"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-700 text-white shadow-xs transition-all hover:bg-rose-600 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-600"
              title="Stop generation"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send query"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              title="Send query (Enter)"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Helper text */}
      <div className="mx-auto mt-2 hidden max-w-4xl items-center justify-center text-xs text-slate-600 dark:text-slate-400 sm:flex">
        {loading ? (
          <span className="text-emerald-800 dark:text-emerald-300 font-semibold" aria-live="polite">
            Analyzing live data records • Click stop anytime to cancel
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
            <span>
              Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
