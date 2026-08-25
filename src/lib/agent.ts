import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchMondayBoard } from "./monday";
import { parseDeals, parseWorkOrders } from "./normalizer";
import {
  computePipelineMetrics,
  computeOperationalMetrics,
  computeClientProfiles,
  getHighRiskClients,
  getTopClientsByValue,
  getDealsClosingThisQuarter,
  getDelayedWorkOrders,
  getStalledDeals,
  mergeDataQuality,
} from "./analytics";
import { Deal, WorkOrder, DataQualityReport, ClientProfile } from "./types";

export interface AgentContext {
  deals: Deal[];
  workOrders: WorkOrder[];
  dealsQuality: DataQualityReport;
  workOrdersQuality: DataQualityReport;
  clientProfiles: ClientProfile[];
}

export interface GeneratedResult {
  answer: string;
  suggestions: string[];
}

export async function fetchAgentContext(): Promise<AgentContext> {
  const dealsBoardId = process.env.MONDAY_BOARD_ID_DEALS;
  const workOrdersBoardId = process.env.MONDAY_BOARD_ID_WORK_ORDERS;

  if (!dealsBoardId || !workOrdersBoardId) {
    throw new Error(
      "Missing Monday.com Board IDs. Please configure MONDAY_BOARD_ID_DEALS and MONDAY_BOARD_ID_WORK_ORDERS in .env.local"
    );
  }

  // 100% Dynamic fetch from live Monday.com GraphQL endpoint
  const [dealsItems, workOrderItems] = await Promise.all([
    fetchMondayBoard(dealsBoardId),
    fetchMondayBoard(workOrdersBoardId),
  ]);

  const { deals, quality: dealsQuality } = parseDeals(dealsItems);
  const { workOrders, quality: workOrdersQuality } = parseWorkOrders(workOrderItems);

  const clientProfiles = computeClientProfiles(deals, workOrders);

  return { deals, workOrders, dealsQuality, workOrdersQuality, clientProfiles };
}

export function buildSystemPrompt(): string {
  return `You are Skylark BI Agent, an elite AI conversational Business Intelligence Analyst for founders and executives. You have real-time live access to the company's monday.com boards:

1. **DEALS (Sales Pipeline)**: Deal name, Client Code (COMPANY###), Owner Code (OWNER_###), Deal Stage, Deal Status (Open, Won, Dead, On Hold), Closure Probability, Masked Deal Value, Expected Close Date, and Sector.
2. **WORK ORDERS (Project & Operational Delivery)**: Deal name masked, Customer Code (WOCOMPANY_###), Execution Status (Completed, Ongoing, Pause / struck, Not Started), PO Value (Excl GST), Total Invoiced, Invoice Status, Nature of Work, and Assigned Team.

### Analytical Guidelines:
- **Direct Business Answer First**: Begin immediately with a concise, definitive answer.
- **Client Discontinuation / Risk Advice**:
  - When asked who the company should stop working with or which clients are risky, explicitly name the specific Client Codes (e.g. COMPANY_001, WOCOMPANY_002).
  - Ground your advice in hard cross-board metrics: Dead deal churn rate, stalled/paused execution ('Pause / struck' work orders), zero win conversion, or severe unbilled/uncollected revenue balances.
- **Financial Precision**: Format currency values in Indian Rupees (₹ Cr, ₹ Lakhs, or ₹K) with exact calculations.
- **Sectors & Operations**: Detail key sectors (Mining, Powerline, Renewables, Railways, DSP, Pure Service) and highlight operational execution bottlenecks vs sales momentum.
- **Structure for Executive Queries**:
  1. **Direct Answer & Verdict**
  2. **Key Financial & Operational Metrics**
  3. **Strategic Business Insights & Risk Analysis**
  4. **Data Quality & Governance Caveats**
- **Zero-Typing Drill-Downs**: At the very end of your response, ALWAYS append exactly 3 short, high-value follow-up questions under the heading:
### Next Drill-Downs
- [Question 1]
- [Question 2]
- [Question 3]

- Current Reference Date: ${new Date().toISOString().split("T")[0]}`;
}

export function buildUserPrompt(question: string, ctx: AgentContext): string {
  const pipelineMetrics = computePipelineMetrics(ctx.deals);
  const opsMetrics = computeOperationalMetrics(ctx.workOrders);
  const closingThisQuarter = getDealsClosingThisQuarter(ctx.deals);
  const delayedWOs = getDelayedWorkOrders(ctx.workOrders);
  const stalledDeals = getStalledDeals(ctx.deals);
  const highRiskClients = getHighRiskClients(ctx.clientProfiles);
  const topClients = getTopClientsByValue(ctx.clientProfiles, 5);
  const dataQualitySummary = mergeDataQuality(ctx.dealsQuality, ctx.workOrdersQuality);

  const closingQuarterValue = closingThisQuarter.reduce(
    (sum, d) => sum + (d.value ?? 0),
    0
  );

  return `## Founder Question
${question}

## Pipeline Summary (Deals Board)
- Total Active Pipeline Value: ₹${formatCurrency(pipelineMetrics.totalValue)}
- Total Deals Tracked: ${pipelineMetrics.dealCount}
- Average Deal Size: ₹${formatCurrency(pipelineMetrics.avgDealSize)}
- Deals Expected to Close This Quarter: ${closingThisQuarter.length} (₹${formatCurrency(closingQuarterValue)})
- Status Breakdown: ${Object.entries(pipelineMetrics.byStatus).map(([s, c]) => `${s}: ${c}`).join(", ")}
- Missing Close Dates: ${pipelineMetrics.missingCloseDates}
- Missing Deal Values: ${pipelineMetrics.missingValues}

## Pipeline by Stage
${Object.entries(pipelineMetrics.byStage)
  .map(([stage, data]) => `- ${stage.toUpperCase()}: ${data.count} deals | ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Pipeline by Sector
${Object.entries(pipelineMetrics.bySector)
  .map(([sector, data]) => `- ${sector}: ${data.count} deals | ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Pipeline by Sales Owner
${Object.entries(pipelineMetrics.byOwner)
  .map(([owner, data]) => `- ${owner}: ${data.count} deals | ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Operational Execution Summary (Work Orders Board)
- Total Work Orders: ${opsMetrics.totalWorkOrders}
- Active / Ongoing: ${opsMetrics.activeCount}
- Completed: ${opsMetrics.completedCount}
- Paused / Struck ('Pause / struck'): ${opsMetrics.onHoldCount}
- Delayed: ${opsMetrics.delayedCount}
- Total PO Contract Value: ₹${formatCurrency(opsMetrics.totalValue)}
- Total Invoiced Amount: ₹${formatCurrency(opsMetrics.totalInvoiced)}

## Operations by Sector
${Object.entries(opsMetrics.bySector)
  .map(([sector, data]) => `- ${sector}: ${data.count} orders | PO Value: ₹${formatCurrency(data.value)}`)
  .join("\n")}

## Operations by Nature of Work
${Object.entries(opsMetrics.byNatureOfWork)
  .map(([nature, count]) => `- ${nature}: ${count} orders`)
  .join("\n")}

## Operations by Invoice Status
${Object.entries(opsMetrics.byInvoiceStatus)
  .map(([status, count]) => `- ${status}: ${count} orders`)
  .join("\n")}

## Client Intelligence: High-Risk Clients (Candidates to Discontinue or Renegotiate)
${
  highRiskClients.length > 0
    ? highRiskClients
        .slice(0, 10)
        .map(
          (c) =>
            `- **${c.clientCode}** (${c.sectors.join(", ")} | Owner: ${c.owners.join(", ")}) — Risk Score: ${c.riskScore}/100
  * Deals: ${c.dealCount} total (${c.wonDealCount} Won, ${c.deadDealCount} Dead, ${c.openDealCount} Open | Win Rate: ${c.winRate.toFixed(0)}%, Dead Rate: ${c.deadRate.toFixed(0)}%)
  * Work Orders: ${c.workOrderCount} total (${c.activeWorkOrderCount} Active, ${c.pausedWorkOrderCount} Paused/Struck, ${c.completedWorkOrderCount} Completed)
  * Financials: Pipeline ₹${formatCurrency(c.totalPipelineValue)} | PO Value ₹${formatCurrency(c.totalProjectValue)} | Invoiced ₹${formatCurrency(c.totalInvoicedValue)}
  * Risk Flags: ${c.riskReasons.join("; ")}`
        )
        .join("\n\n")
    : "No high-risk clients identified."
}

## Client Intelligence: Top Value Clients
${topClients
  .map(
    (c) =>
      `- **${c.clientCode}** (${c.sectors.join(", ")}) — Total Value: ₹${formatCurrency(c.totalProjectValue + c.totalPipelineValue)} (PO Value: ₹${formatCurrency(c.totalProjectValue)}, Pipeline: ₹${formatCurrency(c.totalPipelineValue)}, Won Deals: ${c.wonDealCount})`
  )
  .join("\n")}

## Stalled Deals & Delayed Work Orders
- Stalled Deals (>30d or low probability): ${
    stalledDeals.length > 0
      ? stalledDeals
          .slice(0, 8)
          .map((d) => `${d.name} (${d.clientCode}, ${d.sector}, ₹${formatCurrency(d.value ?? 0)}, Stage: ${d.stage})`)
          .join("; ")
      : "None"
  }
- Paused / Struck Work Orders: ${
    delayedWOs.length > 0
      ? delayedWOs
          .slice(0, 8)
          .map((w) => `${w.name} (${w.customerCode}, ${w.sector}, Status: ${w.status}, Value: ₹${formatCurrency(w.value ?? 0)})`)
          .join("; ")
      : "None"
  }

## Data Quality & Cleansing Report
${dataQualitySummary}
`;
}

export async function generateGeminiResponse(
  question: string,
  ctx: AgentContext
): Promise<GeneratedResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Please add your Google AI Studio API key to .env.local"
    );
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 3000,
    },
  });

  const prompt = buildUserPrompt(question, ctx);
  const result = await model.generateContent(prompt);
  const rawText = result.response.text() || "No response generated.";

  // Extract suggestions block and strip from rawText
  const suggestionsMatch = rawText.match(
    /(?:###|##)\s*(?:Next Drill-Downs|Suggested Next Questions|Suggested Follow-Ups)[\s\S]*$/i
  );

  let answer = rawText;
  let suggestions: string[] = [];

  if (suggestionsMatch) {
    const block = suggestionsMatch[0];
    answer = rawText.replace(block, "").trim();

    // Extract bullet points
    const lines = block.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*[-*•]\s*(?:\[\s*)?([^\]\n]+)(?:\])?/);
      if (match && match[1]) {
        const clean = match[1].trim();
        if (clean && !clean.toLowerCase().includes("drill-down") && suggestions.length < 3) {
          suggestions.push(clean);
        }
      }
    }
  }

  // Fallbacks if LLM didn't format bullet points
  if (suggestions.length === 0) {
    suggestions = [
      "Which clients have the highest unbilled work orders?",
      "Compare sales pipeline vs operational delivery.",
      "Show all paused or delayed projects.",
    ];
  }

  return { answer, suggestions };
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
}
