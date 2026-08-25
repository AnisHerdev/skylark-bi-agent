"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import {
  Copy,
  Check,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Database,
  ArrowRight,
  Share2,
} from "lucide-react";
import { SkylarkIntelligenceIcon } from "./icons/SkylarkIcons";

interface ChatMessageProps {
  message: ChatMessageType;
  isLatestAssistant?: boolean;
  onSelectSuggestion?: (query: string) => void;
}

export function ChatMessage({
  message,
  isLatestAssistant,
  onSelectSuggestion,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [showQualityReport, setShowQualityReport] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyForSlack = () => {
    const formatted = message.content
      .replace(/^#{1,3}\s+(.*)$/gm, "*$1*")
      .replace(/\|/g, " ")
      .trim();

    navigator.clipboard.writeText(
      `📊 *Skylark BI Update*\n\n${formatted}\n\n_Generated via Skylark BI_`
    );
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  const dq = message.dataQuality;

  return (
    <article
      aria-label={`${isUser ? "User" : "Skylark AI"} message`}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-3 sm:mb-5`}
    >
      <div
        className={`flex items-start gap-2 sm:gap-3 ${
          isUser
            ? "max-w-[94%] sm:max-w-[85%] flex-row-reverse"
            : "w-full sm:max-w-[88%] flex-row"
        }`}
      >
        {/* Avatar Chip */}
        <div
          className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl shadow-2xs mt-0.5 ${
            isUser
              ? "bg-slate-800 text-white dark:bg-slate-700 dark:text-slate-100"
              : "bg-emerald-700 text-white shadow-xs dark:bg-emerald-600 dark:text-white"
          }`}
          aria-hidden="true"
        >
          {isUser ? (
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <SkylarkIntelligenceIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`rounded-2xl px-3.5 py-3 sm:px-5 sm:py-4 text-sm leading-relaxed shadow-2xs transition-colors ${
              isUser
                ? "bg-emerald-700 text-white shadow-emerald-900/10 dark:bg-emerald-600 dark:text-white"
                : "border border-slate-300/80 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap font-normal text-xs sm:text-sm">{message.content}</div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ ...props }) => (
                      <div className="bi-markdown-table-wrapper my-2 sm:my-3">
                        <table className="bi-markdown-table" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th
                        scope="col"
                        className="px-2 py-1.5 sm:px-3 sm:py-2 text-left font-bold text-slate-900 dark:text-slate-100 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-xs sm:text-sm"
                        {...props}
                      />
                    ),
                    td: ({ ...props }) => (
                      <td
                        className="px-2 py-1.5 sm:px-3 sm:py-1.5 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm"
                        {...props}
                      />
                    ),
                    h1: ({ ...props }) => (
                      <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-slate-50 mt-2.5 sm:mt-4 mb-1.5 first:mt-0" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 sm:mt-3 mb-1" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mt-2 mb-1" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="my-1.5 list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="my-1.5 list-decimal pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200" {...props} />
                    ),
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-2 border-emerald-600 pl-2.5 sm:pl-3 my-1.5 sm:my-2 text-slate-700 italic dark:text-slate-300 text-xs sm:text-sm" {...props} />
                    ),
                    code: ({ ...props }) => (
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] sm:text-xs text-emerald-800 dark:bg-slate-800 dark:text-emerald-300" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Suggested Questions */}
            {!isUser && isLatestAssistant && message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 sm:mb-2">
                  Suggested Questions
                </div>
                <div className="flex sm:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectSuggestion(suggestion)}
                      className="group shrink-0 sm:shrink flex items-center gap-1.5 rounded-xl border border-slate-300/80 bg-slate-50 px-2.5 sm:px-3 py-1.5 text-[11.5px] sm:text-xs font-medium text-slate-800 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200 text-left min-h-[36px]"
                    >
                      <span className="whitespace-nowrap sm:whitespace-normal">{suggestion}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-300" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Quality Report */}
            {!isUser && dq && (
              <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-200/70 dark:border-slate-800/60">
                <button
                  onClick={() => setShowQualityReport(!showQualityReport)}
                  aria-expanded={showQualityReport}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-medium text-slate-800 transition-all hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px] sm:text-xs">
                      Data Health: {dq.validRecords}/{dq.totalRecords} ({dq.overallHealthScore}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0 ml-1">
                    <span>{showQualityReport ? "Hide" : "Inspect"}</span>
                    {showQualityReport ? (
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </div>
                </button>

                {showQualityReport && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 space-y-2">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-center">
                      <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          Total Rows
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {dq.totalRecords}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          Clean Records
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {dq.validRecords}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          Filtered Headers
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-400 mt-0.5">
                          {dq.droppedHeaderRows}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-1.5 sm:p-2 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                          Health
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {dq.overallHealthScore}%
                        </div>
                      </div>
                    </div>

                    {/* Board Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
                      <div className="rounded-lg border border-slate-200 bg-white p-2 sm:p-2.5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1 text-[11.5px] sm:text-xs">
                          <Database className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                          <span>Deals Board (Sales)</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] sm:text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Total Rows:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{dq.deals.totalRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Valid Deals:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{dq.deals.validRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Filtered Headers:</span>
                            <span className="font-bold text-amber-800 dark:text-amber-400">{dq.deals.droppedHeaderRows}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-2 sm:p-2.5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 mb-1 text-[11.5px] sm:text-xs">
                          <Database className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" aria-hidden="true" />
                          <span>Work Orders (Ops)</span>
                        </div>
                        <div className="space-y-0.5 text-[11px] sm:text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Total Rows:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">{dq.workOrders.totalRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Valid Orders:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">{dq.workOrders.validRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Filtered Headers:</span>
                            <span className="font-bold text-amber-800 dark:text-amber-400">{dq.workOrders.droppedHeaderRows}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Cleansing Notes */}
                    {dq.summaryNotes && dq.summaryNotes.length > 0 && (
                      <div className="rounded-lg bg-emerald-50 p-2 sm:p-2.5 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                        <div className="text-[11px] sm:text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                          <span>Automatic cleaning actions:</span>
                        </div>
                        <ul className="space-y-0.5 text-[11px] text-emerald-950 dark:text-emerald-200 list-disc pl-3.5">
                          {dq.summaryNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamp & Action Toolbar */}
          <div
            className={`mt-1 flex items-center gap-2 px-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 ${
              isUser ? "justify-end" : "justify-between"
            }`}
          >
            {!isUser && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  Gemini 2.5 Flash
                </span>
                <span aria-hidden="true">•</span>
                <time dateTime={new Date(message.timestamp).toISOString()}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            )}

            {isUser && (
              <time dateTime={new Date(message.timestamp).toISOString()}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            )}

            {!isUser && (
              <div className="flex items-center gap-1">
                {/* Copy for Slack */}
                <button
                  onClick={handleCopyForSlack}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 min-h-[30px]"
                  title="Copy formatted for Slack or Email"
                  aria-label="Copy update formatted for Slack"
                >
                  {copiedSlack ? (
                    <>
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      <span className="text-emerald-800 dark:text-emerald-400 font-semibold text-[11px] sm:text-xs">Slack Ready!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                      <span className="text-[11px] sm:text-xs">For Slack</span>
                    </>
                  )}
                </button>

                {/* Copy Raw Text */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 min-h-[30px]"
                  title="Copy full response"
                  aria-label="Copy response text"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      <span className="text-emerald-800 dark:text-emerald-400 font-semibold text-[11px] sm:text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                      <span className="text-[11px] sm:text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
