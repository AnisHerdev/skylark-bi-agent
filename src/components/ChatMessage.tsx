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
  AlertCircle,
  CheckCircle2,
  Database,
} from "lucide-react";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [showQualityReport, setShowQualityReport] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-2 mb-1" {...props} />
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

            {/* Explainable Data Quality & Governance Drawer */}
            {!isUser && dq && (
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => setShowQualityReport(!showQualityReport)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-all hover:bg-slate-100/90 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Data Integrity & Cleansing Audit
                    </span>
                    <span className="hidden sm:inline-block text-[11px] font-normal text-slate-500 dark:text-slate-400">
                      • {dq.validRecords}/{dq.totalRecords} Records Verified ({dq.overallHealthScore}% Health)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">
                    <span>{showQualityReport ? "Hide Audit" : "Inspect Data Audit"}</span>
                    {showQualityReport ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </div>
                </button>

                {showQualityReport && (
                  <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 space-y-3">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Total Ingested
                        </div>
                        <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {dq.totalRecords}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Clean Verified
                        </div>
                        <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {dq.validRecords}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Filtered Headers
                        </div>
                        <div className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                          {dq.droppedHeaderRows}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                          Integrity Score
                        </div>
                        <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {dq.overallHealthScore}%
                        </div>
                      </div>
                    </div>

                    {/* Board Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* Deals Board Audit */}
                      <div className="rounded-lg border border-slate-200/60 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 mb-2">
                          <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Deals Board (Sales Pipeline)</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Rows:</span>
                            <span className="font-semibold">{dq.deals.totalRecords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Valid Pipeline Deals:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dq.deals.validRecords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Dropped Duplicate Headers:</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{dq.deals.droppedHeaderRows}</span>
                          </div>
                          {dq.deals.missingFields.map((f) => (
                            <div key={f.field} className="flex justify-between text-slate-600 dark:text-slate-400">
                              <span>Missing {f.field}:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{f.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Work Orders Board Audit */}
                      <div className="rounded-lg border border-slate-200/60 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100 mb-2">
                          <Database className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Work Orders Board (Operations)</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Rows:</span>
                            <span className="font-semibold">{dq.workOrders.totalRecords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Valid Execution Orders:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dq.workOrders.validRecords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Dropped Duplicate Headers:</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{dq.workOrders.droppedHeaderRows}</span>
                          </div>
                          {dq.workOrders.missingFields.map((f) => (
                            <div key={f.field} className="flex justify-between text-slate-600 dark:text-slate-400">
                              <span>Missing {f.field}:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{f.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Cleansing Actions & Notes */}
                    {dq.summaryNotes && dq.summaryNotes.length > 0 && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                        <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Automated Cleansing & Governance Actions Applied:</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-emerald-900/80 dark:text-emerald-200/80 list-disc pl-4">
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

          {/* Timestamp & Metadata Footer */}
          <div
            className={`mt-1.5 flex items-center gap-3 px-1 text-[11px] ${
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
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title="Copy response"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
