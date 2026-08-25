export type DealStage =
  | "lead"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type WorkOrderStatus =
  | "not_started"
  | "in_progress"
  | "delayed"
  | "completed"
  | "on_hold";

export interface Deal {
  id: string;
  name: string;
  client: string;
  clientCode: string;
  ownerCode: string;
  sector: string;
  value: number | null;
  stage: DealStage;
  dealStatus: string;
  expectedCloseDate: Date | null;
  probability: number | null;
  productDeal: string;
  salesOwner: string;
  createdAt: Date | null;
  rawData: Record<string, unknown>;
}

export interface WorkOrder {
  id: string;
  name: string;
  dealNameMasked: string;
  customer: string;
  customerCode: string;
  sector: string;
  value: number | null; // PO Value (Excl GST)
  totalInvoiced: number | null;
  invoiceStatus: string;
  status: WorkOrderStatus; // Execution Status
  natureOfWork: string;
  startDate: Date | null;
  endDate: Date | null;
  completionPercent: number | null;
  assignedTeam: string;
  ownerCode: string;
  rawData: Record<string, unknown>;
}

export interface ClientProfile {
  clientCode: string;
  normalizedCode: string;
  dealCount: number;
  openDealCount: number;
  wonDealCount: number;
  deadDealCount: number;
  totalPipelineValue: number;
  wonValue: number;
  winRate: number; // 0 - 100%
  deadRate: number; // 0 - 100%
  workOrderCount: number;
  activeWorkOrderCount: number;
  pausedWorkOrderCount: number;
  completedWorkOrderCount: number;
  totalProjectValue: number;
  totalInvoicedValue: number;
  sectors: string[];
  owners: string[];
  riskScore: number; // 0 (healthy) - 100 (high risk)
  riskReasons: string[];
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  droppedHeaderRows: number;
  missingFields: { field: string; count: number }[];
  normalizedSectors: { original: string; normalized: string }[];
  invalidDates: number;
  invalidValues: number;
}

export interface PipelineMetrics {
  totalValue: number; // Active in-flight pipeline value (Open deals)
  dealCount: number; // Total deals tracked in system
  activeDealCount: number; // Open / in-flight deals count
  wonDealCount: number; // Won deals count
  wonValue: number; // Closed-won deals total value
  deadDealCount: number; // Dead / lost deals count
  avgDealSize: number;
  byStage: Record<string, { count: number; value: number }>;
  bySector: Record<string, { count: number; value: number }>;
  byStatus: Record<string, number>;
  byOwner: Record<string, { count: number; value: number }>;
  missingCloseDates: number;
  missingValues: number;
}

export interface OperationalMetrics {
  totalWorkOrders: number;
  activeCount: number;
  delayedCount: number;
  completedCount: number;
  onHoldCount: number;
  bySector: Record<string, { count: number; value: number }>;
  byNatureOfWork: Record<string, number>;
  byInvoiceStatus: Record<string, number>;
  totalValue: number;
  totalInvoiced: number;
}

export interface CombinedDataQuality {
  totalRecords: number;
  validRecords: number;
  droppedHeaderRows: number;
  invalidDates: number;
  invalidValues: number;
  overallHealthScore: number;
  deals: DataQualityReport;
  workOrders: DataQualityReport;
  summaryNotes: string[];
}

export interface AgentResponse {
  answer: string;
  metrics?: Record<string, unknown>;
  dataQuality?: CombinedDataQuality;
  insights?: string[];
  caveats?: string[];
  suggestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metrics?: Record<string, unknown>;
  dataQuality?: CombinedDataQuality;
  suggestions?: string[];
}

export interface MondayColumnValue {
  id: string;
  text: string;
  value: string;
  column: {
    id: string;
    title: string;
    type: string;
  };
}

export interface MondayItem {
  id: string;
  name: string;
  column_values: MondayColumnValue[];
  created_at: string;
  updated_at: string;
}

export interface MondayBoard {
  id: string;
  name: string;
  items_page: {
    items: MondayItem[];
    cursor: string | null;
  };
}

export interface MondayGraphQLResponse<T> {
  data?: T;
  errors?: {
    message: string;
    locations?: { line: number; column: number }[];
    path?: string[];
  }[];
  error_message?: string;
  account_id?: number;
}

export type MondayBoardResponse = MondayGraphQLResponse<{
  boards: MondayBoard[];
}>;

export type MondayPaginationResponse = MondayGraphQLResponse<{
  next_items_page: {
    items: MondayItem[];
    cursor: string | null;
  };
}>;

export interface ProactiveQuestion {
  id: string;
  query: string;
  category: "revenue" | "risk" | "operations" | "client";
  title: string;
  anomaly: string;
  impactBadge: string;
}

export interface DashboardInsight {
  headline: string;
  takeaways: string[];
  riskAlerts: string[];
  proactiveQuestions: ProactiveQuestion[];
}

export interface SectorComparison {
  sector: string;
  pipelineValue: number;
  poValue: number;
  dealCount: number;
  workOrderCount: number;
}

export interface StageFunnelItem {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
}

export interface DashboardData {
  pipelineMetrics: PipelineMetrics;
  opsMetrics: OperationalMetrics;
  clientProfiles: ClientProfile[];
  highRiskClients: ClientProfile[];
  topClients: ClientProfile[];
  sectorComparisons: SectorComparison[];
  stageFunnel: StageFunnelItem[];
  dealsClosingThisQuarter: Deal[];
  stalledDeals: Deal[];
  delayedWorkOrders: WorkOrder[];
  dataQuality: CombinedDataQuality;
  insights: DashboardInsight;
  syncedAt: string;
}

