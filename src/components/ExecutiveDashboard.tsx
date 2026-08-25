"use client";

import React from "react";
import {
  DashboardData,
  ClientProfile,
  ProactiveQuestion,
} from "@/lib/types";
import {
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Receipt,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  ArrowUpRight,
  RotateCw,
  Layers,
  Radar,
} from "lucide-react";
import {
  PipelineFunnelChart,
  SectorComparisonChart,
  OperationsHealthDonut,
} from "./DashboardCharts";
import {
  SkylarkIntelligenceIcon,
  ExecutiveBriefingIcon,
} from "./icons/SkylarkIcons";

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
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400 mb-3" aria-hidden="true" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Unable to load dashboard metrics
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-md">
          Please check your Monday.com API key and board configurations in .env.local.
        </p>
        <button
          onClick={onRefresh}
          className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
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
  } = data;

  const totalUnbilled = Math.max(0, opsMetrics.totalValue - opsMetrics.totalInvoiced);
  const realizationRate =
    opsMetrics.totalValue > 0
      ? ((opsMetrics.totalInvoiced / opsMetrics.totalValue) * 100).toFixed(1)
      : "0";

  return (
    <div id="main-content" className="space-y-5 sm:space-y-6 pb-12">
      {/* Top Banner: Header & Live Data Status */}
      <section
        aria-label="Dashboard Overview Status"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-4 dark:border-slate-800"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
              Executive Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" aria-hidden="true" />
              Live Boards
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
            Real-time pipeline analytics, operational delivery health, and automated governance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
          {/* Health Score Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white px-3 py-1.5 text-xs shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Data Integrity:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {dataQuality.overallHealthScore}%
            </span>
          </div>

          <button
            onClick={() => onSelectQuery("Generate a comprehensive leadership update.")}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-600 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <ExecutiveBriefingIcon className="h-3.5 w-3.5 text-white" />
            <span>Executive Briefing</span>
          </button>
        </div>
      </section>

      {/* 1. Proactive Strategic Pulse & Anomaly Inquiries */}
      <section
        aria-labelledby="strategic-pulse-heading"
        className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-4 sm:p-5 shadow-xs dark:border-emerald-700/60 dark:bg-slate-900/60"
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs dark:bg-emerald-600">
              <SkylarkIntelligenceIcon className="h-4 w-4 text-white" />
            </div>
            <span
              id="strategic-pulse-heading"
              className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300"
            >
              Strategic Pulse
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 leading-snug">
            {insights.headline}
          </h2>

          {/* Key Takeaways */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
            {insights.takeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white/90 p-3 text-xs leading-relaxed text-slate-800 shadow-2xs dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200"
              >
                <div className="font-bold text-emerald-800 dark:text-emerald-400 text-xs mb-1">
                  Key Point #{idx + 1}
                </div>
                {takeaway}
              </div>
            ))}
          </div>
        </div>

        {/* Proactive Inquiries Grid */}
        <div className="mt-5 border-t border-slate-200/90 pt-4 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Radar className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
              <span>Proactive Anomaly Inquiries</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Tap any inquiry to investigate with AI
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {insights.proactiveQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelectQuery(q.query)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-300/80 bg-white p-3 text-left shadow-2xs transition-all hover:border-emerald-400 hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-600"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        q.category === "risk"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : q.category === "revenue"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {q.impactBadge}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-700 dark:text-slate-500 dark:group-hover:text-emerald-400" aria-hidden="true" />
                  </div>

                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {q.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
                    {q.anomaly}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  <span>Analyze</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Core 4 KPI Metric Cards */}
      <section
        aria-label="Key Performance Indicators"
        className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
      >
        {/* Metric 1: Pipeline Value */}
        <div
          onClick={() => onSelectQuery("How is our pipeline looking this quarter?")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectQuery("How is our pipeline looking this quarter?");
            }
          }}
          className="group cursor-pointer rounded-2xl border border-slate-300/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-all hover:border-emerald-400 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Active Pipeline
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(pipelineMetrics.totalValue)}
          </div>
          <div className="mt-2 flex flex-col xs:flex-row xs:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-0.5">
            <span>{pipelineMetrics.dealCount} active deals</span>
            <span className="text-emerald-800 dark:text-emerald-400 font-semibold group-hover:underline">
              Avg {formatCurrency(pipelineMetrics.avgDealSize)}
            </span>
          </div>
        </div>

        {/* Metric 2: PO Contract Value */}
        <div
          onClick={() => onSelectQuery("Break down work orders by execution status.")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectQuery("Break down work orders by execution status.");
            }
          }}
          className="group cursor-pointer rounded-2xl border border-slate-300/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-all hover:border-teal-400 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              PO Contracts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(opsMetrics.totalValue)}
          </div>
          <div className="mt-2 flex flex-col xs:flex-row xs:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-0.5">
            <span>{opsMetrics.totalWorkOrders} work orders</span>
            <span className="text-teal-700 dark:text-teal-400 font-semibold group-hover:underline">
              {opsMetrics.activeCount} active
            </span>
          </div>
        </div>

        {/* Metric 3: Invoiced & Cashflow */}
        <div
          onClick={() => onSelectQuery("Which projects have pending unbilled invoices?")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectQuery("Which projects have pending unbilled invoices?");
            }
          }}
          className="group cursor-pointer rounded-2xl border border-slate-300/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-all hover:border-blue-400 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Invoiced ({realizationRate}%)
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Receipt className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(opsMetrics.totalInvoiced)}
          </div>
          <div className="mt-2 flex flex-col xs:flex-row xs:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-0.5">
            <span>{formatCurrency(totalUnbilled)} unbilled</span>
            <span className="text-blue-700 dark:text-blue-400 font-semibold group-hover:underline">
              Audit cashflow
            </span>
          </div>
        </div>

        {/* Metric 4: At-Risk Accounts */}
        <div
          onClick={() => onSelectQuery("Show clients with high risk scores.")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectQuery("Show clients with high risk scores.");
            }
          }}
          className="group cursor-pointer rounded-2xl border border-slate-300/80 bg-white p-3.5 sm:p-4 shadow-2xs transition-all hover:border-rose-400 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-600"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              At-Risk Accounts
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
            {highRiskClients.length} Accounts
          </div>
          <div className="mt-2 flex flex-col xs:flex-row xs:items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-0.5">
            <span>{opsMetrics.onHoldCount} paused orders</span>
            <span className="text-rose-700 dark:text-rose-400 font-semibold group-hover:underline">
              Inspect risk
            </span>
          </div>
        </div>
      </section>

      {/* 3. Visual Charts Grid: 2-Column Responsive Layout */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left 2 Cols: Pipeline Stage Funnel & Sector Comparison */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chart 1: Pipeline Stage Funnel */}
          <div className="rounded-2xl border border-slate-300/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            <PipelineFunnelChart
              data={stageFunnel}
              onDrillDown={onSelectQuery}
            />
          </div>

          {/* Chart 2: Sector Intelligence Comparison */}
          <div className="rounded-2xl border border-slate-300/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            <SectorComparisonChart
              data={sectorComparisons}
              onDrillDown={onSelectQuery}
            />
          </div>
        </div>

        {/* Right 1 Col: Operations Health & Quick Action Playbooks */}
        <div className="space-y-5">
          {/* Operations Status Donut */}
          <div className="rounded-2xl border border-slate-300/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            <OperationsHealthDonut
              opsMetrics={opsMetrics}
              onDrillDown={onSelectQuery}
            />
          </div>

          {/* Quick Leadership Inquiries */}
          <div className="rounded-2xl border border-slate-300/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Leadership Playbooks
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
                  className="group flex w-full flex-col rounded-xl border border-slate-200/90 bg-slate-50/60 p-2.5 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50/40 focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-emerald-700/80 dark:hover:bg-emerald-950/20"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
                    <span>{item.label}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. High-Risk Accounts Watchlist (Responsive: Table on Desktop, Cards on Mobile) */}
      <section
        aria-labelledby="risk-watchlist-heading"
        className="rounded-2xl border border-slate-300/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <h3 id="risk-watchlist-heading" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                High-Risk Client Watchlist
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Accounts flagged for paused work orders, dead-deal churn, or uncollected balances
            </p>
          </div>

          <button
            onClick={() =>
              onSelectQuery(
                "Provide an in-depth risk analysis of our highest risk clients and recommend whether to renegotiate or discontinue."
              )
            }
            className="flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline self-start sm:self-auto focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <span>Run Churn Analysis</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {highRiskClients.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center text-xs text-slate-600 dark:text-slate-300">
            No critical client risks detected in the active portfolio.
          </div>
        ) : (
          <>
            {/* Mobile View (<640px): Clean Adaptive Cards */}
            <div className="sm:hidden space-y-3">
              {highRiskClients.slice(0, 5).map((client) => (
                <div
                  key={client.normalizedCode}
                  className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {client.clientCode}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {client.sectors.join(", ")}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                        client.riskScore >= 60
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      Risk {client.riskScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">Deals</span>
                      <span>{client.dealCount} total ({client.winRate.toFixed(0)}% win)</span>
                    </div>
                    <div>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block">Orders</span>
                      <span>
                        {client.workOrderCount}
                        {client.pausedWorkOrderCount > 0 && (
                          <span className="text-rose-700 dark:text-rose-400 font-semibold"> ({client.pausedWorkOrderCount} paused)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="text-xs text-slate-700 dark:text-slate-300">
                      PO: <strong>{formatCurrency(client.totalProjectValue)}</strong>
                    </div>
                    <button
                      onClick={() =>
                        onSelectQuery(
                          `Analyze client account ${client.clientCode} in detail, including deal history, paused work orders, and financial exposure.`
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-300/80 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet View (>=640px): Rich Accessible Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider dark:border-slate-800 dark:text-slate-300">
                    <th scope="col" className="py-2.5 px-3">Client Code</th>
                    <th scope="col" className="py-2.5 px-3">Risk Score</th>
                    <th scope="col" className="py-2.5 px-3">Deals (Won/Dead)</th>
                    <th scope="col" className="py-2.5 px-3">Work Orders</th>
                    <th scope="col" className="py-2.5 px-3">PO / Pipeline Value</th>
                    <th scope="col" className="py-2.5 px-3">Primary Risk Drivers</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Action</th>
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
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                          {client.sectors.join(", ")}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                            client.riskScore >= 60
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {client.riskScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {client.dealCount} total ({client.wonDealCount}W / {client.deadDealCount}D)
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {client.winRate.toFixed(0)}% Win Rate
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {client.workOrderCount} orders
                        {client.pausedWorkOrderCount > 0 && (
                          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                            {client.pausedWorkOrderCount} paused/struck
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div>PO: {formatCurrency(client.totalProjectValue)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Pipe: {formatCurrency(client.totalPipelineValue)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {client.riskReasons.join("; ")}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            onSelectQuery(
                              `Analyze client account ${client.clientCode} in detail, including deal history, paused work orders, and financial exposure.`
                            )
                          }
                          aria-label={`Inspect details for ${client.clientCode}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse" aria-label="Loading dashboard metrics...">
      {/* Top Banner Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200/90 pb-4 dark:border-slate-800">
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
