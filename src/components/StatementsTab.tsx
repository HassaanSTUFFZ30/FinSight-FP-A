import { useState, useRef } from "react";
import { MonthlyFinancialRecord } from "../types";
import { Upload, RefreshCw, FileSpreadsheet, Plus, Trash2, CheckCircle2, AlertTriangle, Edit3 } from "lucide-react";
import * as XLSX from "xlsx";
import { motion } from "motion/react";

interface StatementsTabProps {
  records: MonthlyFinancialRecord[];
  onUpdateRecords: (updated: MonthlyFinancialRecord[]) => void;
  onResetData: () => void;
}

type StatementView = "income" | "balance" | "cashflow";

export default function StatementsTab({ records, onUpdateRecords, onResetData }: StatementsTabProps) {
  const [activeStatement, setActiveStatement] = useState<StatementView>("income");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Handle direct cells change
  const handleCellChange = (index: number, field: keyof MonthlyFinancialRecord, value: string) => {
    const updated = [...records];
    const numValue = parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
    
    // Update raw value
    (updated[index] as any)[field] = numValue;

    // Trigger mathematical recalculations to maintain integrity!
    if (field === "revenue" || field === "cogs") {
      updated[index].grossProfit = updated[index].revenue - updated[index].cogs;
    }
    if (field === "grossProfit" || field === "operatingExpenses") {
      updated[index].ebit = updated[index].grossProfit - updated[index].operatingExpenses;
    }
    if (field === "ebit" || field === "interestExpense" || field === "taxExpense") {
      updated[index].netIncome = updated[index].ebit - updated[index].interestExpense - updated[index].taxExpense;
    }
    if (field === "operatingCashFlow" || field === "capex") {
      updated[index].freeCashFlow = updated[index].operatingCashFlow - updated[index].capex;
    }
    if (field === "operatingCashFlow" || field === "investingCashFlow" || field === "financingCashFlow") {
      updated[index].netCashFlow = updated[index].operatingCashFlow + updated[index].investingCashFlow + updated[index].financingCashFlow;
    }

    // Balance Sheet reciprocal calculations
    updated[index].currentAssets = (updated[index].cashAndEquivalents || updated[index].cashBalance) + (updated[index].accountsReceivable || 0) + (updated[index].inventory || 0) + (updated[index].otherCurrentAssets || 0);
    updated[index].totalAssets = updated[index].currentAssets + (updated[index].nonCurrentAssets || 0);
    updated[index].currentLiabilities = (updated[index].accountsPayable || 0) + (updated[index].shortTermDebt || 0) + (updated[index].otherCurrentLiabilities || 0);
    updated[index].totalLiabilities = updated[index].currentLiabilities + (updated[index].longTermDebt || 0);
    updated[index].totalEquity = updated[index].totalAssets - updated[index].totalLiabilities;
    updated[index].workingCapital = updated[index].currentAssets - updated[index].currentLiabilities;

    onUpdateRecords(updated);
  };

  const handleMonthNameChange = (index: number, value: string) => {
    const updated = [...records];
    updated[index].month = value;
    onUpdateRecords(updated);
  };

  // Add blank month
  const handleAddNewMonth = () => {
    const lastRec = records[records.length - 1];
    
    // Parse next month name
    let nextMonthStr = "Jan 2026";
    if (lastRec) {
      const parts = lastRec.month.split(" ");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let mIdx = months.indexOf(parts[0]);
      let yr = parseInt(parts[1]);
      mIdx++;
      if (mIdx > 11) {
        mIdx = 0;
        yr++;
      }
      nextMonthStr = `${months[mIdx]} ${yr}`;
    }

    const newRecord: MonthlyFinancialRecord = {
      month: nextMonthStr,
      revenue: lastRec ? Math.round(lastRec.revenue * 1.02) : 100000,
      cogs: lastRec ? Math.round(lastRec.cogs * 1.02) : 30000,
      grossProfit: lastRec ? Math.round(lastRec.grossProfit * 1.02) : 70000,
      operatingExpenses: lastRec ? Math.round(lastRec.operatingExpenses * 1.01) : 50000,
      ebit: lastRec ? Math.round(lastRec.ebit * 1.03) : 20000,
      interestExpense: lastRec ? lastRec.interestExpense : 1000,
      taxExpense: lastRec ? Math.round(lastRec.taxExpense * 1.02) : 3800,
      netIncome: lastRec ? Math.round(lastRec.netIncome * 1.02) : 15200,
      operatingCashFlow: lastRec ? Math.round(lastRec.operatingCashFlow * 1.02) : 18000,
      investingCashFlow: lastRec ? lastRec.investingCashFlow : -5000,
      financingCashFlow: lastRec ? lastRec.financingCashFlow : -2000,
      netCashFlow: lastRec ? Math.round(lastRec.netCashFlow * 1.02) : 11000,
      cashBalance: lastRec ? lastRec.cashBalance + 11000 : 200000,
      capex: lastRec ? lastRec.capex : 5000,
      freeCashFlow: lastRec ? Math.round(lastRec.freeCashFlow * 1.02) : 13000,
      totalAssets: lastRec ? lastRec.totalAssets + 11000 : 500000,
      currentAssets: lastRec ? lastRec.currentAssets + 11000 : 220000,
      cashAndEquivalents: lastRec ? lastRec.cashBalance + 11000 : 200000,
      accountsReceivable: lastRec ? lastRec.accountsReceivable : 30000,
      inventory: lastRec ? lastRec.inventory : 25000,
      otherCurrentAssets: 0,
      nonCurrentAssets: lastRec ? lastRec.nonCurrentAssets : 280000,
      totalLiabilities: lastRec ? lastRec.totalLiabilities : 190000,
      currentLiabilities: lastRec ? lastRec.currentLiabilities : 75000,
      accountsPayable: lastRec ? lastRec.accountsPayable : 15000,
      shortTermDebt: lastRec ? lastRec.shortTermDebt : 10000,
      otherCurrentLiabilities: lastRec ? lastRec.otherCurrentLiabilities : 50000,
      longTermDebt: lastRec ? lastRec.longTermDebt : 115000,
      totalEquity: lastRec ? lastRec.totalEquity + 11000 : 310000,
      retainedEarnings: lastRec ? lastRec.retainedEarnings + 11000 : 190000,
      shareCapital: 120000,
      workingCapital: lastRec ? lastRec.workingCapital : 145000
    };

    onUpdateRecords([...records, newRecord]);
  };

  // Delete latest month
  const handleDeleteMonth = (idx: number) => {
    if (records.length <= 2) {
      alert("At least 2 months of historical statements are required for robust forecasting.");
      return;
    }
    const updated = records.filter((_, i) => i !== idx);
    onUpdateRecords(updated);
  };

  // Excel parsing function
  const parseSpreadsheet = (file: File) => {
    setUploadError(null);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw JSON
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);
        
        if (rawRows.length === 0) {
          throw new Error("The uploaded spreadsheet is empty.");
        }

        // Validate and dynamically map columns
        const parsedRecords: MonthlyFinancialRecord[] = rawRows.map((row, i) => {
          // Attempt to find month
          const monthVal = row.Month || row.month || row.Date || row.date || row.Period || row.period || `Month ${i+1}`;
          
          const rev = parseFloat(row.Revenue || row.revenue || row.Sales || row.sales || 0);
          const cogsVal = parseFloat(row.COGS || row.cogs || row.CostOfSales || row.cost_of_goods_sold || 0);
          const opexVal = parseFloat(row.OPEX || row.opex || row.OperatingExpenses || row.expenses || row.Expenses || 0);
          const interestVal = parseFloat(row.Interest || row.interest || row.InterestExpense || 0);
          const taxVal = parseFloat(row.Tax || row.tax || row.TaxExpense || row.Taxes || 0);
          
          // OCF, CapEx, Cash Balance
          const ocfVal = parseFloat(row.OperatingCashFlow || row.operating_cash_flow || row.OCF || row.ocf || 0);
          const capexVal = parseFloat(row.CapEx || row.capex || row.CapitalExpenditure || 0);
          const cashBal = parseFloat(row.CashBalance || row.cash_balance || row.Cash || row.cash || 0);
          
          // Math reconciliations
          const gp = rev - cogsVal;
          const ebitVal = gp - opexVal;
          const netInc = ebitVal - interestVal - taxVal;
          
          const netCF = ocfVal - capexVal; // simplified net flow or proxy
          const fcf = ocfVal - capexVal;

          // Balance Sheet items mapping or proxies
          const assetsVal = parseFloat(row.TotalAssets || row.total_assets || row.Assets || 0) || (cashBal + gp * 4);
          const liabVal = parseFloat(row.TotalLiabilities || row.total_liabilities || row.Liabilities || 0) || (gp * 1.5);
          const equityVal = assetsVal - liabVal;

          return {
            month: String(monthVal),
            revenue: rev || 100000,
            cogs: cogsVal || 30000,
            grossProfit: gp || 70000,
            operatingExpenses: opexVal || 45000,
            ebit: ebitVal || 25000,
            interestExpense: interestVal || 1000,
            taxExpense: taxVal || 4800,
            netIncome: netInc || 19200,
            operatingCashFlow: ocfVal || ebitVal * 0.95,
            investingCashFlow: -capexVal || -5000,
            financingCashFlow: 0,
            netCashFlow: netCF || 15000,
            cashBalance: cashBal || 250000,
            capex: capexVal || 5000,
            freeCashFlow: fcf || (ebitVal * 0.95 - capexVal),
            totalAssets: assetsVal,
            currentAssets: assetsVal * 0.45,
            cashAndEquivalents: cashBal || assetsVal * 0.35,
            accountsReceivable: assetsVal * 0.08,
            inventory: assetsVal * 0.02,
            otherCurrentAssets: 0,
            nonCurrentAssets: assetsVal * 0.55,
            totalLiabilities: liabVal,
            currentLiabilities: liabVal * 0.4,
            accountsPayable: liabVal * 0.15,
            shortTermDebt: liabVal * 0.1,
            otherCurrentLiabilities: liabVal * 0.15,
            longTermDebt: liabVal * 0.6,
            totalEquity: equityVal,
            retainedEarnings: equityVal * 0.6,
            shareCapital: equityVal * 0.4,
            workingCapital: (assetsVal * 0.45) - (liabVal * 0.4)
          };
        });

        onUpdateRecords(parsedRecords);
        setUploadSuccess(true);
      } catch (err: any) {
        setUploadError(err.message || "Failed to parse the file structure. Ensure your Excel sheet has clear headers (Revenue, COGS, Month).");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseSpreadsheet(file);
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseSpreadsheet(file);
  };

  return (
    <div className="space-y-6" id="statements-tab-container">
      {/* Top Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="statements-top-grid">
        {/* Upload Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`lg:col-span-8 p-6 rounded-2xl border-2 border-dashed bg-slate-900/40 backdrop-blur-sm transition-all duration-300 flex flex-col justify-center items-center text-center cursor-pointer min-h-[160px] relative overflow-hidden group ${
            isDragging ? "border-indigo-500 bg-indigo-950/20 shadow-indigo-500/10 scale-[1.01]" : "border-slate-800 hover:border-slate-600 hover:bg-slate-900/60"
          }`}
          onClick={() => fileInputRef.current?.click()}
          id="statements-upload-zone"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-indigo-400 group-hover:text-indigo-300 transition-colors mb-3">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-slate-200 block text-sm sm:text-base">Drag & Drop Financial Excel Spreadsheet</span>
            <span className="text-xs text-slate-500 block mt-1">Accepts CSV, XLSX, XLS. Auto-maps key headers (Revenue, COGS, Cash Balance, etc.)</span>
          </div>

          {uploadSuccess && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-2 p-4 animate-fade-in" id="upload-success-mask">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className="font-bold text-slate-100">Spreadsheet Parsed Successfully</p>
              <p className="text-xs text-slate-400 text-center max-w-sm">Loaded {records.length} chronological months. Tables, forecasting algorithms, and ratios have updated automatically.</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setUploadSuccess(false); }}
                className="mt-2 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
              >
                Upload Another Sheet
              </button>
            </div>
          )}

          {uploadError && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-2 p-4" id="upload-error-mask">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
              <p className="font-bold text-rose-400">Excel Parsing Failed</p>
              <p className="text-xs text-slate-400 text-center max-w-sm">{uploadError}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setUploadError(null); }}
                className="mt-2 px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-200 text-xs font-semibold rounded-lg border border-rose-500/20 transition-all"
              >
                Retry Upload
              </button>
            </div>
          )}
        </div>

        {/* Info & Reset Actions panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between" id="statements-actions-panel">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              <h5 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Statement Ledger Controls</h5>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify monthly statements below. Double-click any cell to adjust values. Recalculations of Gross Margins, Net Income, and Cash Balances are computed in real-time.
            </p>
          </div>
          <div className="flex gap-3 mt-4" id="reset-ledger-btn-container">
            <button
              onClick={onResetData}
              className="flex-1 py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:text-white transition-all duration-300 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Sample Ledger
            </button>
            <button
              onClick={handleAddNewMonth}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/20 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Append Next Month
            </button>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3" id="statement-tabs-navigation">
        <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-850">
          <button
            onClick={() => setActiveStatement("income")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeStatement === "income" ? "bg-slate-800 text-indigo-400 font-extrabold shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            Income Statement
          </button>
          <button
            onClick={() => setActiveStatement("balance")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeStatement === "balance" ? "bg-slate-800 text-indigo-400 font-extrabold shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveStatement("cashflow")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeStatement === "cashflow" ? "bg-slate-800 text-indigo-400 font-extrabold shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            Cash Flow Statement
          </button>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">LEDGER HEALTH</span>
          {/* Validate balance sheet equation */}
          {Math.abs(records[records.length-1].totalAssets - (records[records.length-1].totalLiabilities + records[records.length-1].totalEquity)) < 1 ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Balanced Balance Sheet
            </span>
          ) : (
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Out of Balance!
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Tables container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/25 shadow-xl max-h-[600px] scrollbar-thin" id="statements-table-container">
        <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10" id="statement-table-thead">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-[180px] bg-slate-900">Line Item ($)</th>
              {records.map((r, i) => (
                <th key={r.month} className="p-3 text-xs font-semibold text-slate-300 text-right w-[110px] hover:bg-slate-800 relative group">
                  <input 
                    type="text" 
                    value={r.month} 
                    onChange={(e) => handleMonthNameChange(i, e.target.value)} 
                    className="bg-transparent font-semibold border-b border-transparent focus:border-indigo-500 text-right w-full outline-none text-slate-100 hover:cursor-pointer"
                  />
                  <button 
                    onClick={() => handleDeleteMonth(i)} 
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Month"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60" id="statement-table-tbody">
            {activeStatement === "income" && (
              <>
                {/* Revenue Section */}
                <tr className="bg-slate-900/20 hover:bg-slate-900/40">
                  <td className="p-4 text-xs font-bold text-slate-200 flex items-center gap-1">
                    Revenue <Edit3 className="w-3 h-3 text-slate-500" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.revenue)}
                        onChange={(e) => handleCellChange(idx, "revenue", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-100 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Cost of Goods Sold (COGS) <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.cogs)}
                        onChange={(e) => handleCellChange(idx, "cogs", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-900/40 font-bold border-y border-slate-800">
                  <td className="p-4 text-xs text-emerald-400">Gross Profit</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs text-emerald-400">
                      {formatCurrency(r.grossProfit)}
                    </td>
                  ))}
                </tr>

                {/* OPEX */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Operating Expenses <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.operatingExpenses)}
                        onChange={(e) => handleCellChange(idx, "operatingExpenses", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-900/30 font-semibold">
                  <td className="p-4 text-xs text-slate-200">Operating Income (EBIT)</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs text-slate-200">
                      {formatCurrency(r.ebit)}
                    </td>
                  ))}
                </tr>

                {/* Below Operating */}
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Interest Expense <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.interestExpense)}
                        onChange={(e) => handleCellChange(idx, "interestExpense", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-400 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Tax Expense <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.taxExpense)}
                        onChange={(e) => handleCellChange(idx, "taxExpense", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-400 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-indigo-950/20 font-extrabold border-y-2 border-slate-800 text-indigo-300">
                  <td className="p-4 text-xs">Net Income</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs text-indigo-300">
                      {formatCurrency(r.netIncome)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {activeStatement === "balance" && (
              <>
                {/* Assets */}
                <tr className="bg-slate-900/30 font-bold border-t border-slate-800">
                  <td className="p-4 text-xs text-slate-200">ASSETS</td>
                  {records.map((_, i) => <td key={i} className="p-3"></td>)}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Cash & Equivalents <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.cashAndEquivalents || r.cashBalance)}
                        onChange={(e) => handleCellChange(idx, "cashAndEquivalents", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Accounts Receivable <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.accountsReceivable)}
                        onChange={(e) => handleCellChange(idx, "accountsReceivable", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Inventory <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.inventory)}
                        onChange={(e) => handleCellChange(idx, "inventory", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Non-Current Assets (PP&E) <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.nonCurrentAssets)}
                        onChange={(e) => handleCellChange(idx, "nonCurrentAssets", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-900/50 font-extrabold text-slate-200 border-y border-slate-800">
                  <td className="p-4 text-xs">Total Assets</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs">
                      {formatCurrency(r.totalAssets)}
                    </td>
                  ))}
                </tr>

                {/* Liabilities */}
                <tr className="bg-slate-900/30 font-bold border-t border-slate-800">
                  <td className="p-4 text-xs text-slate-200">LIABILITIES</td>
                  {records.map((_, i) => <td key={i} className="p-3"></td>)}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Accounts Payable <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.accountsPayable)}
                        onChange={(e) => handleCellChange(idx, "accountsPayable", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Short-Term Debt <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.shortTermDebt)}
                        onChange={(e) => handleCellChange(idx, "shortTermDebt", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Long-Term Debt <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.longTermDebt)}
                        onChange={(e) => handleCellChange(idx, "longTermDebt", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-900/50 font-extrabold text-slate-200 border-y border-slate-800">
                  <td className="p-4 text-xs">Total Liabilities</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs">
                      {formatCurrency(r.totalLiabilities)}
                    </td>
                  ))}
                </tr>

                {/* Equity */}
                <tr className="bg-slate-900/30 font-bold border-t border-slate-800">
                  <td className="p-4 text-xs text-slate-200">SHAREHOLDER EQUITY</td>
                  {records.map((_, i) => <td key={i} className="p-3"></td>)}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Share Capital <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.shareCapital)}
                        onChange={(e) => handleCellChange(idx, "shareCapital", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Retained Earnings <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.retainedEarnings)}
                        onChange={(e) => handleCellChange(idx, "retainedEarnings", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-indigo-950/20 font-extrabold text-indigo-300 border-y-2 border-slate-800">
                  <td className="p-4 text-xs">Total Liabilities & Equity</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs text-indigo-300">
                      {formatCurrency(r.totalLiabilities + r.totalEquity)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {activeStatement === "cashflow" && (
              <>
                <tr className="bg-slate-900/20 hover:bg-slate-900/40">
                  <td className="p-4 text-xs font-bold text-slate-200 flex items-center gap-1">
                    Operating Cash Flow <Edit3 className="w-3 h-3 text-slate-500" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.operatingCashFlow)}
                        onChange={(e) => handleCellChange(idx, "operatingCashFlow", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-100 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Investing Cash Flow (CapEx) <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.investingCashFlow)}
                        onChange={(e) => handleCellChange(idx, "investingCashFlow", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 text-xs text-slate-400 pl-6 flex items-center gap-1">
                    Financing Cash Flow <Edit3 className="w-3 h-3 text-slate-600" />
                  </td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right">
                      <input
                        type="text"
                        value={formatCurrency(r.financingCashFlow)}
                        onChange={(e) => handleCellChange(idx, "financingCashFlow", e.target.value)}
                        className="bg-transparent text-right outline-none text-slate-300 border-b border-transparent focus:border-indigo-500 w-full text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-900/50 font-bold border-y border-slate-800">
                  <td className="p-4 text-xs text-slate-200">Net Cash Flow</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs text-slate-200">
                      {formatCurrency(r.netCashFlow)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-amber-950/10 font-extrabold border-y-2 border-slate-800 text-amber-400">
                  <td className="p-4 text-xs">Ending Cash Balance</td>
                  {records.map((r, idx) => (
                    <td key={idx} className="p-3 text-right text-xs text-amber-400">
                      {formatCurrency(r.cashBalance)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
