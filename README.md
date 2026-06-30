# FinSight FP&A: Enterprise Financial Reporting & Cash Flow Forecasting Platform

A premium, production-grade FP&A (Financial Planning & Analysis) and Strategic Liquidity Platform engineered for CFOs, Senior Corporate Analysts, and Executives.

FinSight FP&A integrates high-fidelity financial ledger visualization with real-time mathematical recalculations, statistical modeling, 95% confidence prediction bands, and generative CFO AI Strategic Insights (powered by Gemini).

---

## 🚀 Key Features

### 1. **Executive Financial Dashboard**
- **SaaS Metric Panels:** Dynamic performance cards tracking Revenue growth, COGS behavior, Net Profit velocity, Cash Balances, OCF, and FCF.
- **Interactive Recharts:** Gorgeous trend visualizers illustrating Revenue vs Operating Costs, Profitability, Cumulative Liquidity, and Cash Flow profiles.
- **Micro-Animations:** Fluid state-based transitions powered by `motion` for visual rhythm and high professional impact.

### 2. **Interactive Financial Statement Ledger**
- **GAAP Tabular Layouts:** Chronological spreadsheets for Income Statement, Balance Sheet, and Cash Flow Statement.
- **Live Recalculations:** Instant, mathematically exact updates of Gross Profits, Operating Income (EBIT), Net Income, Asset balances, AP/AR cycles, and Ending Cash.
- **Advanced Excel Parser:** Integrated Client-Side spreadsheet parser powered by `xlsx`. Drag and drop any accounting export, and watch the platform auto-map headers and clean data in real-time.

### 3. **Cash Flow & Runway Analysis**
- **Liquidity Runway stress test:** Instant metrics projecting burn velocity under standard scenarios or zero-revenue stresses.
- **Cash Waterfall Reconstitution:** Floating waterfall bar charts deconstructing beginning-cash to ending-cash transitions for high-impact boardroom reviews.

### 4. **Statistical Projections & Forecasting**
- **Three Core Modeling Engines:**
  - **Ordinary Least Squares (OLS) Linear Regression** for macro growth trajectories.
  - **Autoregressive Moving Average (MA)** for local trend smoothing.
  - **Single Exponential Smoothing** favoring immediate chronological momentum.
- **Uncertainty Bounds:** Beautiful shaded Gaussian prediction areas representing 95% confidence limits.
- **Forecasting Ledger:** Standardized tabular breakdown of projected values.

### 5. **Financial Ratios Audit**
- Automated, rolling calculations of Liquidity indexes (Current, Quick), Profitability (margins, ROA, ROE), and Solvency leverage (Debt Ratio, Debt-to-Equity, Interest Coverage).
- Indicators and status flags (Good, Neutral, Critical) mapping performance deviations vs the previous month.

### 6. **CFO Strategic AI Insights (Gemini 3.5 Flash)**
- Deep analysis of revenue quality, capital conversion efficiency, operational bottlenecks, and working capital cycles.
- Clear head-up advisory with structured Markdown formatting.

---

## 📁 Project Directory Structure

```
FinSight/
├── server.ts               # Full-stack Express.js gateway with lazy-loaded Gemini API
├── vite.config.ts          # Vite bundler configuration
├── package.json            # Node/npm dependency ecosystem
├── tsconfig.json           # Strict compiler guidelines
├── src/
│   ├── main.tsx            # Main application bootstrap
│   ├── App.tsx             # State coordinator & core app shell
│   ├── index.css           # Global typography rules & high-fidelity Print/PDF overrides
│   ├── types.ts            # Mathematical TypeScript interfaces
│   ├── data/
│   │   └── sampleFinancialData.ts  # Chronological 24-month mathematically consistent baseline
│   ├── utils/
│   │   └── financialCalculations.ts # Statistical forecasting and ratio computation engines
│   └── components/
│       ├── DashboardTab.tsx     # Executive Dashboard views
│       ├── StatementsTab.tsx    # Tabular sheets with drag-drop Excel uploader
│       ├── CashFlowTab.tsx      # Liquidity stresses and Waterfall charts
│       ├── ForecastingTab.tsx   # Forecast controls, charts, and data tables
│       ├── RatiosTab.tsx        # Financial health ratio bento boxes
│       ├── InsightsTab.tsx      # Live/fallback AI CFO strategic reports
│       └── ExportPanel.tsx      # CSV downloads and Print launchers
```

---

## 🛠️ Tech Stack & Dependencies

- **Framework:** React 19 + TypeScript + Vite
- **Server:** Node.js + Express
- **AI Engine:** `@google/genai` (Gemini 3.5 Flash)
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Motion:** `motion` (Framer)
- **Charts:** Recharts
- **Parsing:** SheetJS (`xlsx`)

---

## 💾 Installation & Development Setup

To run FinSight FP&A locally or inside your container environment:

1. **Configure Environment Secrets:**
   Define your API keys in a `.env` or equivalent environment configuration panel:
   ```env
   GEMINI_API_KEY="your-google-api-key"
   ```

2. **Launch Development Server:**
   ```bash
   npm run dev
   ```
   The dev server will start instantly and host your reverse-proxied dashboard on port `3000`.

3. **Production Compilation:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📈 Future Improvements

- **Scenario Modeling (Sandbox):** Allow user to toggle simulated events (e.g. "Acquire $100k debt", "5% increase in SG&A") to stress test forecast models in real-time.
- **Workspace Multi-Sheet Integration:** Support multiple sheet tabs representing different subsidiaries for complete group consolidation.
- **Real-Time Database Sync:** Port to Firestore or Firebase Auth to store corporate portfolios securely over multiple browser sessions.
