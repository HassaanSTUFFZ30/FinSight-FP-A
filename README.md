# FinSight FP&A
> High-fidelity Financial Planning, Strategic Liquidity, and Predictive Forecasting Platform.

**FinSight FP&A** is a modern, enterprise-grade financial intelligence application designed for corporate executives, chief financial officers, and senior analysts. It bridges the gap between raw, static accounting ledgers and real-time executive decision-making, replacing slow spreadsheet cycles with interactive, dynamic financial modeling.

---

## 💼 Core Business Value

In traditional corporate environments, generating a board-ready forecast or stress-testing working capital requires hours of manual Excel consolidation. FinSight FP&A automates these operations in real-time through three critical capabilities:

1. **Intelligent Financial Advisory**: Automatically analyzes chronological financial statements to isolate working capital inefficiencies, calculate capital conversion cycles, and deliver precise, executive-level strategic recommendations.
2. **Stress-Testing & Liquidity Modeling**: Visualizes cash-flow transitions using dynamic waterfall charts. Allows leadership to run instant stress-tests—modeling zero-revenue scenarios, margin contractions, or supply chain lags—to determine exact cash runways.
3. **Multi-Model Statistical Projections**: Replaces simple trendlines with robust predictive engines—including Ordinary Least Squares (OLS) Linear Regression, Moving Average (MA), and Single Exponential Smoothing—complete with interactive 95% confidence intervals.
4. **Frictionless Data Ingest**: Supports instant drag-and-drop uploading of raw ledger sheets (`.xlsx` formats), mapping and recalculating complete triple-statement structures on-the-fly.

---

## 🏗️ Architectural Foundations

### 📊 1. Executive Performance Dashboard
* **SaaS Metric Panels**: Real-time monitoring of Gross/Operating/Net Margins, Free Cash Flow (FCF), Operating Cash Flow (OCF), and Revenue Growth Velocity.
* **Interactive Charting**: Custom-styled interactive trend visualizations tracking Revenue vs. Expenditures, Cumulative Balance trends, and Margin variances.
* **Micro-Interactions**: Built using high-performance animations for smooth, fluid tab transitions that enhance readability and presentation.

### 📝 2. Dynamic GAAP-Compliant Ledger
* **Interlocking Financial Statements**: Complete, interactive tables for Income Statements, Balance Sheets, and Cash Flow Statements.
* **Real-Time Recalculation Engine**: Any adjustment to a single line-item instantly propagates across the entire ledger structure—updating Gross Profit, EBITDA, Net Income, Asset balances, and Ending Cash.
* **Excel Processing**: In-client Excel parser mapping raw spreadsheet rows directly to GAAP structures without requiring database staging.

### 💧 3. Liquidity Waterfall & Runway Stresses
* **Runway Projection**: Interactive dials mapping out monthly burn rates and cash survival horizons.
* **Waterfall Accounting**: A classic visual bridge decomposing cash changes from beginning-of-period to end-of-period, detailing Operating, Investing, and Financing flows.

### 📈 4. Advanced Forecasting & Ratio Analytics
* **Statistical Modeling**: Choose between OLS Regression, Seasonal Moving Average, or Exponential Smoothing to project forward.
* **Health Benchmarks**: Automatic auditing of Liquidity (Current & Quick Ratios), Profitability (ROA, ROE), and Solvency metrics against previous-period Baselines.

---

## 🔒 Enterprise-Grade Security Architecture

The platform is built as a secure, full-stack application (React & Express) with clear security boundaries:
* **Server-Side Isolation**: All proprietary algorithms and external service endpoints run behind an Express.js server acting as a secure gateway.
* **Zero Client Leakage**: Sensitive analytical engines, data structures, and private configurations are kept strictly on the server-side, protecting corporate IP from browser extraction.

---

## 📁 Repository Structure

```
FinSight/
├── server.ts               # Secure Node/Express gateway & analytical server
├── vite.config.ts          # Optimized Vite bundler configuration
├── package.json            # Node dependency configuration
├── tsconfig.json           # Strict TypeScript compilation rules
├── src/
│   ├── main.tsx            # React application mounting
│   ├── App.tsx             # Central state coordinator and layout structure
│   ├── index.css           # Global typography, color variables, and styling
│   ├── types.ts            # GAAP-compliant financial TypeScript types
│   ├── data/
│   │   └── sampleFinancialData.ts  # Chronological 24-month baseline ledger
│   ├── utils/
│   │   └── financialCalculations.ts # Forecast and accounting algorithms
│   └── components/
│       ├── DashboardTab.tsx     # Executive metrics and visualizations
│       ├── StatementsTab.tsx    # Interlocking GAAP statements & Excel uploader
│       ├── CashFlowTab.tsx      # Runway calculators and Cash Waterfall
│       ├── ForecastingTab.tsx   # Statistical modeling controls and projections
│       ├── RatiosTab.tsx        # Financial ratios dashboard
│       ├── InsightsTab.tsx      # Intelligent narrative report engine
│       └── ExportPanel.tsx      # High-fidelity CSV export and Print templates
```

---

## 🛠️ Technology Stack & Libraries

* **Frontend Framework**: React 19 + TypeScript + Vite
* **Backend Server**: Node.js + Express
* **Styling & UI**: Tailwind CSS v4 + Lucide Icons
* **Animations**: `motion` (Framer)
* **Charting Engine**: Recharts (D3-backed charting)
* **Spreadsheet Parser**: SheetJS (`xlsx`)

---

## 💻 Installation & Quickstart

To run **FinSight FP&A** locally:

1. **Clone & Install Dependencies:**
   ```bash
   git clone <your-repository-url>
   cd FinSight
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The dev server compiles assets, launches the Express backend gateway, and runs on `http://localhost:3000`.

3. **Production Build & Compilation:**
   ```bash
   npm run build
   ```
   This bundles the React client and compiles the backend into a single, high-performance, self-contained server file (`dist/server.cjs`) using `esbuild`. Start the production instance using:
   ```bash
   npm start
   ```

---

## 🎯 Executive Outreach Template (LinkedIn / Email)

When sharing this project with a CEO or Senior Executive, use this concise, business-first script:

> *"Hi [Name],*
>
> *I recently engineered **FinSight FP&A**, a modern financial planning and strategic liquidity platform designed to solve a critical executive challenge: **the slow, error-prone cycle of manual Excel forecasting.***
>
> *Here is how it drives business value:*
> 1. ***Dynamic Scenario Stress-Testing***: Allows leadership to run instant cash runway simulations under severe revenue contractions or working capital delays.
> 2. ***Interactive Cash Bridges***: Deconstructs raw cash changes with dynamic Waterfall visualizations, perfect for executive or board-level presentations.
> 3. ***Structured Automated Recalculations***: Drag and drop a raw accounting ledger file (`.xlsx`) to instantly map and recalculate complete GAAP-compliant statement models.
> 4. ***Intelligent Narrative Insights***: Translates complex statement variables into direct, high-level operational recommendations regarding working capital and margin health.
>
> *The system is designed as a secure, full-stack application (React, TypeScript, and Node/Express) built with a secure server-side proxy gateway to protect proprietary data.*
>
> *Demo: [https://rebrand.ly/6ccqnaa]*  
> *Repository: [https://github.com/HassaanSTUFFZ30/FinSight-FP-A]*
>
> *I’d love to hear your thoughts on how your team currently manages rolling forecast scenarios!"*
