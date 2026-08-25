import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import isBetween from "dayjs/plugin/isBetween";
import {
  Deal,
  WorkOrder,
  PipelineMetrics,
  OperationalMetrics,
  ClientProfile,
  DataQualityReport,
  CombinedDataQuality,
} from "./types";

dayjs.extend(quarterOfYear);
dayjs.extend(isBetween);

export function computePipelineMetrics(deals: Deal[]): PipelineMetrics {
  const activeDeals = deals.filter((d) => d.stage !== "closed_lost");

  const totalValue = activeDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const dealsWithValues = activeDeals.filter((d) => d.value !== null && d.value > 0);
  const avgDealSize = dealsWithValues.length > 0 ? totalValue / dealsWithValues.length : 0;

  const byStage: Record<string, { count: number; value: number }> = {};
  const bySector: Record<string, { count: number; value: number }> = {};
  const byStatus: Record<string, number> = {};
  const byOwner: Record<string, { count: number; value: number }> = {};

  let missingCloseDates = 0;
  let missingValues = 0;

  for (const deal of deals) {
    // Stage breakdown
    const stage = deal.stage;
    if (!byStage[stage]) byStage[stage] = { count: 0, value: 0 };
    byStage[stage].count++;
    byStage[stage].value += deal.value ?? 0;

    // Sector breakdown
    const sector = deal.sector;
    if (!bySector[sector]) bySector[sector] = { count: 0, value: 0 };
    bySector[sector].count++;
    bySector[sector].value += deal.value ?? 0;

    // Status breakdown
    const status = deal.dealStatus || "Open";
    byStatus[status] = (byStatus[status] || 0) + 1;

    // Owner breakdown
    const owner = deal.ownerCode || "Unassigned";
    if (!byOwner[owner]) byOwner[owner] = { count: 0, value: 0 };
    byOwner[owner].count++;
    byOwner[owner].value += deal.value ?? 0;

    if (!deal.expectedCloseDate && deal.stage !== "closed_lost" && deal.stage !== "closed_won") {
      missingCloseDates++;
    }
    if (deal.value === null) {
      missingValues++;
    }
  }

  return {
    totalValue,
    dealCount: deals.length,
    avgDealSize,
    byStage,
    bySector,
    byStatus,
    byOwner,
    missingCloseDates,
    missingValues,
  };
}

export function computeOperationalMetrics(workOrders: WorkOrder[]): OperationalMetrics {
  const bySector: Record<string, { count: number; value: number }> = {};
  const byNatureOfWork: Record<string, number> = {};
  const byInvoiceStatus: Record<string, number> = {};

  let activeCount = 0;
  let delayedCount = 0;
  let completedCount = 0;
  let onHoldCount = 0;
  let totalValue = 0;
  let totalInvoiced = 0;

  for (const wo of workOrders) {
    if (wo.status === "in_progress") activeCount++;
    else if (wo.status === "delayed") delayedCount++;
    else if (wo.status === "completed") completedCount++;
    else if (wo.status === "on_hold") onHoldCount++;

    totalValue += wo.value ?? 0;
    totalInvoiced += wo.totalInvoiced ?? 0;

    // Sector breakdown
    const sector = wo.sector;
    if (!bySector[sector]) bySector[sector] = { count: 0, value: 0 };
    bySector[sector].count++;
    bySector[sector].value += wo.value ?? 0;

    // Nature of work
    const nature = wo.natureOfWork || "Project";
    byNatureOfWork[nature] = (byNatureOfWork[nature] || 0) + 1;

    // Invoice status
    const inv = wo.invoiceStatus || "Unknown";
    byInvoiceStatus[inv] = (byInvoiceStatus[inv] || 0) + 1;
  }

  return {
    totalWorkOrders: workOrders.length,
    activeCount,
    delayedCount,
    completedCount,
    onHoldCount,
    bySector,
    byNatureOfWork,
    byInvoiceStatus,
    totalValue,
    totalInvoiced,
  };
}

export function normalizeCompanyCode(code: string): string {
  if (!code) return "UNKNOWN";
  const clean = code.trim().toUpperCase();
  // Strip WOCOMPANY_ or COMPANY_ or COMPANY prefixes to get numeric ID (e.g. WOCOMPANY_001 -> COMPANY_001)
  const numMatch = clean.match(/(?:WOCOMPANY|COMPANY|WO_COMPANY|CUST)[_]?(\d+)/i);
  if (numMatch) {
    return `COMPANY_${numMatch[1].padStart(3, "0")}`;
  }
  return clean;
}

export function computeClientProfiles(deals: Deal[], workOrders: WorkOrder[]): ClientProfile[] {
  const clientMap: Record<
    string,
    {
      primaryCode: string;
      normalizedCode: string;
      deals: Deal[];
      workOrders: WorkOrder[];
    }
  > = {};

  // Group deals by normalized company code
  for (const deal of deals) {
    const rawCode = deal.clientCode || deal.name;
    const norm = normalizeCompanyCode(rawCode);
    if (!clientMap[norm]) {
      clientMap[norm] = {
        primaryCode: rawCode,
        normalizedCode: norm,
        deals: [],
        workOrders: [],
      };
    }
    clientMap[norm].deals.push(deal);
  }

  // Group work orders by normalized company code
  for (const wo of workOrders) {
    const rawCode = wo.customerCode || wo.name;
    const norm = normalizeCompanyCode(rawCode);
    if (!clientMap[norm]) {
      clientMap[norm] = {
        primaryCode: rawCode,
        normalizedCode: norm,
        deals: [],
        workOrders: [],
      };
    }
    clientMap[norm].workOrders.push(wo);
  }

  const profiles: ClientProfile[] = [];

  for (const [norm, group] of Object.entries(clientMap)) {
    const dList = group.deals;
    const wList = group.workOrders;

    const dealCount = dList.length;
    const wonDeals = dList.filter((d) => d.stage === "closed_won" || d.dealStatus?.toLowerCase() === "won");
    const deadDeals = dList.filter((d) => d.stage === "closed_lost" || d.dealStatus?.toLowerCase() === "dead");
    const openDeals = dList.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost");

    const wonDealCount = wonDeals.length;
    const deadDealCount = deadDeals.length;
    const openDealCount = openDeals.length;

    const totalPipelineValue = dList.reduce((sum, d) => sum + (d.value ?? 0), 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);

    const winRate = dealCount > 0 ? (wonDealCount / dealCount) * 100 : 0;
    const deadRate = dealCount > 0 ? (deadDealCount / dealCount) * 100 : 0;

    const workOrderCount = wList.length;
    const activeWorkOrderCount = wList.filter((w) => w.status === "in_progress").length;
    const pausedWorkOrderCount = wList.filter((w) => w.status === "on_hold").length;
    const completedWorkOrderCount = wList.filter((w) => w.status === "completed").length;

    const totalProjectValue = wList.reduce((sum, w) => sum + (w.value ?? 0), 0);
    const totalInvoicedValue = wList.reduce((sum, w) => sum + (w.totalInvoiced ?? 0), 0);

    const sectors = Array.from(new Set([...dList.map((d) => d.sector), ...wList.map((w) => w.sector)])).filter(
      (s) => s && s !== "others"
    );
    const owners = Array.from(new Set([...dList.map((d) => d.ownerCode), ...wList.map((w) => w.ownerCode)])).filter(
      (o) => o && o !== "UNASSIGNED"
    );

    // Calculate Multi-Factor Risk Score (0 - 100)
    let riskScore = 0;
    const riskReasons: string[] = [];

    // Factor 1: Stalled / Paused Work Orders ("Pause / struck")
    if (pausedWorkOrderCount > 0) {
      riskScore += 35 * Math.min(pausedWorkOrderCount, 2);
      riskReasons.push(`${pausedWorkOrderCount} work order(s) paused/struck in execution`);
    }

    // Factor 2: High Dead Deal Rate
    if (deadDealCount >= 2 && deadRate >= 60) {
      riskScore += 30;
      riskReasons.push(`High deal failure rate (${deadRate.toFixed(0)}% dead deals across ${dealCount} opportunities)`);
    } else if (deadDealCount >= 1 && winRate === 0 && dealCount >= 2) {
      riskScore += 20;
      riskReasons.push(`0% win rate with ${deadDealCount} dead deals`);
    }

    // Factor 3: Completed work with low/zero invoice realization
    if (completedWorkOrderCount > 0 && totalProjectValue > 0 && totalInvoicedValue < totalProjectValue * 0.4) {
      riskScore += 20;
      riskReasons.push(`Low invoice realization (₹${(totalProjectValue - totalInvoicedValue).toLocaleString()} unbilled/uncollected)`);
    }

    // Factor 4: High volume of open deals with zero closure date
    const openWithNoDate = openDeals.filter((d) => !d.expectedCloseDate).length;
    if (openWithNoDate >= 3) {
      riskScore += 15;
      riskReasons.push(`${openWithNoDate} open deals lacking close dates or milestones`);
    }

    profiles.push({
      clientCode: group.primaryCode,
      normalizedCode: norm,
      dealCount,
      openDealCount,
      wonDealCount,
      deadDealCount,
      totalPipelineValue,
      wonValue,
      winRate,
      deadRate,
      workOrderCount,
      activeWorkOrderCount,
      pausedWorkOrderCount,
      completedWorkOrderCount,
      totalProjectValue,
      totalInvoicedValue,
      sectors: sectors.length > 0 ? sectors : ["General"],
      owners: owners.length > 0 ? owners : ["Unassigned"],
      riskScore: Math.min(riskScore, 100),
      riskReasons,
    });
  }

  // Sort by riskScore descending
  return profiles.sort((a, b) => b.riskScore - a.riskScore);
}

export function getHighRiskClients(profiles: ClientProfile[]): ClientProfile[] {
  return profiles.filter((p) => p.riskScore >= 40 || p.pausedWorkOrderCount > 0);
}

export function getTopClientsByValue(profiles: ClientProfile[], limit: number = 5): ClientProfile[] {
  return [...profiles]
    .sort((a, b) => b.totalProjectValue + b.totalPipelineValue - (a.totalProjectValue + a.totalPipelineValue))
    .slice(0, limit);
}

export function getDealsClosingThisQuarter(deals: Deal[]): Deal[] {
  const now = dayjs();
  const startOfQ = now.startOf("quarter");
  const endOfQ = now.endOf("quarter");

  return deals.filter((deal) => {
    if (!deal.expectedCloseDate) return false;
    const close = dayjs(deal.expectedCloseDate);
    return close.isBetween(startOfQ, endOfQ, "day", "[]");
  });
}

export function getDelayedWorkOrders(workOrders: WorkOrder[]): WorkOrder[] {
  return workOrders.filter((w) => w.status === "delayed" || w.status === "on_hold");
}

export function getStalledDeals(deals: Deal[]): Deal[] {
  const now = dayjs();
  return deals.filter((deal) => {
    if (deal.stage === "closed_won" || deal.stage === "closed_lost") return false;
    if (deal.probability !== null && deal.probability <= 25 && (deal.value ?? 0) > 0) return true;
    if (!deal.createdAt) return false;
    const ageDays = now.diff(dayjs(deal.createdAt), "day");
    return ageDays > 45 && deal.stage === "lead";
  });
}

export function mergeDataQuality(dealsQ: DataQualityReport, woQ: DataQualityReport): string {
  const totalRecords = dealsQ.totalRecords + woQ.totalRecords;
  const validRecords = dealsQ.validRecords + woQ.validRecords;
  const droppedHeaders = dealsQ.droppedHeaderRows + woQ.droppedHeaderRows;
  const totalInvalidDates = dealsQ.invalidDates + woQ.invalidDates;
  const totalInvalidValues = dealsQ.invalidValues + woQ.invalidValues;

  const dealsMissing = dealsQ.missingFields.map((f) => `- Deals board: ${f.count} missing ${f.field}`).join("\n");
  const woMissing = woQ.missingFields.map((f) => `- Work Orders board: ${f.count} missing ${f.field}`).join("\n");

  return `### Live Data Quality Summary
- Total Dynamic Records Loaded: ${totalRecords} (${dealsQ.totalRecords} Deals, ${woQ.totalRecords} Work Orders)
- Valid Cleaned Entities: ${validRecords}
- Dropped Accidental Header/Metadata Rows: ${droppedHeaders}
- Invalid / Unparseable Dates Handled: ${totalInvalidDates}
- Invalid Numeric / Currency Values Handled: ${totalInvalidValues}

### Missing Fields:
${dealsMissing || "- None"}
${woMissing || "- None"}`;
}

export function buildCombinedDataQuality(
  dealsQ: DataQualityReport,
  woQ: DataQualityReport
): CombinedDataQuality {
  const totalRecords = dealsQ.totalRecords + woQ.totalRecords;
  const validRecords = dealsQ.validRecords + woQ.validRecords;
  const droppedHeaderRows = dealsQ.droppedHeaderRows + woQ.droppedHeaderRows;
  const invalidDates = dealsQ.invalidDates + woQ.invalidDates;
  const invalidValues = dealsQ.invalidValues + woQ.invalidValues;

  const dealsMissingCount = dealsQ.missingFields.reduce((sum, f) => sum + f.count, 0);
  const woMissingCount = woQ.missingFields.reduce((sum, f) => sum + f.count, 0);
  const totalMissing = dealsMissingCount + woMissingCount;

  // Calculate Health Score (100 base minus deductions for missing critical metrics)
  const validityRatio = totalRecords > 0 ? (validRecords / totalRecords) * 100 : 100;
  const missingPenalty = totalRecords > 0 ? Math.min(25, (totalMissing / (totalRecords * 2)) * 100) : 0;
  const overallHealthScore = Math.max(50, Math.min(100, Math.round(validityRatio - missingPenalty)));

  const summaryNotes: string[] = [];
  if (droppedHeaderRows > 0) {
    summaryNotes.push(`Filtered ${droppedHeaderRows} accidental duplicate header/metadata row(s) (e.g. rows 52 & 181).`);
  }
  const closeDateMissing = dealsQ.missingFields.find((f) => f.field === "Expected Close Date")?.count;
  if (closeDateMissing) {
    summaryNotes.push(`${closeDateMissing} deals lack expected close dates — excluded from quarter-specific forecasting.`);
  }
  const dealValMissing = dealsQ.missingFields.find((f) => f.field === "Deal Value")?.count;
  if (dealValMissing) {
    summaryNotes.push(`${dealValMissing} deals have unpopulated deal values.`);
  }
  const poValMissing = woQ.missingFields.find((f) => f.field === "PO Value")?.count;
  if (poValMissing) {
    summaryNotes.push(`${poValMissing} work orders have unpopulated PO values.`);
  }
  const normalizedSectorsCount = dealsQ.normalizedSectors.length + woQ.normalizedSectors.length;
  if (normalizedSectorsCount > 0) {
    summaryNotes.push(`Normalized ${normalizedSectorsCount} sector entries to standard taxonomy.`);
  }

  return {
    totalRecords,
    validRecords,
    droppedHeaderRows,
    invalidDates,
    invalidValues,
    overallHealthScore,
    deals: dealsQ,
    workOrders: woQ,
    summaryNotes,
  };
}

