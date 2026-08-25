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
  sector: string;
  value: number | null;
  stage: DealStage;
  expectedCloseDate: Date | null;
  probability: number | null;
  salesOwner: string;
  status: string;
  createdAt: Date | null;
  rawData: Record<string, unknown>;
}

export interface WorkOrder {
  id: string;
  name: string;
  customer: string;
  sector: string;
  value: number | null;
  status: WorkOrderStatus;
  startDate: Date | null;
  endDate: Date | null;
  completionPercent: number | null;
  assignedTeam: string;
  rawData: Record<string, unknown>;
}

export interface DataQualityReport {
  totalRecords: number;
  missingFields: { field: string; count: number }[];
  normalizedSectors: { original: string; normalized: string }[];
  invalidDates: number;
  invalidValues: number;
}

export interface PipelineMetrics {
  totalValue: number;
  dealCount: number;
  avgDealSize: number;
  byStage: Record<string, { count: number; value: number }>;
  bySector: Record<string, { count: number; value: number }>;
  missingCloseDates: number;
  missingValues: number;
}

export interface OperationalMetrics {
  totalWorkOrders: number;
  activeCount: number;
  delayedCount: number;
  completedCount: number;
  bySector: Record<string, { count: number; value: number }>;
  totalValue: number;
}

export interface AgentResponse {
  answer: string;
  metrics?: Record<string, unknown>;
  dataQuality?: DataQualityReport;
  insights?: string[];
  caveats?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metrics?: Record<string, unknown>;
  dataQuality?: DataQualityReport;
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

export interface MondayBoardResponse {
  boards: {
    id: string;
    name: string;
    items_page: {
      items: MondayItem[];
      cursor: string | null;
    };
  }[];
}
