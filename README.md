# FinSight FP&A

> Financial Planning, Liquidity Analysis, and Forecasting Platform

**FinSight FP&A** is a full-stack financial intelligence application that turns static accounting ledgers into interactive, real-time financial models. It's built around a practical FP&A workflow — replacing manual spreadsheet consolidation with dynamic, recalculating financial statements and forecasting tools.

---

## 📸 Screenshots

| Executive Dashboard | Financial Statements |
|---|---|
| ![Dashboard](assets/screenshots/dashboard.png) | ![Statements](assets/screenshots/statements.png) |

| Cash Flow Analysis | Cash Flow Forecasting |
|---|---|
| ![Cash Flow Analysis](assets/screenshots/cashflow.png) | ![Forecasting](assets/screenshots/forecasting.png) |

---

## 💼 Core Capabilities

In a typical FP&A workflow, generating a forecast or stress-testing working capital means hours of manual Excel consolidation. FinSight FP&A automates this through four core capabilities:

1. **Financial Diagnostics** — Analyzes chronological financial statements to surface working capital trends, calculate capital conversion cycles, and generate strategic narrative insights.
2. **Liquidity Modeling & Stress Testing** — Visualizes cash-flow transitions with waterfall charts, and lets users run scenario tests (zero-revenue, margin contraction, supply chain lags) to estimate cash runway under different conditions.
3. **Multi-Model Forecasting** — Goes beyond simple trendlines with OLS Linear Regression, Moving Average, and Single Exponential Smoothing, each with 95% confidence intervals.
4. **Spreadsheet Ingestion** — Drag-and-drop upload of raw ledger data (`.xlsx`), automatically mapped into a full triple-statement structure.

---

## 🏗️ Modules

### 📊 1. Executive Dashboard
- Real-time monitoring of Gross/Operating/Net Margins, Free Cash Flow (FCF), Operating Cash Flow (OCF), and Revenue Growth.
- Interactive charts tracking Revenue vs. Expenditures, Cumulative Balance trends, and Margin variances.
- Smooth tab transitions and micro-interactions for a polished, presentation-ready feel.

### 📝 2. GAAP-Structured Ledger
- Interlocking, interactive tables for Income Statement, Balance Sheet, and Cash Flow Statement.
- Real-time recalculation: any line-item adjustment instantly propagates across the ledger — updating Gross Profit, EBITDA, Net Income, Asset balances, and Ending Cash.
- In-client Excel parser maps raw spreadsheet rows directly to statement structures, no database staging required.

### 💧 3. Liquidity Waterfall & Runway Analysis
- Interactive dials mapping monthly burn rate and cash survival horizon.
- Waterfall chart decomposing cash changes from beginning-of-period to end-of-period across Operating, Investing, and Financing activities.

### 📈 4. Forecasting & Ratio Analytics
- Choose between OLS Regression, Moving Average, or Exponential Smoothing to project forward.
- Automatic benchmarking of Liquidity (Current & Quick Ratios), Profitability (ROA, ROE), and Solvency metrics against prior-period baselines.

---

## 🏗️ Architecture

The platform is a full-stack application (React frontend, Express backend) with calculations handled server-side. This keeps the analytical logic separated from the client and centralizes the financial computation layer in one place rather than scattering it across the frontend.

---

## 📁 Repository Structure

```
FinSight/
├── server.ts               # Node/Express backend & analytical server
├── vite.config.ts          # Vite bundler configuration
├── package.json            # Node dependency configuration
├── tsconfig.json           # TypeScript compilation rules
├── src/
│   ├── main.tsx             # React application mounting
│   ├── App.tsx              # Central state coordinator and layout structure
│   ├── index.css            # Global typography, color variables, and styling
│   ├── types.ts             # GAAP-structured financial TypeScript types
│   ├── data/
│   │   └── sampleFinancialData.ts   # Chronological 24-month baseline ledger
│   ├── utils/
│   │   └── financialCalculations.ts # Forecast and accounting algorithms
│   └── components/
│       ├── DashboardTab.tsx     # Executive metrics and visualizations
│       ├── StatementsTab.tsx    # Interlocking statements & Excel uploader
│       ├── CashFlowTab.tsx      # Runway calculators and Cash Waterfall
│       ├── ForecastingTab.tsx   # Statistical modeling controls and projections
│       ├── RatiosTab.tsx        # Financial ratios dashboard
│       ├── InsightsTab.tsx      # Narrative insights engine
│       └── ExportPanel.tsx      # CSV export and print templates
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Styling & UI**: Tailwind CSS v4 + Lucide Icons
- **Animations**: `motion` (Framer)
- **Charting**: Recharts (D3-backed)
- **Spreadsheet Parsing**: SheetJS (`xlsx`)

---

## 💻 Installation & Quickstart

To run **FinSight FP&A** locally:

1. **Clone & install dependencies:**
   ```bash
   git clone <your-repository-url>
   cd FinSight
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   The dev server compiles assets, launches the Express backend, and runs on `http://localhost:3000`.

3. **Production build & start:**
   ```bash
   npm run build
   npm start
   ```
   This bundles the React client and compiles the backend into a single self-contained server file (`dist/server.cjs`) using `esbuild`.

---

## 🌐 Live Demo

[fin-sight-fp-a.vercel.app](https://fin-sight-fp-a.vercel.app)
