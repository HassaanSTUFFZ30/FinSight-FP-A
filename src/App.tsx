import { useState, useEffect } from "react";
import { initialSampleData } from "./data/sampleFinancialData";
import { summarizeFinancialData } from "./utils/financialCalculations";
import { MonthlyFinancialRecord } from "./types";

// Import custom tab components
import DashboardTab from "./components/DashboardTab";
import StatementsTab from "./components/StatementsTab";
import CashFlowTab from "./components/CashFlowTab";
import ForecastingTab from "./components/ForecastingTab";
import RatiosTab from "./components/RatiosTab";
import InsightsTab from "./components/InsightsTab";
import ExportPanel from "./components/ExportPanel";

// Import icon utilities
import { 
  LayoutDashboard, 
  FileText, 
  Coins, 
  TrendingUp, 
  BarChart2, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  TrendingUp as TrendIcon,
  Shield,
  Briefcase,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [records, setRecords] = useState<MonthlyFinancialRecord[]>(initialSampleData);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Load state from localStorage if available, else load sample
  useEffect(() => {
    const saved = localStorage.getItem("finsight_fpa_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load stored statements records", e);
      }
    }
  }, []);

  // Update records handler (with persistence)
  const handleUpdateRecords = (updated: MonthlyFinancialRecord[]) => {
    setRecords(updated);
    localStorage.setItem("finsight_fpa_records", JSON.stringify(updated));
  };

  // Reset to default sample records
  const handleResetData = () => {
    if (confirm("Are you sure you want to restore the standard FinSight 24-month sample ledger? This will overwrite your custom changes.")) {
      setRecords(initialSampleData);
      localStorage.setItem("finsight_fpa_records", JSON.stringify(initialSampleData));
    }
  };

  // Generate calculations summary
  const summary = summarizeFinancialData(records);
  const latestRecord = records[records.length - 1];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white" id="finsight-app-root">
      {/* Dynamic top ticker strip (hidden on print) */}
      <div className="bg-slate-900/80 border-b border-slate-850/80 backdrop-blur px-6 py-2 flex flex-wrap gap-6 items-center justify-between text-xs font-mono print:hidden" id="top-tracker-bar">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400 font-bold">LEDGER STATUS:</span>
          <span className="text-slate-200">Active Audit Mode ({records.length} chronological cycles)</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">LATEST MONTH:</span>
            <span className="text-slate-200 font-semibold">{latestRecord.month}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">CASH POSITION:</span>
            <span className="text-amber-400 font-bold">{formatCurrency(latestRecord.cashBalance)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">ESTIMATED RUNWAY:</span>
            <span className="text-indigo-400 font-bold">{summary.metrics.estimatedRunwayMonths} Months</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row" id="main-content-layout">
        {/* Sidebar Navigation (hidden on print) */}
        <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-850/80 flex flex-col print:hidden" id="app-sidebar">
          {/* Logo Brand Frame */}
          <div className="p-6 border-b border-slate-850 flex items-center gap-3" id="sidebar-logo-frame">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-extrabold tracking-tight text-white flex items-center gap-1">
                FinSight <span className="text-indigo-400 text-xs font-bold uppercase px-1 py-0.5 rounded bg-indigo-950/50 border border-indigo-500/20">FP&A</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 tracking-wide">Enterprise Reporting & Forecasts</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-1.5" id="sidebar-nav-list">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${activeTab === "dashboard" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Executive Dashboard
            </button>
            <button
              onClick={() => setActiveTab("statements")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${activeTab === "statements" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"}`}
            >
              <FileText className="w-4 h-4" />
              Financial Statements
            </button>
            <button
              onClick={() => setActiveTab("cashflow")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${activeTab === "cashflow" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"}`}
            >
              <Coins className="w-4 h-4" />
              Cash Flow Analysis
            </button>
            <button
              onClick={() => setActiveTab("forecasting")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${activeTab === "forecasting" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"}`}
            >
              <TrendingUp className="w-4 h-4" />
              Cash Flow Forecasting
            </button>
            <button
              onClick={() => setActiveTab("ratios")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${activeTab === "ratios" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"}`}
            >
              <BarChart2 className="w-4 h-4" />
              Financial Ratios
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${activeTab === "insights" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 animate-pulse" : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"}`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Strategic AI Insights
            </button>
          </nav>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-slate-850 bg-slate-950/20 text-center" id="sidebar-cfo-card">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-widest">Active CFO Session</span>
            <span className="text-xs font-semibold text-slate-300 block mt-1">alimehkrihassan@gmail.com</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Corporate Role: Strategic Advisor</span>
          </div>
        </aside>

        {/* Viewstage Content Pane */}
        <main className="flex-1 flex flex-col p-6 lg:p-10 space-y-8 overflow-y-auto" id="app-viewstage">
          {/* Header Description block (hidden on print) */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6 print:hidden" id="viewstage-header">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                {activeTab === "dashboard" && "Executive Financial Dashboard"}
                {activeTab === "statements" && "Interactive General Ledger"}
                {activeTab === "cashflow" && "Corporate Liquidity Deconstruction"}
                {activeTab === "forecasting" && "Predictive Capital Forecasting"}
                {activeTab === "ratios" && "FP&A Financial Ratios Audit"}
                {activeTab === "insights" && "Generative AI CFO Advisory"}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {activeTab === "dashboard" && "High-level overview of revenue streams, cost behavior, profit generation, and cash trajectories."}
                {activeTab === "statements" && "Chronological income statement, balance sheet, and operational cash ledger lines."}
                {activeTab === "cashflow" && "Inflows, outflows, burn rates, capital reserves, and runway duration stresstesting."}
                {activeTab === "forecasting" && "Forward 12-month projections utilizing Linear Regression, Moving Average, or Exponential Smoothing."}
                {activeTab === "ratios" && "Liquidity, Solvency, Profitability, and Capital Efficiency indices calculated in real-time."}
                {activeTab === "insights" && "Strategic CFO advisory generated on-demand by Gemini 3.5 Flash financial model."}
              </p>
            </div>
            
            {/* Quick action info badge */}
            <div className="flex gap-3 text-xs bg-slate-900 border border-slate-850 p-3 rounded-xl" id="header-action-panel">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Reporting Mode</span>
                <span className="font-semibold text-indigo-400 block mt-0.5">US-GAAP Audited</span>
              </div>
            </div>
          </header>

          {/* Core Tab Workspace (with fade transition animations!) */}
          <div className="flex-1" id="tab-viewport">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "dashboard" && <DashboardTab summary={summary} />}
                {activeTab === "statements" && (
                  <StatementsTab 
                    records={records} 
                    onUpdateRecords={handleUpdateRecords} 
                    onResetData={handleResetData}
                  />
                )}
                {activeTab === "cashflow" && <CashFlowTab summary={summary} />}
                {activeTab === "forecasting" && <ForecastingTab records={records} />}
                {activeTab === "ratios" && <RatiosTab records={records} />}
                {activeTab === "insights" && <InsightsTab summary={summary} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Export / Printable controls block */}
          <ExportPanel records={records} />
        </main>
      </div>
    </div>
  );
}
