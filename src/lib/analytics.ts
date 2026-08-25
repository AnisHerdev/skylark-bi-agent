import dayjs from "dayjs";
import {
  Deal,
  WorkOrder,
  PipelineMetrics,
  OperationalMetrics,
  DataQualityReport,
} from "./types";

export function computePipelineMetrics(deals: Deal[]): PipelineMetrics {
  const activeDeals = deals.filter(
    (d) => d.stage !== "closed_won" && d.stage !== "closed_lost"
  );

  const totalValue = activeDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const dealCount = activeDeals.length;
  const avgDealSize = dealCount > 0 ? totalValue / dealCount : 0;

  const byStage: Record<string, { count: number; value: number }> = {};
  const bySector: Record<string, { count: number; value: number }> = {};

  let missingCloseDates = 0;
  let missingValues = 0;

  for (const deal of activeDeals) {
    if (!byStage[deal.stage]) byStage[deal.stage] = { count: 0, value: 0 };
    byStage[deal.stage].count++;
    byStage[deal.stage].value += deal.value ?? 0;

    if (!bySector[deal.sector]) bySector[deal.sector] = { count: 0, value: 0 };
    bySector[deal.sector].count++;
    bySector[deal.sector].value += deal.value ?? 0;

    if (!deal.expectedCloseDate) missingCloseDates++;
    if (deal.value === null) missingValues++;
  }

  return {
    totalValue,
    dealCount,
    avgDealSize,
    byStage,
    bySector,
    missingCloseDates,
    missingValues,
  };
}

export function computeOperationalMetrics(
  workOrders: WorkOrder[]
): OperationalMetrics {
  const totalValue = workOrders.reduce((sum, w) => sum + (w.value ?? 0), 0);
  const activeCount = workOrders.filter(
    (w) => w.status === "in_progress" || w.status === "not_started"
  ).length;
  const delayedCount = workOrders.filter((w) => w.status === "delayed").length;
  const completedCount = workOrders.filter(
    (w) => w.status === "completed"
  ).length;

  const bySector: Record<string, { count: number; value: number }> = {};
  for (const wo of workOrders) {
    if (!bySector[wo.sector]) bySector[wo.sector] = { count: 0, value: 0 };
    bySector[wo.sector].count++;
    bySector[wo.sector].value += wo.value ?? 0;
  }

  return {
    totalWorkOrders: workOrders.length,
    activeCount,
    delayedCount,
    completedCount,
    bySector,
    totalValue,
  };
}

export function getDealsClosingThisQuarter(deals: Deal[]): Deal[] {
  const now = dayjs();
  const quarterStart = now.startOf("quarter");
  const quarterEnd = now.endOf("quarter");

  return deals.filter((d) => {
    if (!d.expectedCloseDate) return false;
    const close = dayjs(d.expectedCloseDate);
    return (
      close.isAfter(quarterStart.subtract(1, "day")) &&
      close.isBefore(quarterEnd.add(1, "day")) &&
      d.stage !== "closed_won" &&
      d.stage !== "closed_lost"
    );
  });
}

export function getDelayedWorkOrders(workOrders: WorkOrder[]): WorkOrder[] {
  return workOrders.filter((w) => w.status === "delayed");
}

export function getStalledDeals(deals: Deal[], daysThreshold = 30): Deal[] {
  const cutoff = dayjs().subtract(daysThreshold, "day");
  return deals.filter((d) => {
    if (!d.createdAt) return false;
    const created = dayjs(d.createdAt);
    return (
      created.isBefore(cutoff) &&
      d.stage !== "closed_won" &&
      d.stage !== "closed_lost"
    );
  });
}

export function mergeDataQuality(
  dealsQuality: DataQualityReport,
  workOrdersQuality: DataQualityReport
): string {
  const lines: string[] = [];

  lines.push(`Deals: ${dealsQuality.totalRecords} records loaded`);
  for (const mf of dealsQuality.missingFields) {
    lines.push(`  ⚠ ${mf.count} missing ${mf.field}`);
  }
  if (dealsQuality.invalidDates > 0) {
    lines.push(`  ⚠ ${dealsQuality.invalidDates} unparseable dates`);
  }
  if (dealsQuality.normalizedSectors.length > 0) {
    lines.push(
      `  ℹ ${dealsQuality.normalizedSectors.length} sector names normalized`
    );
  }

  lines.push(`Work Orders: ${workOrdersQuality.totalRecords} records loaded`);
  for (const mf of workOrdersQuality.missingFields) {
    lines.push(`  ⚠ ${mf.count} missing ${mf.field}`);
  }
  if (workOrdersQuality.invalidDates > 0) {
    lines.push(`  ⚠ ${workOrdersQuality.invalidDates} unparseable dates`);
  }

  return lines.join("\n");
}
