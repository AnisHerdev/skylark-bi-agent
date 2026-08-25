"use client";

import { useState, useRef, FormEvent } from "react";
import { Send, CornerDownLeft } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
    <div className="border-t border-slate-200/80 bg-white/90 p-2.5 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/90 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-1.5 shadow-xs transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/15 dark:border-slate-800 dark:bg-slate-950/70 dark:focus-within:border-emerald-400 dark:focus-within:bg-slate-900 dark:focus-within:ring-emerald-400/20"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Ask anything about sales, operations, or pipeline..."
          disabled={disabled}
          rows={1}
          style={{ overflowY: "hidden" }}
          className="flex-1 max-h-36 resize-none bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50 dark:text-slate-100 dark:placeholder:text-slate-500 leading-normal"
        />

        <div className="flex items-center gap-1.5 pb-0.5 pr-0.5 sm:pb-1 sm:pr-1">
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs transition-all hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            title="Send query (Enter)"
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </form>

      {/* Desktop-only helper text */}
      <div className="mx-auto mt-2 hidden max-w-4xl items-center justify-center text-[10.5px] text-slate-400 dark:text-slate-500 sm:flex">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="h-2.5 w-2.5" />
          <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
        </span>
      </div>
    </div>
  );
}
