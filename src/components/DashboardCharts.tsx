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
  "#38bdf8", // Sky (Lead)
  "#818cf8", // Indigo (Qualification)
  "#f59e0b", // Amber (Proposal)
  "#10b981", // Emerald (Negotiation)
  "#059669", // Dark Emerald (Closed Won)
];

const OPS_STATUS_COLORS = {
  active: "#10b981", // Emerald
  completed: "#3b82f6", // Blue
  delayed: "#f59e0b", // Amber
  on_hold: "#f43f5e", // Rose
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Pipeline Stage Funnel
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Opportunity velocity & cumulative value across stages
          </p>
        </div>
        <button
          onClick={() =>
            onDrillDown(
              "Provide a detailed breakdown of all pipeline deals by stage with win probabilities."
            )
          }
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>Deep-dive</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={(val) => formatCurrencyShort(val)}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={130}
              stroke="#64748b"
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
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 text-xs space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                        <span>Total Value:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {p.formattedValue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
                        <span>Deal Count:</span>
                        <span>{p.count} deals ({share}% of pipeline)</span>
                      </div>
                      <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Click to inspect stage deals ↗
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
  const topSectors = data.slice(0, 6);

  const chartData = topSectors.map((s) => ({
    sector: s.sector,
    Pipeline: s.pipelineValue,
    "PO Value": s.poValue,
    dealCount: s.dealCount,
    workOrderCount: s.workOrderCount,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Sector Intelligence: Pipeline vs PO Execution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare active sales pipeline against operational PO delivery
          </p>
        </div>
        <button
          onClick={() =>
            onDrillDown(
              "Compare all sectors in terms of revenue, average deal size, and active work orders."
            )
          }
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>Compare All</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            <XAxis
              dataKey="sector"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tickFormatter={(val) => formatCurrencyShort(val)}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pipeVal = Number(payload.find((p) => p.dataKey === "Pipeline")?.value || 0);
                  const poVal = Number(payload.find((p) => p.dataKey === "PO Value")?.value || 0);
                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 text-xs space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {label} Sector
                      </div>
                      <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                        <span>Pipeline Opportunity:</span>
                        <span className="font-bold">{formatCurrencyShort(pipeVal)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-teal-600 dark:text-teal-400">
                        <span>PO Contract Delivery:</span>
                        <span className="font-bold">{formatCurrencyShort(poVal)}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400">
                        Click bar to analyze {label} sector ↗
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="Pipeline"
              fill="#10b981"
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
              fill="#14b8a6"
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

      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-xs bg-[#10b981]" />
          <span>Sales Pipeline Value</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-xs bg-[#14b8a6]" />
          <span>PO Delivery Value</span>
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
      name: "Active / Ongoing",
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
      name: "Paused / Struck",
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Execution & Delivery Health
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Work order execution status distribution
          </p>
        </div>
        <button
          onClick={() =>
            onDrillDown(
              "List all delayed or paused work orders with assigned teams, customer codes, and values."
            )
          }
          className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>Audit</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[190px]">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={52}
              outerRadius={78}
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
                    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-2.5 shadow-lg backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 text-xs space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        {p.value} work orders ({pct}%)
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
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {healthRate}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
            On Track
          </span>
        </div>
      </div>

      {/* Legend & Breakdown list */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {pieData.map((item) => (
          <button
            key={item.name}
            onClick={() =>
              onDrillDown(`Show all work orders with execution status '${item.name}'.`)
            }
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {item.name}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 ml-1">
              {item.value}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
