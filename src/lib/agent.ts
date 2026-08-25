import { z } from "zod";
import { fetchMondayBoard } from "./monday";
import {
  parseDeals,
  parseWorkOrders,
} from "./normalizer";
import {
  computePipelineMetrics,
  computeOperationalMetrics,
  getDealsClosingThisQuarter,
  getDelayedWorkOrders,
  getStalledDeals,
  mergeDataQuality,
} from "./analytics";
import { Deal, WorkOrder, DataQualityReport } from "./types";

export interface AgentContext {
  deals: Deal[];
  workOrders: WorkOrder[];
  dealsQuality: DataQualityReport;
  workOrdersQuality: DataQualityReport;
}

export async function fetchAgentContext(): Promise<AgentContext> {
  const dealsBoardId = process.env.MONDAY_BOARD_ID_DEALS!;
  const workOrdersBoardId = process.env.MONDAY_BOARD_ID_WORK_ORDERS!;

  const [dealsItems, workOrderItems] = await Promise.all([
    fetchMondayBoard(dealsBoardId),
    fetchMondayBoard(workOrdersBoardId),
  ]);

  const { deals, quality: dealsQuality } = parseDeals(dealsItems);
  const { workOrders, quality: workOrdersQuality } = parseWorkOrders(workOrderItems);

  return { deals, workOrders, dealsQuality, workOrdersQuality };
}

export function buildSystemPrompt(): string {
  return `You are Skylark BI Agent, an AI business analyst for a company. You have access to two datasets fetched from monday.com:

1. DEALS — the sales pipeline
2. WORK ORDERS — operational/project execution

When answering questions:
- Always provide a direct answer first, then key metrics, then insights, then risks, then data quality caveats.
- If data is missing or incomplete, call it out explicitly.
- If a question is ambiguous, state your assumptions clearly.
- Compare across sectors, stages, and time periods when relevant.
- For leadership updates, structure as: Sales Summary, Operations Summary, Risks, Recommended Actions.
- Never fabricate data. Only use what is provided.
- Format currency values in Indian Rupees (₹) with appropriate units (Cr for crores, L for lakhs).
- Current date: ${new Date().toISOString().split("T")[0]}`;
}

export function buildUserPrompt(
  question: string,
  ctx: AgentContext
): string {
  const pipelineMetrics = computePipelineMetrics(ctx.deals);
  const opsMetrics = computeOperationalMetrics(ctx.workOrders);
  const closingThisQuarter = getDealsClosingThisQuarter(ctx.deals);
  const delayedWOs = getDelayedWorkOrders(ctx.workOrders);
  const stalledDeals = getStalledDeals(ctx.deals);
  const dataQualitySummary = mergeDataQuality(ctx.dealsQuality, ctx.workOrdersQuality);

  const closingQuarterValue = closingThisQuarter.reduce(
    (sum, d) => sum + (d.value ?? 0),
    0
  );

  return `## Question
${question}

## Pipeline Summary
- Total active pipeline: ₹${formatCurrency(pipelineMetrics.totalValue)}
- Active deals: ${pipelineMetrics.dealsCount ?? pipelineMetrics.dealCount}
- Average deal size: ₹${formatCurrency(pipelineMetrics.avgDealSize)}
- Deals closing this quarter: ${closingThisQuarter.length} (₹${formatCurrency(closingQuarterValue)})
- Missing close dates: ${pipelineMetrics.missingCloseDates}
- Missing deal values: ${pipelineMetrics.missingValues}

## Pipeline by Stage
${Object.entries(pipelineMetrics.byStage)
  .map(([stage, data]) => `- ${stage}: ${data.count} deals, ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Pipeline by Sector
${Object.entries(pipelineMetrics.bySector)
  .map(([sector, data]) => `- ${sector}: ${data.count} deals, ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Operations Summary
- Total work orders: ${opsMetrics.totalWorkOrders}
- Active: ${opsMetrics.activeCount}
- Delayed: ${opsMetrics.delayedCount}
- Completed: ${opsMetrics.completedCount}
- Total value: ₹${formatCurrency(opsMetrics.totalValue)}

## Operations by Sector
${Object.entries(opsMetrics.bySector)
  .map(([sector, data]) => `- ${sector}: ${data.count} orders, ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Stalled Deals (>30 days old, not closed)
${stalledDeals.length > 0 ? stalledDeals.map((d) => `- ${d.name} (${d.sector}, ₹${formatCurrency(d.value ?? 0)}, stage: ${d.stage})`).join("\n") : "None"}

## Delayed Work Orders
${delayedWOs.length > 0 ? delayedWOs.map((w) => `- ${w.name} (${w.sector}, ${w.customer})`).join("\n") : "None"}

## Data Quality
${dataQualitySummary}`;
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}
