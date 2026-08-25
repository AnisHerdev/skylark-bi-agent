import { NextResponse } from "next/server";
import { fetchAgentContext, generateDashboardInsights } from "@/lib/agent";
import {
  computePipelineMetrics,
  computeOperationalMetrics,
  computeSectorComparisons,
  computeStageFunnel,
  getHighRiskClients,
  getTopClientsByValue,
  getDealsClosingThisQuarter,
  getDelayedWorkOrders,
  getStalledDeals,
  buildCombinedDataQuality,
} from "@/lib/analytics";
import { DashboardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 100% Dynamic fetch from live Monday.com boards
    const ctx = await fetchAgentContext();

    const pipelineMetrics = computePipelineMetrics(ctx.deals);
    const opsMetrics = computeOperationalMetrics(ctx.workOrders);
    const highRiskClients = getHighRiskClients(ctx.clientProfiles);
    const topClients = getTopClientsByValue(ctx.clientProfiles, 5);
    const sectorComparisons = computeSectorComparisons(ctx.deals, ctx.workOrders);
    const stageFunnel = computeStageFunnel(ctx.deals);
    const dealsClosingThisQuarter = getDealsClosingThisQuarter(ctx.deals);
    const stalledDeals = getStalledDeals(ctx.deals);
    const delayedWorkOrders = getDelayedWorkOrders(ctx.workOrders);
    const dataQuality = buildCombinedDataQuality(
      ctx.dealsQuality,
      ctx.workOrdersQuality
    );

    // Dynamic AI Proactive Inquiries & Executive Takeaways via Gemini
    const insights = await generateDashboardInsights(ctx);

    const payload: DashboardData = {
      pipelineMetrics,
      opsMetrics,
      clientProfiles: ctx.clientProfiles,
      highRiskClients,
      topClients,
      sectorComparisons,
      stageFunnel,
      dealsClosingThisQuarter,
      stalledDeals,
      delayedWorkOrders,
      dataQuality,
      insights,
      syncedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Dashboard API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load dashboard data";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
