import { useState, useEffect } from "react";
import { FinancialSummaryData } from "../types";
import { Sparkles, Brain, AlertCircle, RefreshCcw, HelpCircle, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import Markdown from "react-markdown";
import { motion } from "motion/react";

interface InsightsTabProps {
  summary: FinancialSummaryData;
}

export default function InsightsTab({ summary }: InsightsTabProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const loadingMessages = [
    "Compiling chronological operating trends...",
    "Stressing cash burn velocity & liquidity coefficients...",
    "Analyzing working capital cycle optimization...",
    "Formulating CFO strategic recommendations..."
  ];

  // Rotate loading messages
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          financialSummary: {
            latestMonth: summary.records[summary.records.length - 1],
            metrics: summary.metrics,
            ratios: summary.ratios,
            cyclesCount: summary.records.length
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with financial forecasting agent.");
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred while compiling AI insights.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run on mount if no insights generated yet
  useEffect(() => {
    if (!insights && !isLoading) {
      generateInsights();
    }
  }, []);

  return (
    <div className="space-y-6" id="insights-tab-container">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/40 border border-indigo-500/15 flex justify-between items-center" id="insights-top-banner">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h5 className="font-extrabold text-xs uppercase tracking-widest">Generative Strategic Advisor</h5>
          </div>
          <h4 className="text-xl font-bold text-slate-100">FinSight Strategic Advisory Report</h4>
          <p className="text-xs text-slate-400 max-w-xl">
            Generates a comprehensive executive CFO review from your active financial statements. Outlines liquidity health, cost centers, margins, and strategic advisory.
          </p>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/15 transition-all cursor-pointer hover:-translate-y-0.5"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Regenerate Report
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-850 min-h-[300px] flex flex-col justify-center" id="insights-main-pane">
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center" id="insights-loader">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <Brain className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-200 text-sm animate-pulse">{loadingMessages[loadingStep]}</p>
              <p className="text-xs text-slate-500">Retrieving strategic observations from Gemini financial model...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center" id="insights-error">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
            <div className="space-y-1">
              <p className="font-bold text-slate-200">Advisory Report Failed</p>
              <p className="text-xs text-slate-400 max-w-md">{error}</p>
            </div>
            <button
              onClick={generateInsights}
              className="mt-2 px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Retry API Request
            </button>
          </div>
        )}

        {insights && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="prose prose-invert prose-sm max-w-none space-y-4"
            id="insights-report-body"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6" id="insights-meta-header">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Analysis Dossier</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/10 px-2 py-0.5 rounded uppercase">
                <CheckCircle className="w-3 h-3" /> Fully Audited
              </span>
            </div>

            {/* Markdown Body styled inside tailwind wrapper */}
            <div className="markdown-body text-slate-300 leading-relaxed text-sm space-y-4 px-1">
              <Markdown>{insights}</Markdown>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
