import { useState } from "react";
import { MonthlyFinancialRecord, ForecastModelType, ForecastRecord } from "../types";
import { forecastFinancials } from "../utils/financialCalculations";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend, ComposedChart } from "recharts";
import { Settings2, HelpCircle, Table, ArrowUpRight, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface ForecastingTabProps {
  records: MonthlyFinancialRecord[];
}

export default function ForecastingTab({ records }: ForecastingTabProps) {
  const [modelType, setModelType] = useState<ForecastModelType>("LINEAR_REGRESSION");
  const [forecastMonths, setForecastMonths] = useState<number>(12);
  const [targetField, setTargetField] = useState<"cashBalance" | "revenue" | "operatingCashFlow" | "freeCashFlow">("cashBalance");
  const [isTableView, setIsTableView] = useState<boolean>(false);

  // Generate forecasted records
  const forecastData: ForecastRecord[] = forecastFinancials(records, targetField, modelType, forecastMonths);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getTargetLabel = () => {
    switch (targetField) {
      case "cashBalance": return "Cash Balance";
      case "revenue": return "Monthly Revenue";
      case "operatingCashFlow": return "Operating Cash Flow";
      case "freeCashFlow": return "Free Cash Flow";
    }
  };

  // Split history and forecast for summary
  const forecastsOnly = forecastData.filter(r => r.isForecast);
  const latestForecast = forecastsOnly[forecastsOnly.length - 1];
  const firstForecast = forecastsOnly[0];
  const currentVal = records[records.length - 1][targetField];
  
  const totalGrowthPct = currentVal > 0 ? ((latestForecast.predicted - currentVal) / currentVal) * 100 : 0;

  return (
    <div className="space-y-6" id="forecasting-tab-container">
      {/* Parameter Selection panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="forecasting-panel-grid">
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between" id="forecast-controls">
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="w-4.5 h-4.5 text-indigo-400" />
              <h5 className="font-bold text-slate-200 text-sm uppercase tracking-wider">Projection parameters</h5>
            </div>

            {/* Target Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Target Metric</label>
              <select
                value={targetField}
                onChange={(e: any) => setTargetField(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:border-indigo-500 outline-none hover:border-slate-700 transition-all cursor-pointer"
              >
                <option value="cashBalance">Cash Balance</option>
                <option value="revenue">Monthly Revenue</option>
                <option value="operatingCashFlow">Operating Cash Flow</option>
                <option value="freeCashFlow">Free Cash Flow</option>
              </select>
            </div>

            {/* Model Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Statistical Algorithm</label>
              <select
                value={modelType}
                onChange={(e: any) => setModelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:border-indigo-500 outline-none hover:border-slate-700 transition-all cursor-pointer"
              >
                <option value="LINEAR_REGRESSION">Ordinary Least Squares (Linear)</option>
                <option value="MOVING_AVERAGE">Autoregressive Moving Average (MA)</option>
                <option value="EXPONENTIAL_SMOOTHING">Single Exponential Smoothing</option>
              </select>
            </div>

            {/* Forecast Months */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Projection Horizon</label>
              <select
                value={forecastMonths}
                onChange={(e: any) => setForecastMonths(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:border-indigo-500 outline-none hover:border-slate-700 transition-all cursor-pointer"
              >
                <option value="6">6 Months Out</option>
                <option value="12">12 Months Out</option>
                <option value="18">18 Months Out</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6" id="forecast-insights-summary">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PROJECTION MODEL METRIC</span>
            <span className="text-sm font-semibold text-slate-300 block mt-1">Expected {getTargetLabel()} change:</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-extrabold ${totalGrowthPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalGrowthPct >= 0 ? "+" : ""}{totalGrowthPct.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500">over {forecastMonths}mo</span>
            </div>
          </div>
        </div>

        {/* Model descriptions and info */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between" id="model-explanations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="algorithms-descriptions-grid">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 flex flex-col justify-between" id="linear-explanation-box">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-400 bg-indigo-950/40 rounded border border-indigo-500/15 uppercase tracking-wider block w-fit mb-2">OLS Linear</span>
                <p className="text-xs font-bold text-slate-200">Linear Regression</p>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Fits an Ordinary Least Squares line over all historical data points to capture macro compounding trajectories.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-indigo-400 mt-3 block">Best for structural growth.</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 flex flex-col justify-between" id="ma-explanation-box">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-bold text-teal-400 bg-teal-950/40 rounded border border-teal-500/15 uppercase tracking-wider block w-fit mb-2">Rolling Window</span>
                <p className="text-xs font-bold text-slate-200">Moving Average</p>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Projects next periods by averaging the last 4 months recursively. Standard errors expand dynamically.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-teal-400 mt-3 block">Best for seasonal noise reduction.</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 flex flex-col justify-between" id="es-explanation-box">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-bold text-amber-400 bg-amber-950/40 rounded border border-amber-500/15 uppercase tracking-wider block w-fit mb-2">Exponential</span>
                <p className="text-xs font-bold text-slate-200">Single ES</p>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Smooths the sequence with higher weight factors (alpha = 0.4) on the most recent chronological records.
                </p>
              </div>
              <span className="text-[10px] font-semibold text-amber-400 mt-3 block">Best for immediate momentum.</span>
            </div>
          </div>

          <div className="flex gap-4 items-center bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl mt-4" id="cfo-forecast-banner">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-xs text-slate-400 leading-normal">
              **CFO Projection Warning**: Confidences and prediction intervals represent statistical **95% bounds** under standard Gaussian distribution residuals. Strategic operational shifts can pivot curves.
            </p>
          </div>
        </div>
      </div>

      {/* Main Graph & Table Workspace */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90" id="forecast-workspace">
        <div className="flex justify-between items-center mb-6" id="forecast-workspace-header">
          <div>
            <h4 className="text-lg font-bold text-slate-100">{getTargetLabel()} 12-Month Projections</h4>
            <p className="text-xs text-slate-500">Combining actual records with projected statistical paths and error boundaries</p>
          </div>
          <button
            onClick={() => setIsTableView(!isTableView)}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Table className="w-3.5 h-3.5" />
            {isTableView ? "Show Forecasting Chart" : "Show Prediction Ledger"}
          </button>
        </div>

        {isTableView ? (
          /* Table View of Forecasts */
          <div className="overflow-x-auto rounded-xl border border-slate-800" id="prediction-ledger-container">
            <table className="w-full text-left text-xs text-slate-400 border-collapse table-auto">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
                <tr>
                  <th className="p-3">Projected Period</th>
                  <th className="p-3">Record Type</th>
                  <th className="p-3 text-right">Predicted Mid-Point ($)</th>
                  <th className="p-3 text-right">Lower Error Bound (95% CI)</th>
                  <th className="p-3 text-right">Upper Error Bound (95% CI)</th>
                  <th className="p-3 text-right">Estimated Uncertainty Width</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {forecastData.map((r, i) => {
                  const errorWidth = r.upperBound - r.lowerBound;
                  return (
                    <tr key={i} className={`hover:bg-slate-900/40 ${r.isForecast ? "bg-indigo-950/10" : ""}`}>
                      <td className="p-3 font-semibold text-slate-300">{r.month}</td>
                      <td className="p-3">
                        {r.isForecast ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-400 bg-indigo-950/30 rounded border border-indigo-500/10">Forecast</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-800 rounded border border-slate-700/50">Historical</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-100">
                        {formatCurrency(r.predicted)}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-medium">
                        {r.isForecast ? formatCurrency(r.lowerBound) : "-"}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-medium">
                        {r.isForecast ? formatCurrency(r.upperBound) : "-"}
                      </td>
                      <td className="p-3 text-right text-slate-500 font-semibold">
                        {r.isForecast ? formatCurrency(errorWidth) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* High-Fidelity Chart View */
          <div className="h-[400px] w-full" id="forecasting-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === "Uncertainty Range") {
                      const lower = formatCurrency(props.payload.lowerBound);
                      const upper = formatCurrency(props.payload.upperBound);
                      return [`${lower} - ${upper}`, "95% Confidence"];
                    }
                    return [formatCurrency(Number(value)), name];
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                
                {/* Confidence Range Shading (only active on forecasted records) */}
                <Area 
                  name="Uncertainty Range"
                  dataKey={(r) => r.isForecast ? [r.lowerBound, r.upperBound] : null} 
                  fill="#6366f1" 
                  fillOpacity={0.06} 
                  stroke="none" 
                />

                {/* Historical Series (only active on historical records) */}
                <Line 
                  name="Historical Actuals"
                  type="monotone" 
                  dataKey={(r) => r.isForecast ? null : r.predicted} 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, stroke: "#10b981", strokeWidth: 1, fill: "#0f172a" }} 
                />

                {/* Forecasted Projections Series */}
                <Line 
                  name="Statistical Forecast"
                  type="monotone" 
                  dataKey={(r) => r.isForecast ? r.predicted : null} 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4"
                  dot={{ r: 4, stroke: "#6366f1", strokeWidth: 1, fill: "#0f172a" }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
