import { MonthlyFinancialRecord, ForecastRecord } from "../types";
import { Download, Printer, FileSpreadsheet, FileText, CheckCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { forecastFinancials } from "../utils/financialCalculations";

interface ExportPanelProps {
  records: MonthlyFinancialRecord[];
}

export default function ExportPanel({ records }: ExportPanelProps) {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Trigger download helper
  const downloadBlob = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Convert Financial Statements to CSV
  const handleExportStatements = () => {
    let csvContent = "Month,Revenue,COGS,Gross Profit,Operating Expenses,Operating Income (EBIT),Interest Expense,Tax Expense,Net Income,Operating Cash Flow,Investing Cash Flow,Financing Cash Flow,Cash Balance,Free Cash Flow\n";
    
    records.forEach((r) => {
      const row = [
        r.month,
        r.revenue,
        r.cogs,
        r.grossProfit,
        r.operatingExpenses,
        r.ebit,
        r.interestExpense,
        r.taxExpense,
        r.netIncome,
        r.operatingCashFlow,
        r.investingCashFlow,
        r.financingCashFlow,
        r.cashBalance,
        r.freeCashFlow
      ].map(v => `"${v}"`).join(",");
      csvContent += row + "\n";
    });

    downloadBlob(csvContent, "FinSight_Financial_Statements.csv", "text/csv;charset=utf-8;");
    triggerSuccess("Statements CSV");
  };

  // Convert Forecast table to CSV
  const handleExportForecast = () => {
    // Generate standard 12-month linear projections
    const forecastData = forecastFinancials(records, "cashBalance", "LINEAR_REGRESSION", 12);
    const forecastsOnly = forecastData.filter(r => r.isForecast);

    let csvContent = "Projected Month,Predicted Cash Balance,Lower Boundary (95% CI),Upper Boundary (95% CI)\n";
    forecastsOnly.forEach((r) => {
      const row = [
        r.month,
        r.predicted,
        r.lowerBound,
        r.upperBound
      ].map(v => `"${v}"`).join(",");
      csvContent += row + "\n";
    });

    downloadBlob(csvContent, "FinSight_CashFlow_Forecasts.csv", "text/csv;charset=utf-8;");
    triggerSuccess("Forecasts CSV");
  };

  const triggerSuccess = (name: string) => {
    setDownloadSuccess(name);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850" id="export-panel-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="export-panel-content">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">REPORT EXPORTS & REPLICABILITY</span>
          <h4 className="text-lg font-bold text-slate-200 mt-0.5">Corporate Reporting Hub</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Download your parsed financial ledgers, statistical projections, or launch a print stylesheet to export the dashboard as a premium executive PDF.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto" id="export-actions">
          {/* Export Statements */}
          <button
            onClick={handleExportStatements}
            className="flex-1 md:flex-none py-2 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold text-xs border border-slate-800 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Ledger
          </button>

          {/* Export Forecast */}
          <button
            onClick={handleExportForecast}
            className="flex-1 md:flex-none py-2 px-4 bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold text-xs border border-slate-800 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Export Projections
          </button>

          {/* PDF Print */}
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / PDF Export
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in" id="export-success-message">
          <CheckCircle className="w-4 h-4" />
          Successfully generated and compiled download file: <span className="font-extrabold text-white underline">{downloadSuccess}</span>
        </div>
      )}
    </div>
  );
}
