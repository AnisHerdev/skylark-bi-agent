"use client";

import React from "react";
import {
  DashboardData,
  ClientProfile,
  ProactiveQuestion,
} from "@/lib/types";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Receipt,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Clock,
  Zap,
  ArrowUpRight,
  RotateCw,
  Layers,
} from "lucide-react";
import {
  PipelineFunnelChart,
  SectorComparisonChart,
  OperationsHealthDonut,
} from "./DashboardCharts";

interface ExecutiveDashboardProps {
  data: DashboardData | null;
  loading: boolean;
  onSelectQuery: (query: string) => void;
  onRefresh: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString()}`;
}

export function ExecutiveDashboard({
  data,
  loading,
  onSelectQuery,
  onRefresh,
}: ExecutiveDashboardProps) {
  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Unable to load dashboard metrics
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Please check your Monday.com API key and board configurations in .env.local.
        </p>
        <button
          onClick={onRefresh}
          className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
        >
          <RotateCw className="h-4 w-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const {
    pipelineMetrics,
    opsMetrics,
    highRiskClients,
    insights,
    stageFunnel,
    sectorComparisons,
    dataQuality,
    syncedAt,
  } = data;

  const totalUnbilled = Math.max(0, opsMetrics.totalValue - opsMetrics.totalInvoiced);
  const realizationRate =
    opsMetrics.totalValue > 0
      ? ((opsMetrics.totalInvoiced / opsMetrics.totalValue) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Founder Welcome & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
              Executive Command Center
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time pipeline visibility, delivery health, and AI strategic inquiry engine
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Health Score Pill */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">Data Health:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {dataQuality.overallHealthScore}%
            </span>
          </div>

          <button
            onClick={() => onSelectQuery("Generate a comprehensive leadership update.")}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Generate Executive Briefing</span>
          </button>
        </div>
      </div>

      {/* 1. Proactive AI Inquiries & Strategic Pulse Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-5 shadow-xs dark:border-emerald-800/50 dark:bg-slate-900/60">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: AI Synthesis & Takeaways */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                AI Strategic Pulse
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100 leading-snug">
              {insights.headline}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {insights.takeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/60 bg-white/80 p-2.5 text-xs leading-relaxed text-slate-700 shadow-2xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
                >
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] mb-1">
                    Takeaway #{idx + 1}
                  </div>
                  {takeaway}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Proactive Inquiry Questions Grid */}
        <div className="mt-5 border-t border-emerald-100 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Proactive Anomaly Inquiries (Click to investigate with AI)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Generated by Gemini 2.5 Flash from live metrics
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {insights.proactiveQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelectQuery(q.query)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3 text-left shadow-2xs transition-all hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        q.category === "risk"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : q.category === "revenue"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {q.impactBadge}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600 dark:text-slate-600 dark:group-hover:text-emerald-400" />
                  </div>

                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {q.title}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                    {q.anomaly}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Investigate</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Core 4 KPI Metric Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Pipeline Value */}
        <div
          onClick={() => onSelectQuery("How is our pipeline looking this quarter?")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Pipeline Value
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(pipelineMetrics.totalValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{pipelineMetrics.dealCount} active deals</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
              Avg {formatCurrency(pipelineMetrics.avgDealSize)} ↗
            </span>
          </div>
        </div>

        {/* Metric 2: PO Contract Value */}
        <div
          onClick={() => onSelectQuery("Break down work orders by execution status.")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-800/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PO Contract Value
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(opsMetrics.totalValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{opsMetrics.totalWorkOrders} work orders</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium group-hover:underline">
              {opsMetrics.activeCount} active ↗
            </span>
          </div>
        </div>

        {/* Metric 3: Invoiced & Cashflow */}
        <div
          onClick={() => onSelectQuery("Which projects have pending unbilled invoices?")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Invoiced ({realizationRate}%)
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(opsMetrics.totalInvoiced)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{formatCurrency(totalUnbilled)} unbilled</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
              Audit cashflow ↗
            </span>
          </div>
        </div>

        {/* Metric 4: High-Risk Accounts */}
        <div
          onClick={() => onSelectQuery("Show clients with high risk scores.")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-rose-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              At-Risk Accounts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {highRiskClients.length} Accounts
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{opsMetrics.onHoldCount} paused orders</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium group-hover:underline">
              Inspect risk ↗
            </span>
          </div>
        </div>
      </section>

      {/* 3. Visual Charts Grid: 2-Column Responsive Layout */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left 2 Cols: Pipeline Stage Funnel & Sector Comparison */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chart 1: Pipeline Stage Funnel */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <PipelineFunnelChart
              data={stageFunnel}
              onDrillDown={onSelectQuery}
            />
          </div>

          {/* Chart 2: Sector Intelligence Comparison */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <SectorComparisonChart
              data={sectorComparisons}
              onDrillDown={onSelectQuery}
            />
          </div>
        </div>

        {/* Right 1 Col: Operations Health & Quick Action Playbooks */}
        <div className="space-y-5">
          {/* Operations Status Donut */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <OperationsHealthDonut
              opsMetrics={opsMetrics}
              onDrillDown={onSelectQuery}
            />
          </div>

          {/* Quick Leadership Inquiries */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Founder Playbooks
              </h3>
            </div>

            <div className="space-y-1.5">
              {[
                {
                  label: "Closing Deals This Quarter",
                  query: "Show all deals expected to close this quarter with owner breakdown.",
                  desc: `${data.dealsClosingThisQuarter.length} deals in closing window`,
                },
                {
                  label: "Stalled Deals (>45d / Low Win)",
                  query: "Which deals are stalled or have low win probabilities?",
                  desc: `${data.stalledDeals.length} opportunities needing attention`,
                },
                {
                  label: "Unbilled Delivery Backlog",
                  query: "Which completed work orders have uncollected revenue?",
                  desc: `${formatCurrency(totalUnbilled)} pending invoicing`,
                },
                {
                  label: "Client Churn & Friction Audit",
                  query: "Which clients have dead deals or stalled projects?",
                  desc: "Cross-board client relationship risk",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onSelectQuery(item.query)}
                  className="group flex w-full flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-emerald-800/60 dark:hover:bg-emerald-950/20"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    <span>{item.label}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. High-Risk Accounts Watchlist */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                High-Risk Client Watchlist
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Accounts flagged for stalled work orders, high dead-deal churn, or unbilled balances
            </p>
          </div>

          <button
            onClick={() =>
              onSelectQuery(
                "Provide an in-depth risk analysis of our highest risk clients and recommend whether to renegotiate or discontinue."
              )
            }
            className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline self-start sm:self-auto"
          >
            <span>Run Full Churn Analysis</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {highRiskClients.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center text-xs text-slate-500">
            No critical client risks detected in the active portfolio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 px-3">Client Code</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Deals (Won/Dead)</th>
                  <th className="py-2.5 px-3">Work Orders</th>
                  <th className="py-2.5 px-3">PO / Pipeline Value</th>
                  <th className="py-2.5 px-3">Primary Risk Drivers</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {highRiskClients.slice(0, 5).map((client) => (
                  <tr
                    key={client.normalizedCode}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {client.clientCode}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {client.sectors.join(", ")}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                          client.riskScore >= 60
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        }`}
                      >
                        {client.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {client.dealCount} total ({client.wonDealCount}W / {client.deadDealCount}D)
                      <div className="text-[10px] text-slate-400">
                        {client.winRate.toFixed(0)}% Win Rate
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {client.workOrderCount} orders
                      {client.pausedWorkOrderCount > 0 && (
                        <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          {client.pausedWorkOrderCount} paused/struck
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div>PO: {formatCurrency(client.totalProjectValue)}</div>
                      <div className="text-[10px] text-slate-400">
                        Pipe: {formatCurrency(client.totalPipelineValue)}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {client.riskReasons.join("; ")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() =>
                          onSelectQuery(
                            `Analyze client account ${client.clientCode} in detail, including deal history, paused work orders, and financial exposure.`
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-72 rounded-md bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="h-8 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* AI Pulse Banner Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-slate-100/60 p-5 dark:border-slate-800 dark:bg-slate-900/40 space-y-4">
        <div className="h-4 w-32 rounded-md bg-emerald-200/60 dark:bg-emerald-900/40" />
        <div className="h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="h-20 rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-20 rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-20 rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-20 rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-72 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-72 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
        <div className="h-96 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>
    </div>
  );
}
