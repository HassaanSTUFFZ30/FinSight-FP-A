import { useState } from "react";
import { MonthlyFinancialRecord } from "../types";
import { generateDetailedRatios } from "../utils/financialCalculations";
import { ArrowUpRight, ArrowDownRight, ShieldCheck, AlertCircle, HelpCircle, Gauge, HelpCircle as HelpIcon } from "lucide-react";
import { motion } from "motion/react";

interface RatiosTabProps {
  records: MonthlyFinancialRecord[];
}

export default function RatiosTab({ records }: RatiosTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const detailedRatios = generateDetailedRatios(records);

  // Categories list
  const categories = ["All", "Liquidity", "Profitability", "Solvency", "Efficiency"];

  const filteredRatios = selectedCategory === "All"
    ? detailedRatios
    : detailedRatios.filter(r => r.category === selectedCategory);

  // Status badge colors helper
  const getStatusBadge = (status: "Good" | "Neutral" | "Critical") => {
    switch (status) {
      case "Good":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
      case "Neutral":
        return "text-amber-400 bg-amber-950/40 border-amber-500/20";
      case "Critical":
        return "text-rose-400 bg-rose-950/40 border-rose-500/20";
    }
  };

  const getStatusIcon = (status: "Good" | "Neutral" | "Critical") => {
    switch (status) {
      case "Good":
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case "Neutral":
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case "Critical":
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6" id="ratios-tab-container">
      {/* Category selector */}
      <div className="flex gap-2 p-1 bg-slate-950/80 border border-slate-850 rounded-xl w-fit" id="ratios-category-selector">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${selectedCategory === cat ? "bg-slate-800 text-indigo-400 font-extrabold shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bento Grid of Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="ratios-bento-grid">
        {filteredRatios.map((ratio, idx) => {
          const delta = ratio.value - ratio.previousValue;
          const isGrowing = delta >= 0;
          const pctChange = ratio.previousValue !== 0 ? (delta / ratio.previousValue) * 100 : 0;

          // Format value string based on unit
          const formatRatioValue = (val: number, unit: string) => {
            if (unit === "$") {
              return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
            }
            if (unit === "%") {
              return `${val.toFixed(1)}%`;
            }
            return `${val.toFixed(2)}${unit}`;
          };

          const formatRatioDelta = (val: number, unit: string) => {
            if (unit === "$") {
              return formatRatioValue(Math.abs(val), unit);
            }
            if (unit === "%") {
              return `${Math.abs(val).toFixed(1)}%`;
            }
            return `${Math.abs(val).toFixed(2)}${unit}`;
          };

          return (
            <motion.div
              key={ratio.name}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between h-[230px] group"
              id={`ratio-card-${ratio.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            >
              <div>
                <div className="flex justify-between items-start" id={`ratio-header-${idx}`}>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{ratio.category}</span>
                    <h5 className="font-bold text-slate-200 text-sm mt-0.5 group-hover:text-white transition-colors">{ratio.name}</h5>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${getStatusBadge(ratio.status)}`} id={`ratio-badge-${idx}`}>
                    {getStatusIcon(ratio.status)}
                    {ratio.status}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2" id={`ratio-value-row-${idx}`}>
                  <h3 className="text-3xl font-extrabold text-slate-100 font-mono">
                    {formatRatioValue(ratio.value, ratio.unit)}
                  </h3>
                  <div className={`flex items-center text-xs font-semibold ${isGrowing ? "text-emerald-400" : "text-rose-400"}`} id={`ratio-delta-${idx}`}>
                    {isGrowing ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>
                      {formatRatioDelta(delta, ratio.unit)} ({Math.abs(pctChange).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 mt-4" id={`ratio-footer-${idx}`}>
                <p className="text-[11px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <HelpIcon className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{ratio.description}</span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
