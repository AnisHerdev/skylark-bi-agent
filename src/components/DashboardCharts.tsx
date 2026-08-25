"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { StageFunnelItem, SectorComparison, OperationalMetrics } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";

interface PipelineFunnelChartProps {
  data: StageFunnelItem[];
  onDrillDown: (query: string) => void;
}

interface SectorComparisonChartProps {
  data: SectorComparison[];
  onDrillDown: (query: string) => void;
}

interface OpsHealthChartProps {
  opsMetrics: OperationalMetrics;
  onDrillDown: (query: string) => void;
}

function formatCurrencyShort(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value.toFixed(0)}`;
}

const STAGE_COLORS = [
  "#0284c7", // Sky 600 (Lead)
  "#6366f1", // Indigo 500 (Qualification)
  "#d97706", // Amber 600 (Proposal)
  "#059669", // Emerald 600 (Negotiation)
  "#047857", // Emerald 700 (Closed Won)
];

const OPS_STATUS_COLORS = {
  active: "#059669", // Emerald 600
  completed: "#2563eb", // Blue 600
  delayed: "#d97706", // Amber 600
  on_hold: "#e11d48", // Rose 600
};

export function PipelineFunnelChart({ data, onDrillDown }: PipelineFunnelChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    stage: item.stage,
    count: item.count,
    value: item.value,
    formattedValue: formatCurrencyShort(item.value),
  }));

  const totalPipelineValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Pipeline Stage Funnel
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Cumulative value & deal velocity across stages
          </p>
        </div>
        <button
          onClick={() =>
            onDrillDown(
              "Provide a detailed breakdown of all pipeline deals by stage with win probabilities."
            )
          }
          className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span>Deep-dive</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="h-60 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={(val) => formatCurrencyShort(val)}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  const share =
                    totalPipelineValue > 0
                      ? ((p.value / totalPipelineValue) * 100).toFixed(1)
                      : "0";
                  return (
                    <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-md backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/95 text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-700 dark:text-slate-300">
                        <span>Total Value:</span>
                        <span className="font-bold text-emerald-800 dark:text-emerald-400">
                          {p.formattedValue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-400">
                        <span>Deal Count:</span>
                        <span>{p.count} deals ({share}%)</span>
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold">
                        Tap to inspect stage deals ↗
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 8, 8, 0]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(entry: any) =>
                onDrillDown(
                  `Show all active deals in the '${entry?.name || entry?.payload?.name}' stage with values and owners.`
                )
              }
              cursor="pointer"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STAGE_COLORS[index % STAGE_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SectorComparisonChart({
  data,
  onDrillDown,
}: SectorComparisonChartProps) {
  const topSectors = data.slice(0, 5);

  const chartData = topSectors.map((s) => ({
    sector: s.sector,
    Pipeline: s.pipelineValue,
    "PO Value": s.poValue,
    dealCount: s.dealCount,
    workOrderCount: s.workOrderCount,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Sector Intelligence
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Pipeline opportunity vs PO Contract delivery
          </p>
        </div>
        <button
          onClick={() =>
            onDrillDown(
              "Compare all sectors in terms of revenue, average deal size, and active work orders."
            )
          }
          className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span>Compare</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="h-60 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
          >
            <XAxis
              dataKey="sector"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              tickFormatter={(val) => formatCurrencyShort(val)}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pipeVal = Number(payload.find((p) => p.dataKey === "Pipeline")?.value || 0);
                  const poVal = Number(payload.find((p) => p.dataKey === "PO Value")?.value || 0);
                  return (
                    <div className="rounded-xl border border-slate-300 bg-white/95 p-3 shadow-md backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/95 text-xs space-y-1">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {label} Sector
                      </div>
                      <div className="flex items-center justify-between gap-4 text-emerald-800 dark:text-emerald-400">
                        <span>Pipeline Opportunity:</span>
                        <span className="font-bold">{formatCurrencyShort(pipeVal)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-teal-700 dark:text-teal-400">
                        <span>PO Contract Delivery:</span>
                        <span className="font-bold">{formatCurrencyShort(poVal)}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Tap bar to analyze {label} ↗
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="Pipeline"
              fill="#059669"
              radius={[6, 6, 0, 0]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(entry: any) => {
                const sec = entry?.sector || entry?.payload?.sector || "";
                onDrillDown(`Deep dive into ${sec} sector sales pipeline and performance.`);
              }}
              cursor="pointer"
            />
            <Bar
              dataKey="PO Value"
              fill="#0d9488"
              radius={[6, 6, 0, 0]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(entry: any) => {
                const sec = entry?.sector || entry?.payload?.sector || "";
                onDrillDown(`Show all work orders and delivery execution for ${sec} sector.`);
              }}
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-1 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-xs bg-[#059669]" />
          <span>Sales Pipeline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-xs bg-[#0d9488]" />
          <span>PO Delivery</span>
        </div>
      </div>
    </div>
  );
}

export function OperationsHealthDonut({
  opsMetrics,
  onDrillDown,
}: OpsHealthChartProps) {
  const pieData = [
    {
      name: "Active",
      value: opsMetrics.activeCount,
      color: OPS_STATUS_COLORS.active,
      key: "in_progress",
    },
    {
      name: "Completed",
      value: opsMetrics.completedCount,
      color: OPS_STATUS_COLORS.completed,
      key: "completed",
    },
    {
      name: "Delayed",
      value: opsMetrics.delayedCount,
      color: OPS_STATUS_COLORS.delayed,
      key: "delayed",
    },
    {
      name: "Paused",
      value: opsMetrics.onHoldCount,
      color: OPS_STATUS_COLORS.on_hold,
      key: "on_hold",
    },
  ].filter((d) => d.value > 0);

  const total = opsMetrics.totalWorkOrders;
  const criticalCount = opsMetrics.delayedCount + opsMetrics.onHoldCount;
  const healthRate = total > 0 ? (((total - criticalCount) / total) * 100).toFixed(0) : "100";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Execution Health
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Work order status distribution
          </p>
        </div>
        <button
          onClick={() =>
            onDrillDown(
              "List all delayed or paused work orders with assigned teams, customer codes, and values."
            )
          }
          className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span>Audit</span>
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[170px]">
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={48}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(entry: any) =>
                onDrillDown(
                  `Show all work orders with execution status '${entry?.name || entry?.payload?.name}'.`
                )
              }
              cursor="pointer"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : "0";
                  return (
                    <div className="rounded-xl border border-slate-300 bg-white/95 p-2.5 shadow-md backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/95 text-xs space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        {p.value} orders ({pct}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Score Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {healthRate}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">
            On Track
          </span>
        </div>
      </div>

      {/* Legend & Breakdown list */}
      <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        {pieData.map((item) => (
          <button
            key={item.name}
            onClick={() =>
              onDrillDown(`Show all work orders with execution status '${item.name}'.`)
            }
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 ml-1">
              {item.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
