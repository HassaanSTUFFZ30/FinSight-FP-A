import { MonthlyFinancialRecord, FinancialSummaryData } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Flame, Shield, HelpCircle, DollarSign, Wallet, Percent } from "lucide-react";
import { motion } from "motion/react";

interface CashFlowTabProps {
  summary: FinancialSummaryData;
}

export default function CashFlowTab({ summary }: CashFlowTabProps) {
  const { records, metrics } = summary;
  const latest = records[records.length - 1];
  
  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const beginningCash = latest.cashBalance - latest.netCashFlow;

  // Setup Waterfall Data for Recharts floating bars
  const waterfallData = [
    { 
      name: "Beginning Cash", 
      pv: [0, beginningCash], 
      displayValue: beginningCash,
      color: "#475569" 
    },
    { 
      name: "Operating Inflows", 
      pv: [beginningCash, beginningCash + latest.operatingCashFlow], 
      displayValue: latest.operatingCashFlow,
      color: "#10b981" 
    },
    { 
      name: "Investing Outflows", 
      pv: [beginningCash + latest.operatingCashFlow, beginningCash + latest.operatingCashFlow + latest.investingCashFlow], 
      displayValue: latest.investingCashFlow,
      color: "#f43f5e" 
    },
    { 
      name: "Financing Activities", 
      pv: [beginningCash + latest.operatingCashFlow + latest.investingCashFlow, latest.cashBalance], 
      displayValue: latest.financingCashFlow,
      color: "#06b6d4" 
    },
    { 
      name: "Ending Cash", 
      pv: [0, latest.cashBalance], 
      displayValue: latest.cashBalance,
      color: "#f59e0b" 
    }
  ];

  // Cash burn status card colors
  const runway = metrics.estimatedRunwayMonths;
  let runwayStatus = {
    title: "Secure Runway",
    desc: "Capital reserves can withstand standard operational stress.",
    color: "text-emerald-400 bg-emerald-950/20 border-emerald-500/20",
    icon: Shield
  };

  if (runway < 6) {
    runwayStatus = {
      title: "Critical Runway",
      desc: "Capital expansion or cost optimization required immediately.",
      color: "text-rose-400 bg-rose-950/20 border-rose-500/20",
      icon: Flame
    };
  } else if (runway < 12) {
    runwayStatus = {
      title: "Warning Threshold",
      desc: "Monitor cash inflows and consider discretionary cost reductions.",
      color: "text-amber-400 bg-amber-950/20 border-amber-500/20",
      icon: HelpCircle
    };
  }

  const RunwayIcon = runwayStatus.icon;

  return (
    <div className="space-y-8" id="cashflow-analysis-container">
      {/* Cash Burn and Runway Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cashflow-stats-row">
        {/* Burn Rate card */}
        <motion.div 
          id="burn-rate-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 backdrop-blur-md lg:col-span-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CFO Risk Profile</span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-rose-400 bg-rose-950/30 rounded border border-rose-500/20 uppercase tracking-wider">Burn Velocity</span>
            </div>
            <h4 className="text-3xl font-bold text-slate-100 font-sans tracking-tight">{formatCurrency(metrics.avgMonthlyBurn)}</h4>
            <p className="text-sm font-semibold text-slate-400 mt-1">Average Monthly Net Expenditures</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Based on rolling 6-month operating outflows and SG&A commitments. This serves as the benchmark baseline for liquidity stresses.
            </p>
          </div>
          <div className="flex gap-4 items-center border-t border-slate-800/80 pt-4 mt-4" id="burn-rate-footer">
            <div className="p-2 bg-rose-950/40 rounded-lg text-rose-400 border border-rose-500/10">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Operating Outflow</span>
              <span className="text-xs text-slate-500 block">Baseline cash commitments are active.</span>
            </div>
          </div>
        </motion.div>

        {/* Estimated Runway Card */}
        <motion.div 
          id="estimated-runway-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 backdrop-blur-md lg:col-span-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Liquidity Runway</span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/30 rounded border border-emerald-500/20 uppercase tracking-wider">Months</span>
            </div>
            <h4 className="text-4xl font-extrabold text-slate-100 font-sans tracking-tight">{metrics.estimatedRunwayMonths} <span className="text-lg font-medium text-slate-400">Mo</span></h4>
            <p className="text-sm font-semibold text-slate-400 mt-1">Estimated Solvent Operating Window</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Calculated dynamically by dividing ending cash of {formatCurrency(latest.cashBalance)} by our baseline burn model.
            </p>
          </div>
          <div className={`flex gap-4 items-center border p-3 rounded-xl ${runwayStatus.color}`} id="runway-status-footer">
            <RunwayIcon className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-xs font-bold block">{runwayStatus.title}</span>
              <span className="text-[10px] leading-snug block">{runwayStatus.desc}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick FCF metrics card */}
        <motion.div 
          id="fcf-metrics-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 backdrop-blur-md lg:col-span-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Cash Flow (FCF)</span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-400 bg-indigo-950/30 rounded border border-indigo-500/20 uppercase tracking-wider">SaaS Margin</span>
            </div>
            <h4 className="text-3xl font-bold text-slate-100 font-sans tracking-tight">{formatCurrency(latest.freeCashFlow)}</h4>
            <p className="text-sm font-semibold text-slate-400 mt-1">Cash Available for Reinvestment</p>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Calculated as Operating Cash Flow of {formatCurrency(latest.operatingCashFlow)} minus CapEx of {formatCurrency(latest.capex)}. Positive FCF drives valuation.
            </p>
          </div>
          <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-4" id="fcf-efficiency-footer">
            <span className="text-xs font-medium text-slate-400">Cash Flow Conversion</span>
            <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> {((latest.freeCashFlow / Math.max(1, latest.netIncome)) * 100).toFixed(0)}% conversion
            </span>
          </div>
        </motion.div>
      </div>

      {/* Waterfall Visualizer */}
      <motion.div
        id="cashflow-waterfall-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex flex-col h-[420px]"
      >
        <div className="flex justify-between items-center mb-6" id="waterfall-header">
          <div>
            <h4 className="text-lg font-bold text-slate-100">Monthly Cash Waterfall Reconstitution</h4>
            <p className="text-xs text-slate-500">Deconstructing cash inflows and outflows for the latest month ({latest.month})</p>
          </div>
          <div className="flex gap-4 text-xs font-bold text-slate-400" id="waterfall-legends">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Inflow</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Outflow</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-600"></span> Balance</span>
          </div>
        </div>
        <div className="flex-1 w-full" id="waterfall-chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(v) => `$${v / 1000}k`} 
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                formatter={(value: any, name: any, props: any) => {
                  const val = props.payload.displayValue;
                  return [formatCurrency(val), "Impact Value"];
                }}
              />
              <Bar dataKey="pv" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Historical Cash Flow Table Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850" id="historical-cashflow-breakdown">
        <h4 className="text-lg font-bold text-slate-100 mb-4">Sequential Liquidity Table ({records.length} Cycles)</h4>
        <div className="overflow-x-auto rounded-xl border border-slate-800" id="historical-cashflow-table-container">
          <table className="w-full text-left text-xs text-slate-400 border-collapse table-auto min-w-[750px]">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
              <tr>
                <th className="p-3">Fiscal Month</th>
                <th className="p-3 text-right">Operating Cash Flow</th>
                <th className="p-3 text-right">Investing Cash Flow (CapEx)</th>
                <th className="p-3 text-right">Financing Cash Flow</th>
                <th className="p-3 text-right">Net Change in Cash</th>
                <th className="p-3 text-right">Ending Cash Balance</th>
                <th className="p-3 text-right">FCF Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {records.map((r) => {
                const fcfMargin = r.revenue > 0 ? (r.freeCashFlow / r.revenue) * 100 : 0;
                return (
                  <tr key={r.month} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-300">{r.month}</td>
                    <td className="p-3 text-right text-emerald-400 font-medium">{formatCurrency(r.operatingCashFlow)}</td>
                    <td className="p-3 text-right text-rose-400 font-medium">{formatCurrency(r.investingCashFlow)}</td>
                    <td className="p-3 text-right text-cyan-400 font-medium">{formatCurrency(r.financingCashFlow)}</td>
                    <td className={`p-3 text-right font-bold ${r.netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatCurrency(r.netCashFlow)}
                    </td>
                    <td className="p-3 text-right text-amber-400 font-semibold">{formatCurrency(r.cashBalance)}</td>
                    <td className="p-3 text-right font-medium text-indigo-400">{fcfMargin.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
