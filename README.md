# Skylark BI Agent

> An executive conversational Business Intelligence agent bridging leadership decision-making with operational delivery and sales pipeline data from monday.com.

---

## 1. Project Overview

**Skylark BI Agent** transforms messy operational and commercial data into instant, board-ready business intelligence. Powered by Google Gemini and live monday.com GraphQL integration, the agent allows founders, sales leaders, and operations managers to query pipeline health, project delivery bottlenecks, and client risk in natural language.

### Key Capabilities
- **Live Monday.com Integration**: 100% dynamic querying across Deals and Work Orders boards with cursor-based pagination.
- **Natural Language Query Understanding**: Translates conversational questions into multi-dimensional aggregation, filtering, and cross-board analysis.
- **Cross-Board BI & Risk Scoring**: Automatically links CRM deals with operational work orders by company code to identify high-risk clients, stalled projects, and revenue leakages.
- **Automated Data Quality & Normalization**: Strips duplicate header rows, normalizes non-standard dates/currencies/sector aliases, and surfaces an explainable Data Integrity drawer with health scores.

---

## 2. Architecture

```
 User Query / Quick Playbook
            │
            ▼
 Next.js API Route (/api/chat)
            │
            ▼
 Monday.com GraphQL API (v2) ──► Fetches Deals & Work Orders boards (with pagination)
            │
            ▼
 Normalization Engine (normalizer.ts) ──► Currency, date, sector, & header cleanup
            │
            ▼
 Cross-Board Analytics (analytics.ts) ──► Aggregations, client profiles, & risk scoring (0-100)
            │
            ▼
 Gemini 2.5 Flash (agent.ts) ──► System prompt + Structured analytical context injection
            │
            ▼
 Structured Executive Answer + Zero-Typing Follow-Up Drill-Downs + Data Integrity Report
```

---

## 3. Tech Stack

- **AI Model**: Google Gemini 2.5 Flash (`@google/generative-ai` SDK)
- **Framework & Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Lucide React icons, Geist font family
- **Markdown & Display**: `react-markdown`, `remark-gfm`
- **Data & Date Processing**: `dayjs` (with `quarterOfYear`, `customParseFormat`, `isoWeek`, `isBetween`), `zod`
- **API Integration**: Monday.com GraphQL API (`2024-10`)
- **Hosting Platform**: Vercel (or any Node.js / Docker environment)

---

## 4. Monday.com Setup

### Required Boards & Columns

The agent connects to two live monday.com boards:

#### 1. Deals Board (Sales Pipeline)
Tracks commercial opportunities from qualification through close.
- **Item Name**: Deal Title / Deal Name (`name`)
- **Client Code**: Customer identifier e.g., `COMPANY_001` (`text`)
- **Deal Value**: Masked or numeric deal value e.g., `₹50,00,000` or `50L` (`numbers` / `text`)
- **Sector / Service**: Industry category e.g., Mining, Powerline, Renewables (`text` / `dropdown`)
- **Deal Stage**: Pipeline stage e.g., Lead, Qualification, Proposal, Negotiation, Won, Lost (`status` / `dropdown`)
- **Deal Status**: Status indicator e.g., `Open`, `Won`, `Dead` (`status`)
- **Expected Close Date**: Tentative closing milestone (`date` / `text`)
- **Closure Probability**: Confidence e.g., `75%`, `High`, `0.8` (`numbers` / `text`)
- **Owner Code**: Sales / BD personnel identifier e.g., `OWNER_001` (`people` / `text`)

#### 2. Work Orders Board (Operational Execution)
Tracks field projects, delivery milestones, and billing realization.
- **Item Name / Deal Name Masked**: Project identifier (`name` / `text`)
- **Customer Code**: Client reference e.g., `WOCOMPANY_001` (`text`)
- **PO Value (Excl GST)**: Total purchase order value (`numbers` / `text`)
- **Total Invoiced**: Amount billed/collected to date (`numbers` / `text`)
- **Invoice Status**: Billing stage e.g., Invoiced, Partial, Pending (`status` / `dropdown`)
- **Execution Status**: Delivery progress e.g., `Ongoing`, `Completed`, `Pause / struck`, `Delayed` (`status` / `dropdown`)
- **Dates**: Probable start, end, and delivery dates (`date` / `text`)
- **Nature of Work**: Service contract type (`text` / `dropdown`)
- **Assigned Team / KAM**: Operational owner / lead (`people` / `text`)

> **Note**: Column mapping uses flexible alias matching (`getColumnValue()`), so minor naming differences (e.g. "Customer Name Code" vs "Client Code") are automatically resolved.

### Identifying Board IDs
Board IDs can be found directly in the Monday.com URL:
```
https://<your-team>.monday.com/boards/<BOARD_ID>
```

---

## 5. Local Setup

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm**, **pnpm**, or **yarn**
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- **Monday.com API Token** (from *Settings > Developers > My Access Tokens*)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AnisHerdev/skylark-bi-agent.git
cd skylark-bi-agent
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Populate the values in `.env.local`:
```env
# Google Gemini API
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Monday.com API
MONDAY_API_KEY=your_monday_personal_access_token

# Monday.com Board IDs
MONDAY_BOARD_ID_DEALS=1234567890
MONDAY_BOARD_ID_WORK_ORDERS=0987654321
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. How to Use

Interact with the agent by entering queries into the chat input, clicking playbook prompts in the sidebar, or triggering the 1-click **Executive Briefing** button in the header.

### Example Queries
- **Pipeline Analysis**:
  - *“How is our energy sector pipeline this quarter?”*
  - *“What is our total deal value by sector?”*
  - *“What is our overall win rate across all sales owners?”*
- **Operational Performance**:
  - *“Show operational performance for completed work orders.”*
  - *“How many work orders are delayed or paused?”*
  - *“Which projects have high unbilled PO amounts?”*
- **Risk & Client Health**:
  - *“Which clients should we stop working with or have the highest risk scores?”*
  - *“Show clients with high dead deal rates and stalled delivery.”*
- **Executive Summaries**:
  - *“Generate a comprehensive leadership update.”*

### UI Features
- **Zero-Typing Drill-Downs**: Every answer generates 3 clickable follow-up queries.
- **1-Click Slack / Email Export**: Copy cleanly formatted markdown reports ready for distribution.
- **Stop In-Flight Generation**: Abort long-running responses instantly.
- **Dual Theme Support**: Studio Mint Light and Dark themes with local persistence.

---

## 7. Data Handling

| Data Challenge | Resolution Strategy |
| :--- | :--- |
| **Missing / Null Values** | Non-blocking parsing. Unassigned dates or values default safely (`₹0`, `null`) and are flagged in the Data Quality report rather than crashing the pipeline. |
| **Date Format Inconsistencies** | Multi-format parser handles ISO (`YYYY-MM-DD`), standard Indian/UK (`DD/MM/YYYY`), US (`MM/DD/YYYY`), text dates (`15 Oct 2024`), and relative strings. |
| **Currency & Number Formats** | Strips currency symbols (`₹`, `$`, `Cr`, `Lakh`, `K`, `M`, commas) and computes accurate numeric values. |
| **Sector Alias Taxonomy** | Maps fragmented user inputs (e.g. `renewables`, `solar`, `wind` → `renewables`; `powerlines`, `power line` → `powerline`) to canonical keys. |
| **Client Code Normalization** | Strips inconsistent board prefixes (`WOCOMPANY_001` → `COMPANY_001`) to enable deterministic cross-board joins between Deals and Work Orders. |
| **Accidental Header Rows** | Detects and drops duplicate header rows (e.g., CSV imports retaining header labels in data rows) before analytics computation. |
| **Data Quality Visibility** | Every AI response includes an expandable **Data Integrity Drawer** with record counts, health scores, and automated cleansing notes. |

---

## 8. Error Handling

- **Monday.com API Failures**: Checks HTTP status codes, GraphQL syntax errors, missing board permissions, and unconfigured environment variables with descriptive error messages.
- **Invalid or Ambiguous Queries**: Zod schema validates incoming request payloads. The Gemini system prompt guides the model to highlight data ambiguities and provide explicit caveats when data is incomplete.
- **Cancellation**: Requests use standard `AbortController` signals to immediately stop Gemini and Monday API operations when the user clicks **Stop**.

---

## 9. Deployment / Hosted Prototype

- **Deployment Platform**: Vercel
- **Production Build**:
  ```bash
  npm run build
  npm run start
  ```
- **Environment Variables**: Add `GEMINI_API_KEY`, `MONDAY_API_KEY`, `MONDAY_BOARD_ID_DEALS`, and `MONDAY_BOARD_ID_WORK_ORDERS` in the hosting dashboard (e.g., Vercel Project Settings > Environment Variables).
- **Access Instructions**: Web-based access; no external authentication required for the standalone prototype.

---

## 10. Limitations & Future Improvements

### Current Limitations
- **Per-Query Live Fetch**: Fetches board items on every query (ensures freshest data, but may introduce 1–2s latency on very large boards).
- **Client Identifier Conventions**: Relies on consistent numeric suffixes in client/customer codes for automated joins.
- **Single-Session Memory**: Chat history is persisted in browser `localStorage` without multi-device cloud synchronization.

### Future Improvements
- **Webhook Caching**: Implement Monday.com webhook subscriptions with Redis cache invalidation for sub-second responses.
- **Two-Way Write Actions**: Enable the agent to update deal stages, create follow-up tasks, or flag work orders directly in Monday.com.
- **Scheduled Digests**: Automated morning Slack/Email briefings pushed to leadership channels.
- **Multi-Board Aggregation**: Support additional monday.com boards (e.g., Invoicing / Finance, Resource Allocation, Customer Support tickets).
