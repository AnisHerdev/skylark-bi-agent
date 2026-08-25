import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { Deal, WorkOrder, MondayItem, DataQualityReport } from "./types";

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

const DATE_FORMATS = [
  "YYYY-MM-DD",
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "DD-MM-YYYY",
  "MM-DD-YYYY",
  "DD MMM YYYY",
  "MMM DD, YYYY",
  "DD MMMM YYYY",
  "YYYY/MM/DD",
  "DD.MM.YYYY",
];

const SECTOR_ALIASES: Record<string, string> = {
  energy: "energy",
  "energy sector": "energy",
  "energy industry": "energy",
  energysector: "energy",
  manufacturing: "manufacturing",
  mfg: "manufacturing",
  "mfg sector": "manufacturing",
  manufacturingsector: "manufacturing",
  technology: "technology",
  tech: "technology",
  "tech sector": "technology",
  infrastructure: "infrastructure",
  infra: "infrastructure",
  "infra sector": "infrastructure",
  healthcare: "healthcare",
  "health care": "healthcare",
  finance: "finance",
  financial: "finance",
  banking: "finance",
  "real estate": "real_estate",
  realestate: "real_estate",
  retail: "retail",
  "retail sector": "retail",
  telecom: "telecom",
  telecommunications: "telecom",
};

const STAGE_MAP: Record<string, Deal["stage"]> = {
  lead: "lead",
  leads: "lead",
  qualification: "qualification",
  qualified: "qualification",
  proposal: "proposal",
  proposals: "proposal",
  "proposal sent": "proposal",
  negotiation: "negotiation",
  negotiating: "negotiation",
  "in negotiation": "negotiation",
  "closed won": "closed_won",
  won: "closed_won",
  closed: "closed_won",
  "closed lost": "closed_lost",
  lost: "closed_lost",
};

const STATUS_MAP: Record<string, WorkOrder["status"]> = {
  not_started: "not_started",
  "not started": "not_started",
  pending: "not_started",
  new: "not_started",
  in_progress: "in_progress",
  "in progress": "in_progress",
  active: "in_progress",
  ongoing: "in_progress",
  delayed: "delayed",
  overdue: "delayed",
  behind: "delayed",
  completed: "completed",
  done: "completed",
  finished: "completed",
  "closed": "completed",
  on_hold: "on_hold",
  "on hold": "on_hold",
  paused: "on_hold",
  hold: "on_hold",
};

export function parseDate(value: string | null | undefined): Date | null {
  if (!value || value.trim() === "") return null;

  const cleaned = value.trim();

  const iso = dayjs(cleaned, "YYYY-MM-DD", true);
  if (iso.isValid()) return iso.toDate();

  for (const fmt of DATE_FORMATS) {
    const parsed = dayjs(cleaned, fmt, true);
    if (parsed.isValid()) return parsed.toDate();
  }

  const generic = dayjs(cleaned);
  if (generic.isValid() && generic.year() > 1900 && generic.year() < 2100) {
    return generic.toDate();
  }

  return null;
}

export function normalizeSector(value: string | null | undefined): string {
  if (!value || value.trim() === "") return "unknown";
  const cleaned = value.trim().toLowerCase();
  return SECTOR_ALIASES[cleaned] || cleaned;
}

export function normalizeStage(value: string | null | undefined): Deal["stage"] {
  if (!value || value.trim() === "") return "lead";
  const cleaned = value.trim().toLowerCase();
  return STAGE_MAP[cleaned] || "lead";
}

export function normalizeStatus(value: string | null | undefined): WorkOrder["status"] {
  if (!value || value.trim() === "") return "not_started";
  const cleaned = value.trim().toLowerCase();
  return STATUS_MAP[cleaned] || "not_started";
}

export function parseNumber(value: string | null | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const cleaned = value.replace(/[₹$,€£\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function getColumnValue(
  item: MondayItem,
  titleMatch: string
): string | null {
  const col = item.column_values.find(
    (c) => c.column.title.toLowerCase() === titleMatch.toLowerCase()
  );
  return col?.text?.trim() || null;
}

export function parseDeals(items: MondayItem[]): {
  deals: Deal[];
  quality: DataQualityReport;
} {
  const deals: Deal[] = [];
  const missingFields: Record<string, number> = {};
  const normalizedSectors: { original: string; normalized: string }[] = [];
  let invalidDates = 0;
  let invalidValues = 0;

  for (const item of items) {
    const rawSector = getColumnValue(item, "Sector") ?? getColumnValue(item, "Industry");
    const sector = normalizeSector(rawSector);
    if (rawSector && rawSector.trim().toLowerCase() !== sector) {
      normalizedSectors.push({ original: rawSector, normalized: sector });
    }

    const rawValue = getColumnValue(item, "Deal Value") ?? getColumnValue(item, "Value");
    const value = parseNumber(rawValue);
    if (rawValue && value === null) invalidValues++;
    if (!rawValue || rawValue.trim() === "") {
      missingFields["Deal Value"] = (missingFields["Deal Value"] || 0) + 1;
    }

    const rawCloseDate =
      getColumnValue(item, "Expected Close Date") ??
      getColumnValue(item, "Close Date") ??
      getColumnValue(item, "Closing Date");
    const expectedCloseDate = parseDate(rawCloseDate);
    if (rawCloseDate && expectedCloseDate === null) invalidDates++;
    if (!rawCloseDate || rawCloseDate.trim() === "") {
      missingFields["Expected Close Date"] =
        (missingFields["Expected Close Date"] || 0) + 1;
    }

    const rawStage = getColumnValue(item, "Stage") ?? getColumnValue(item, "Pipeline Stage");
    const stage = normalizeStage(rawStage);

    const rawProb = getColumnValue(item, "Probability");
    const probability = parseNumber(rawProb);

    deals.push({
      id: item.id,
      name: item.name,
      client: getColumnValue(item, "Client") ?? getColumnValue(item, "Customer") ?? "Unknown",
      sector,
      value,
      stage,
      expectedCloseDate,
      probability,
      salesOwner: getColumnValue(item, "Sales Owner") ?? getColumnValue(item, "Owner") ?? "Unassigned",
      status: getColumnValue(item, "Status") ?? "Active",
      createdAt: parseDate(item.created_at),
      rawData: Object.fromEntries(
        item.column_values.map((c) => [c.column.title, c.text])
      ),
    });
  }

  return {
    deals,
    quality: {
      totalRecords: items.length,
      missingFields: Object.entries(missingFields).map(([field, count]) => ({
        field,
        count,
      })),
      normalizedSectors,
      invalidDates,
      invalidValues,
    },
  };
}

export function parseWorkOrders(items: MondayItem[]): {
  workOrders: WorkOrder[];
  quality: DataQualityReport;
} {
  const workOrders: WorkOrder[] = [];
  const missingFields: Record<string, number> = {};
  const normalizedSectors: { original: string; normalized: string }[] = [];
  let invalidDates = 0;
  let invalidValues = 0;

  for (const item of items) {
    const rawSector = getColumnValue(item, "Sector") ?? getColumnValue(item, "Industry");
    const sector = normalizeSector(rawSector);
    if (rawSector && rawSector.trim().toLowerCase() !== sector) {
      normalizedSectors.push({ original: rawSector, normalized: sector });
    }

    const rawValue = getColumnValue(item, "Project Value") ?? getColumnValue(item, "Value");
    const value = parseNumber(rawValue);
    if (rawValue && value === null) invalidValues++;
    if (!rawValue || rawValue.trim() === "") {
      missingFields["Value"] = (missingFields["Value"] || 0) + 1;
    }

    const rawStatus = getColumnValue(item, "Status");
    const status = normalizeStatus(rawStatus);

    const rawStart = getColumnValue(item, "Start Date");
    const startDate = parseDate(rawStart);
    if (rawStart && startDate === null) invalidDates++;

    const rawEnd = getColumnValue(item, "End Date") ?? getColumnValue(item, "Completion Date");
    const endDate = parseDate(rawEnd);
    if (rawEnd && endDate === null) invalidDates++;

    const rawCompletion = getColumnValue(item, "Completion") ?? getColumnValue(item, "% Complete");
    const completionPercent = parseNumber(rawCompletion);

    workOrders.push({
      id: item.id,
      name: item.name,
      customer: getColumnValue(item, "Customer") ?? getColumnValue(item, "Client") ?? "Unknown",
      sector,
      value,
      status,
      startDate,
      endDate,
      completionPercent,
      assignedTeam: getColumnValue(item, "Assigned Team") ?? getColumnValue(item, "Team") ?? "Unassigned",
      rawData: Object.fromEntries(
        item.column_values.map((c) => [c.column.title, c.text])
      ),
    });
  }

  return {
    workOrders,
    quality: {
      totalRecords: items.length,
      missingFields: Object.entries(missingFields).map(([field, count]) => ({
        field,
        count,
      })),
      normalizedSectors,
      invalidDates,
      invalidValues,
    },
  };
}
