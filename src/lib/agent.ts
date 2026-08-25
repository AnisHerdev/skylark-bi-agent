import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchMondayBoard } from "./monday";
import { parseDeals, parseWorkOrders } from "./normalizer";
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
  const dealsBoardId = process.env.MONDAY_BOARD_ID_DEALS;
  const workOrdersBoardId = process.env.MONDAY_BOARD_ID_WORK_ORDERS;

  if (!dealsBoardId || !workOrdersBoardId) {
    throw new Error(
      "Missing Monday.com Board IDs. Please configure MONDAY_BOARD_ID_DEALS and MONDAY_BOARD_ID_WORK_ORDERS in .env.local"
    );
  }

  const [dealsItems, workOrderItems] = await Promise.all([
    fetchMondayBoard(dealsBoardId),
    fetchMondayBoard(workOrdersBoardId),
  ]);

  const { deals, quality: dealsQuality } = parseDeals(dealsItems);
  const { workOrders, quality: workOrdersQuality } = parseWorkOrders(workOrderItems);

  return { deals, workOrders, dealsQuality, workOrdersQuality };
}

export function buildSystemPrompt(): string {
  return `You are Skylark BI Agent, an expert conversational AI business analyst. You connect directly to live business operations data from monday.com:

1. DEALS — Sales pipeline, deal values, stages, probability, sales owners, and expected close dates.
2. WORK ORDERS — Project delivery, client work orders, start/end dates, delay statuses, and assigned teams.

When answering founder or executive questions, adhere strictly to these principles:
- **Direct Answer First**: Start immediately with a clear, concise answer to what was asked.
- **Key Metrics & Data**: Highlight specific metrics, currency values (in Indian Rupees ₹ Cr/Lakhs), counts, and stages.
- **Strategic Business Insights**: Explain what the data means (e.g., concentration risk, win-rate trends, delivery bottlenecks).
- **Data Quality & Caveats**: Always report missing dates, unpopulated deal values, or assumptions made during calculation.
- **Leadership Structure**: For leadership/executive summaries, structure as:
  1. Executive Summary
  2. Sales & Pipeline Performance
  3. Operations & Delivery Health
  4. Top Risks & Stalled Items
  5. Recommended Action Items
- **Truthful & Factual**: Never invent or hallucinate metrics. Rely strictly on the aggregated and granular data provided.
- Current Reference Date: ${new Date().toISOString().split("T")[0]}`;
}

export function buildUserPrompt(question: string, ctx: AgentContext): string {
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

  return `## Executive Question
${question}

## Pipeline Summary (Deals)
- Total Active Pipeline Value: ₹${formatCurrency(pipelineMetrics.totalValue)}
- Total Active Deals: ${pipelineMetrics.dealCount}
- Average Deal Size: ₹${formatCurrency(pipelineMetrics.avgDealSize)}
- Deals Expected to Close This Quarter: ${closingThisQuarter.length} (Total Value: ₹${formatCurrency(closingQuarterValue)})
- Records Missing Close Dates: ${pipelineMetrics.missingCloseDates}
- Records Missing Deal Values: ${pipelineMetrics.missingValues}

## Pipeline Breakdown by Stage
${Object.entries(pipelineMetrics.byStage)
  .map(([stage, data]) => `- ${stage.toUpperCase()}: ${data.count} deals, ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Pipeline Breakdown by Sector
${Object.entries(pipelineMetrics.bySector)
  .map(([sector, data]) => `- ${sector}: ${data.count} deals, ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Operational Execution Summary (Work Orders)
- Total Work Orders: ${opsMetrics.totalWorkOrders}
- Active / In-Progress: ${opsMetrics.activeCount}
- Delayed / Overdue: ${opsMetrics.delayedCount}
- Completed: ${opsMetrics.completedCount}
- Total Work Order Value: ₹${formatCurrency(opsMetrics.totalValue)}

## Operations Breakdown by Sector
${Object.entries(opsMetrics.bySector)
  .map(([sector, data]) => `- ${sector}: ${data.count} orders, ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Stalled Deals (>30 days old without progress)
${
  stalledDeals.length > 0
    ? stalledDeals
        .map(
          (d) =>
            `- ${d.name} | Client: ${d.client} | Sector: ${d.sector} | Value: ₹${formatCurrency(d.value ?? 0)} | Stage: ${d.stage} | Owner: ${d.salesOwner}`
        )
        .join("\n")
    : "None identified."
}

## Delayed Work Orders (At Risk)
${
  delayedWOs.length > 0
    ? delayedWOs
        .map(
          (w) =>
            `- ${w.name} | Customer: ${w.customer} | Sector: ${w.sector} | Team: ${w.assignedTeam} | Status: ${w.status}`
        )
        .join("\n")
    : "None identified."
}

## Data Cleaning & Quality Audit
${dataQualitySummary}
`;
}

export async function generateGeminiResponse(
  question: string,
  ctx: AgentContext
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Please add your Google AI Studio API key to .env.local"
    );
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2500,
    },
  });

  const prompt = buildUserPrompt(question, ctx);
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text() || "No response generated.";
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}
