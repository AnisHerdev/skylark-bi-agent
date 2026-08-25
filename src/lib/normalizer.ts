import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { Deal, WorkOrder, MondayItem, DataQualityReport, DealStage, WorkOrderStatus } from "./types";

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
  "DD-MMM-YY",
  "DD-MMM-YYYY",
  "DD/MMM/YY",
  "DD/MMM/YYYY",
  "D-MMM-YY",
  "D-MMM-YYYY",
  "D/M/YYYY",
  "M/D/YYYY",
  "D-M-YYYY",
  "M-D-YYYY",
  "MMM-YY",
  "MMM-YYYY",
  "MMM YYYY",
  "MMMM YYYY",
  "YYYY-MM",
  "MM/YYYY",
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
];

const SECTOR_ALIASES: Record<string, string> = {
  // 1. Mining
  mining: "mining",
  "mining sector": "mining",
  mines: "mining",
  mineral: "mining",
  minerals: "mining",

  // 2. Powerline
  powerline: "powerline",
  powerlines: "powerline",
  "power line": "powerline",
  "power lines": "powerline",
  transmission: "powerline",
  "t&d": "powerline",
  substation: "powerline",

  // 3. Renewables
  renewables: "renewables",
  renewable: "renewables",
  solar: "renewables",
  wind: "renewables",
  "clean energy": "renewables",
  "green energy": "renewables",

  // 4. Railways
  railways: "railways",
  railway: "railways",
  rail: "railways",
  metro: "railways",
  dfccil: "railways",

  // 5. DSP
  dsp: "dsp",
  "digital surface": "dsp",
  "dsp service": "dsp",
  "dsp project": "dsp",

  // 6. Pure Service
  "pure service": "pure_service",
  pureservice: "pure_service",
  pure_service: "pure_service",
  service: "pure_service",
  services: "pure_service",
  survey: "pure_service",
  surveillance: "pure_service",
  gis: "pure_service",
  mapping: "pure_service",
  inspection: "pure_service",
  consulting: "pure_service",

  // 7. Tender
  tender: "tender",
  tenders: "tender",
  "govt tender": "tender",
  "government tender": "tender",
  rfp: "tender",

  // 8. Spectra
  spectra: "spectra",
  spectral: "spectra",
  hyperspectral: "spectra",

  // 9. Others / Generic mappings
  energy: "energy",
  "energy sector": "energy",
  construction: "others",
  manufacturing: "others",
  mfg: "others",
  technology: "others",
  tech: "others",
  infrastructure: "others",
  infra: "others",
  telecom: "others",
  others: "others",
  other: "others",
  general: "others",
};

export function parseDate(value: string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null;

  // Handle Excel Serial dates (e.g. 44927, 45529)
  if (typeof value === "number" || (!isNaN(Number(value)) && String(value).trim().length === 5)) {
    const num = Number(value);
    if (num > 30000 && num < 60000) {
      // Excel epoch starts Dec 30 1899
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const jsDate = new Date(excelEpoch.getTime() + num * 86400000);
      if (!isNaN(jsDate.getTime())) return jsDate;
    }
  }

  if (typeof value !== "string" || value.trim() === "") return null;

  let cleaned = value.trim();
  if (
    cleaned.toLowerCase() === "n/a" ||
    cleaned.toLowerCase() === "null" ||
    cleaned.toLowerCase() === "undefined" ||
    cleaned === "-"
  ) {
    return null;
  }

  // Remove ordinal suffixes (1st, 2nd, 3rd, 4th -> 1, 2, 3, 4)
  cleaned = cleaned.replace(/(\d+)(st|nd|rd|th)/gi, "$1");

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
  if (!value || typeof value !== "string" || value.trim() === "") return "others";
  const cleaned = value.trim().toLowerCase();
  if (SECTOR_ALIASES[cleaned]) return SECTOR_ALIASES[cleaned];

  // Check if any alias key is a substring
  for (const [key, normalized] of Object.entries(SECTOR_ALIASES)) {
    if (cleaned.includes(key)) {
      return normalized;
    }
  }

  return "others";
}

export function normalizeProbability(value: string | null | undefined): number | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const lower = value.trim().toLowerCase();
  if (lower === "high") return 75;
  if (lower === "medium" || lower === "med") return 50;
  if (lower === "low") return 25;
  const num = parseNumber(value);
  if (num !== null) {
    return num <= 1 ? num * 100 : num;
  }
  return null;
}

export function normalizeStage(stageRaw: string | null | undefined, statusRaw?: string | null): DealStage {
  const statusClean = (statusRaw || "").trim().toLowerCase();
  if (statusClean === "dead" || statusClean === "lost") return "closed_lost";
  if (statusClean === "won") return "closed_won";

  if (!stageRaw || typeof stageRaw !== "string" || stageRaw.trim() === "") {
    return "lead";
  }

  const clean = stageRaw.trim().toLowerCase();

  if (clean.includes("not relevant") || clean.includes("dead") || clean.includes("lost")) {
    return "closed_lost";
  }
  if (clean.includes("project won") || clean.includes("closed won") || clean.includes("won")) {
    return "closed_won";
  }
  if (clean.includes("negotiat") || clean.includes("contract") || clean.includes("amount accrued") || clean.includes("agreement")) {
    return "negotiation";
  }
  if (clean.includes("proposal") || clean.includes("poc") || clean.includes("quote") || clean.includes("pitch") || clean.includes("rfp") || clean.includes("submitted")) {
    return "proposal";
  }
  if (clean.includes("qualif") || clean.includes("requirement") || clean.includes("demo") || clean.includes("meeting") || clean.includes("scop")) {
    return "qualification";
  }
  if (clean.includes("lead") || clean.startsWith("1.") || clean.startsWith("2.")) {
    return "lead";
  }

  return "lead";
}

export function normalizeExecutionStatus(value: string | null | undefined): WorkOrderStatus {
  if (!value || typeof value !== "string" || value.trim() === "") return "not_started";
  const clean = value.trim().toLowerCase();

  if (clean.includes("pause") || clean.includes("struck") || clean.includes("stuck") || clean.includes("hold")) {
    return "on_hold";
  }
  if (clean.includes("complete") || clean.includes("done") || clean.includes("finish") || clean.includes("closed")) {
    return "completed";
  }
  if (clean.includes("ongoing") || clean.includes("progress") || clean.includes("active")) {
    return "in_progress";
  }
  if (clean.includes("delay") || clean.includes("overdue") || clean.includes("behind")) {
    return "delayed";
  }
  if (clean.includes("not start") || clean.includes("pending") || clean.includes("new")) {
    return "not_started";
  }

  return "in_progress";
}

export function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  if (typeof value !== "string" || value.trim() === "") return null;

  let cleaned = value.replace(/[₹$,€£\s]/g, "").trim();

  // Multiplier matching (Cr, Lakh, K, M)
  const crMatch = cleaned.match(/^([0-9,.]+)\s*(?:cr|crore|crores)$/i);
  if (crMatch) {
    const base = parseFloat(crMatch[1].replace(/,/g, ""));
    return isNaN(base) ? null : base * 10000000;
  }

  const lMatch = cleaned.match(/^([0-9,.]+)\s*(?:l|lakh|lakhs|lac|lacs)$/i);
  if (lMatch) {
    const base = parseFloat(lMatch[1].replace(/,/g, ""));
    return isNaN(base) ? null : base * 100000;
  }

  const kMatch = cleaned.match(/^([0-9,.]+)\s*(?:k|thousand)$/i);
  if (kMatch) {
    const base = parseFloat(kMatch[1].replace(/,/g, ""));
    return isNaN(base) ? null : base * 1000;
  }

  const mMatch = cleaned.match(/^([0-9,.]+)\s*(?:m|million)$/i);
  if (mMatch) {
    const base = parseFloat(mMatch[1].replace(/,/g, ""));
    return isNaN(base) ? null : base * 1000000;
  }

  // Comma-separated numbers (e.g. 305,850,000 or 1,20,000)
  cleaned = cleaned.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function getColumnValue(item: MondayItem, possibleTitles: string[]): string | null {
  const normalizedTargets = possibleTitles.map((t) => t.toLowerCase().trim());
  
  // 1. Exact match pass (highest priority)
  for (const c of item.column_values) {
    const colTitle = c.column?.title?.toLowerCase().trim() || "";
    if (normalizedTargets.includes(colTitle)) {
      const text = c.text?.trim();
      if (text && text !== "" && text.toLowerCase() !== "null") return text;
    }
  }

  // 2. Safe prefix/word match pass (avoiding false positives like software platform columns)
  for (const c of item.column_values) {
    const colTitle = c.column?.title?.toLowerCase().trim() || "";
    // Never match questions about software platform
    if (colTitle.startsWith("is any skylark") || colTitle.includes("software platform")) {
      continue;
    }

    for (const target of normalizedTargets) {
      // Only match if target is at least 6 characters or exact word boundary
      if (target.length >= 6 && (colTitle.startsWith(target) || colTitle.endsWith(target))) {
        const text = c.text?.trim();
        if (text && text !== "" && text.toLowerCase() !== "null") return text;
      }
    }
  }

  return null;
}


function isHeaderRow(name: string, firstCols: (string | null)[]): boolean {
  const lowerName = (name || "").toLowerCase().trim();
  const headerKeywords = [
    "deal name",
    "client code",
    "customer name code",
    "masked deal value",
    "po value",
    "owner code",
    "serial #",
    "deal name masked",
  ];

  if (headerKeywords.some((k) => lowerName === k)) return true;

  // Check if multiple column values equal header labels
  const matches = firstCols.filter((col) => {
    if (!col) return false;
    const lower = col.toLowerCase().trim();
    return headerKeywords.some((k) => lower === k);
  });

  return matches.length >= 2;
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
  let droppedHeaderRows = 0;

  for (const item of items) {
    const name = item.name?.trim() || "";
    const clientCodeRaw = getColumnValue(item, [
      "Client Code",
      "Client",
      "Customer",
      "Company Code",
      "Customer Name Code",
      "Customer Code",
    ]);
    const valueRaw = getColumnValue(item, [
      "Masked Deal value",
      "Deal Value",
      "Deal Value Masked",
      "Deal value",
      "Value",
      "Amount",
      "Masked Deal Value (INR)",
      "Deal Value in INR",
      "Amount in Rupees",
    ]);
    const sectorRaw = getColumnValue(item, [
      "Sector/service",
      "Sector",
      "Industry",
      "Sector / Service",
    ]);

    // Filter out accidental duplicate header rows (e.g. rows 52 & 181)
    if (isHeaderRow(name, [clientCodeRaw, valueRaw, sectorRaw])) {
      droppedHeaderRows++;
      continue;
    }

    const clientCode = clientCodeRaw || name || "UNKNOWN_COMPANY";
    const client = clientCode;
    const ownerCode =
      getColumnValue(item, [
        "Owner code",
        "Owner",
        "Sales Owner",
        "BD Owner",
        "BD/KAM Personnel code",
        "Deal Owner",
      ]) || "UNASSIGNED";
    const dealStatus =
      getColumnValue(item, ["Deal Status", "Status", "Stage Status", "State"]) ||
      "Open";
    const productDeal =
      getColumnValue(item, [
        "Product deal",
        "Product",
        "Service",
        "Type of Work",
        "Nature of Work",
      ]) || "General";

    const sector = normalizeSector(sectorRaw);
    if (sectorRaw && sectorRaw.trim().toLowerCase() !== sector) {
      normalizedSectors.push({ original: sectorRaw, normalized: sector });
    }

    const value = parseNumber(valueRaw);
    if (valueRaw && value === null) invalidValues++;
    if (!valueRaw || valueRaw.trim() === "") {
      missingFields["Deal Value"] = (missingFields["Deal Value"] || 0) + 1;
    }

    const closeDateRaw = getColumnValue(item, [
      "Tentative Close Date",
      "Close Date (A)",
      "Expected Close Date",
      "Close Date",
      "Closing Date",
      "Target Close Date",
      "Month of Closure",
      "Target Date",
    ]);
    const expectedCloseDate = parseDate(closeDateRaw);
    if (closeDateRaw && expectedCloseDate === null) invalidDates++;
    if (!closeDateRaw || closeDateRaw.trim() === "") {
      missingFields["Expected Close Date"] =
        (missingFields["Expected Close Date"] || 0) + 1;
    }

    const stageRaw = getColumnValue(item, [
      "Deal Stage",
      "Stage",
      "Pipeline Stage",
    ]);
    const stage = normalizeStage(stageRaw, dealStatus);

    const probRaw = getColumnValue(item, [
      "Closure Probability",
      "Probability",
      "Chance",
      "Confidence",
    ]);
    const probability = normalizeProbability(probRaw);

    const createdDateRaw = getColumnValue(item, [
      "Created Date",
      "Date Created",
      "Created At",
    ]);
    const createdAt = parseDate(createdDateRaw) || parseDate(item.created_at);

    deals.push({
      id: item.id,
      name,
      client,
      clientCode,
      ownerCode,
      sector,
      value,
      stage,
      dealStatus,
      expectedCloseDate,
      probability,
      productDeal,
      salesOwner: ownerCode,
      createdAt,
      rawData: Object.fromEntries(
        item.column_values.map((c) => [c.column?.title || c.id, c.text])
      ),
    });
  }

  return {
    deals,
    quality: {
      totalRecords: items.length,
      validRecords: deals.length,
      droppedHeaderRows,
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
  let droppedHeaderRows = 0;

  for (const item of items) {
    const name = item.name?.trim() || "";
    const customerCodeRaw = getColumnValue(item, [
      "Customer Name Code",
      "Customer Code",
      "Customer",
      "Client Code",
      "Client",
      "Company Code",
    ]);
    const dealNameMaskedRaw = getColumnValue(item, [
      "Deal name masked",
      "Deal Name Masked",
      "Deal Name",
      "Deal Code",
      "Deal #",
      "Deal ID",
      "Serial #",
    ]);
    const poValueRaw = getColumnValue(item, [
      "Amount in Rupees (Excl GST)",
      "Amount in Rupees",
      "Amount in Rs.",
      "Amount in Rupees (Incl GST)",
      "PO Value (Excl GST)",
      "PO Value",
      "Project Value (Excl GST)",
      "Project Value",
      "Total PO Value",
      "Value",
      "Total Amount",
      "Contract Value",
    ]);
    const sectorRaw = getColumnValue(item, [
      "Sector",
      "Sector/service",
      "Sector / Service",
      "Industry",
    ]);

    // Filter out accidental duplicate header rows
    if (isHeaderRow(name, [customerCodeRaw, dealNameMaskedRaw, poValueRaw])) {
      droppedHeaderRows++;
      continue;
    }

    const isInvalidCustomerCode =
      !customerCodeRaw ||
      customerCodeRaw.trim().toUpperCase() === "NONE" ||
      customerCodeRaw.trim().toUpperCase() === "NULL" ||
      customerCodeRaw.trim().toUpperCase() === "SPECTRA";

    const customerCode = !isInvalidCustomerCode
      ? customerCodeRaw
      : name || "UNKNOWN_WO_CUSTOMER";
    const dealNameMasked = dealNameMaskedRaw || name;
    const natureOfWork =
      getColumnValue(item, [
        "Nature of Work",
        "Contract Type",
        "Type of Work",
        "Type",
      ]) || "Project";
    const executionStatusRaw = getColumnValue(item, [
      "Execution Status",
      "Status",
      "Work Status",
      "Project Status",
    ]);
    const status = normalizeExecutionStatus(executionStatusRaw);

    const sector = normalizeSector(sectorRaw);
    if (sectorRaw && sectorRaw.trim().toLowerCase() !== sector) {
      normalizedSectors.push({ original: sectorRaw, normalized: sector });
    }

    const value = parseNumber(poValueRaw);
    if (poValueRaw && value === null) invalidValues++;
    if (!poValueRaw || poValueRaw.trim() === "") {
      missingFields["PO Value"] = (missingFields["PO Value"] || 0) + 1;
    }

    const invoicedRaw = getColumnValue(item, [
      "Billed Value (Excl GST)",
      "Billed Value",
      "Billed Value (Incl GST)",
      "Total Invoiced (Excl GST)",
      "Total Invoiced",
      "Invoiced Amount",
      "Billed Amount",
      "Total Billed",
      "Collected Amount",
    ]);
    const totalInvoiced = parseNumber(invoicedRaw);

    const invoiceStatus =
      getColumnValue(item, [
        "Invoice Status",
        "Billing Status",
        "Invoice",
        "Billed Status",
      ]) || "Unknown";

    const startDateRaw = getColumnValue(item, [
      "Probable Start/End Date",
      "Probable Start Date",
      "Start Date",
      "Date of PO/LOI",
      "PO Date",
      "Start",
    ]);
    const startDate = parseDate(startDateRaw);
    if (startDateRaw && startDate === null) invalidDates++;

    const endDateRaw = getColumnValue(item, [
      "Data Delivery Date",
      "Probable End Date",
      "End Date",
      "Completion Date",
      "Delivery Date",
      "End",
    ]);
    const endDate = parseDate(endDateRaw);
    if (endDateRaw && endDate === null) invalidDates++;

    const completionRaw = getColumnValue(item, [
      "Completion",
      "% Complete",
      "Progress",
    ]);
    const completionPercent = parseNumber(completionRaw);

    const ownerCode =
      getColumnValue(item, [
        "BD/KAM Personnel code",
        "Owner code",
        "Owner",
        "KAM",
        "Assigned Team",
        "Project Lead",
      ]) || "UNASSIGNED";

    const assignedTeam =
      getColumnValue(item, [
        "Assigned Team",
        "Team",
        "Ops Team",
        "Resource",
      ]) || ownerCode;

    workOrders.push({
      id: item.id,
      name,
      dealNameMasked,
      customer: customerCode,
      customerCode,
      sector,
      value,
      totalInvoiced,
      invoiceStatus,
      status,
      natureOfWork,
      startDate,
      endDate,
      completionPercent,
      assignedTeam,
      ownerCode,
      rawData: Object.fromEntries(
        item.column_values.map((c) => [c.column?.title || c.id, c.text])
      ),
    });
  }

  return {
    workOrders,
    quality: {
      totalRecords: items.length,
      validRecords: workOrders.length,
      droppedHeaderRows,
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
