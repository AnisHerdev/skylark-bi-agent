"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import {
  Copy,
  Check,
  Sparkles,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Database,
  ArrowRight,
  Share2,
} from "lucide-react";

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
    // Format text cleanly for Slack/Email (ensure clean bullets & clear bold numbers)
    const formatted = message.content
      .replace(/^#{1,3}\s+(.*)$/gm, "*$1*")
      .replace(/\|/g, " ")
      .trim();

    navigator.clipboard.writeText(
      `📊 *Skylark BI Executive Update*\n\n${formatted}\n\n_Generated via Skylark BI Agent_`
    );
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  const dq = message.dataQuality;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-5 sm:mb-6`}>
      <div
        className={`flex items-start gap-2.5 sm:gap-3 ${
          isUser
            ? "max-w-[90%] sm:max-w-[85%] flex-row-reverse"
            : "w-full sm:max-w-[88%] flex-row"
        }`}
      >
        {/* Avatar Chip */}
        <div
          className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl shadow-xs mt-0.5 ${
            isUser
              ? "bg-slate-800 text-white dark:bg-slate-700 dark:text-slate-100"
              : "bg-emerald-600 text-white shadow-emerald-600/20 dark:bg-emerald-500 dark:text-slate-950"
          }`}
        >
          {isUser ? (
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className={`rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-sm leading-relaxed shadow-xs transition-colors ${
              isUser
                ? "bg-emerald-600 text-white shadow-emerald-600/10 dark:bg-emerald-600 dark:text-white"
                : "border border-slate-200/80 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-slate-900/5"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap font-normal">{message.content}</div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ ...props }) => (
                      <div className="bi-markdown-table-wrapper my-2 sm:my-3">
                        <table className="bi-markdown-table" {...props} />
                      </div>
                    ),
                    th: ({ ...props }) => (
                      <th className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-left font-semibold text-slate-800 dark:text-slate-200 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs sm:text-sm" {...props} />
                    ),
                    td: ({ ...props }) => (
                      <td className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 text-xs sm:text-sm" {...props} />
                    ),
                    h1: ({ ...props }) => (
                      <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 mt-3 sm:mt-4 mb-2 first:mt-0" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-2.5 sm:mt-3 mb-1.5" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-2.5 mb-1" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="my-1.5 sm:my-2 list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="my-1.5 sm:my-2 list-decimal pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm" {...props} />
                    ),
                    blockquote: ({ ...props }) => (
                      <blockquote className="border-l-2 border-emerald-500 pl-3 my-2 text-slate-600 italic dark:text-slate-400" {...props} />
                    ),
                    code: ({ ...props }) => (
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] sm:text-xs text-emerald-700 dark:bg-slate-800 dark:text-emerald-300" {...props} />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Smart Contextual Follow-up Chips (Zero-Typing Drill-Downs) */}
            {!isUser && message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Explore Next
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectSuggestion(suggestion)}
                      className="group flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 text-left"
                    >
                      <span>{suggestion}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:text-slate-500 dark:group-hover:text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Quality & Governance Drawer */}
            {!isUser && dq && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => setShowQualityReport(!showQualityReport)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50/70 px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition-all hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Data Integrity: {dq.validRecords}/{dq.totalRecords} Records Verified ({dq.overallHealthScore}% Health)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                    <span>{showQualityReport ? "Hide" : "Details"}</span>
                    {showQualityReport ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </button>

                {showQualityReport && (
                  <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 space-y-2.5">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Total Ingested
                        </div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {dq.totalRecords}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Clean Verified
                        </div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {dq.validRecords}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Filtered Headers
                        </div>
                        <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          {dq.droppedHeaderRows}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Integrity Score
                        </div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {dq.overallHealthScore}%
                        </div>
                      </div>
                    </div>

                    {/* Board Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <div className="rounded-lg border border-slate-200/60 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                          <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Deals Board (Sales)</span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Total Rows:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{dq.deals.totalRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Valid Deals:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dq.deals.validRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Dropped Headers:</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{dq.deals.droppedHeaderRows}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200/60 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                          <Database className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Work Orders Board (Ops)</span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Total Rows:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{dq.workOrders.totalRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Valid Work Orders:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dq.workOrders.validRecords}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span>Dropped Headers:</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{dq.workOrders.droppedHeaderRows}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Cleansing Notes */}
                    {dq.summaryNotes && dq.summaryNotes.length > 0 && (
                      <div className="rounded-lg bg-emerald-50/70 p-2.5 border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                        <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Automated Cleansing & Governance Actions Applied:</span>
                        </div>
                        <ul className="space-y-0.5 text-[10.5px] text-emerald-900/80 dark:text-emerald-200/80 list-disc pl-4">
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
            className={`mt-1.5 flex items-center gap-2 px-1 text-[11px] ${
              isUser ? "justify-end text-slate-400 dark:text-slate-500" : "justify-between text-slate-400 dark:text-slate-500"
            }`}
          >
            {!isUser && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Gemini 2.5 Flash
                </span>
                <span>•</span>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {isUser && (
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            {!isUser && (
              <div className="flex items-center gap-1.5">
                {/* Copy for Slack / WhatsApp */}
                <button
                  onClick={handleCopyForSlack}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  title="Copy formatted for Slack/Email update"
                >
                  {copiedSlack ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Slack Ready!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3" />
                      <span>For Slack</span>
                    </>
                  )}
                </button>

                {/* Copy Raw Full Report */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  title="Copy full report"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
