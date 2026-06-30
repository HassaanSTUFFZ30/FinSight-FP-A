import { MonthlyFinancialRecord, FinancialSummaryData } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from "recharts";
import { TrendingUp, DollarSign, Activity, Award, ArrowUpRight, ArrowDownRight, ShieldAlert, Zap, Layers } from "lucide-react";
import { motion } from "motion/react";

interface DashboardTabProps {
  summary: FinancialSummaryData;
}

export default function DashboardTab({ summary }: DashboardTabProps) {
  const { records, ratios, metrics } = summary;
  const latest = records[records.length - 1];
  const previous = records[records.length - 2] || latest;

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  // Safe percentage change calculator
  const getPctChange = (curr: number, prev: number) => {
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const revChange = getPctChange(latest.revenue, previous.revenue);
  const opexChange = getPctChange(latest.operatingExpenses + latest.cogs, previous.operatingExpenses + previous.cogs);
  const profitChange = getPctChange(latest.netIncome, previous.netIncome);

  // Cards data
  const kpis = [
    {
      id: "rev-kpi",
      title: "Monthly Revenue",
      value: formatCurrency(latest.revenue),
      sub: `${revChange >= 0 ? "+" : ""}${revChange.toFixed(1)}% vs prior month`,
      isPositive: revChange >= 0,
      icon: TrendingUp,
      gradient: "from-emerald-950/40 to-teal-900/10 border-emerald-500/30",
      textColor: "text-emerald-400"
    },
    {
      id: "exp-kpi",
      title: "Monthly Expenses",
      value: formatCurrency(latest.operatingExpenses + latest.cogs),
      sub: `${opexChange >= 0 ? "+" : ""}${opexChange.toFixed(1)}% vs prior month`,
      isPositive: opexChange < 0, // Lower expenses is positive
      icon: Activity,
      gradient: "from-rose-950/40 to-orange-950/10 border-rose-500/30",
      textColor: "text-rose-400"
    },
    {
      id: "net-kpi",
      title: "Net Income",
      value: formatCurrency(latest.netIncome),
      sub: `Net Margin of ${formatPercent(ratios.netMargin)}`,
      isPositive: latest.netIncome >= 0,
      icon: Award,
      gradient: "from-indigo-950/40 to-blue-900/10 border-indigo-500/30",
      textColor: "text-indigo-400"
    },
    {
      id: "cash-kpi",
      title: "Cash Balance",
      value: formatCurrency(metrics.latestCashBalance),
      sub: `${metrics.estimatedRunwayMonths} months estimated runway`,
      isPositive: metrics.estimatedRunwayMonths > 6,
      icon: DollarSign,
      gradient: "from-amber-950/40 to-yellow-950/10 border-amber-500/30",
      textColor: "text-amber-400"
    }
  ];

  // Secondary metrics
  const secondaryKpis = [
    { name: "Operating Cash Flow", value: formatCurrency(latest.operatingCashFlow), label: "OCF", desc: "Cash from operations" },
    { name: "Free Cash Flow", value: formatCurrency(latest.freeCashFlow), label: "FCF", desc: "OCF minus CapEx" },
    { name: "Current Ratio", value: `${ratios.currentRatio.toFixed(2)}x`, label: "CR", desc: "Short term solvency" },
    { name: "Debt to Equity", value: `${ratios.debtToEquity.toFixed(2)}x`, label: "D/E", desc: "Financial leverage" },
    { name: "Gross Margin", value: formatPercent(ratios.grossMargin), label: "GM", desc: "Direct markup" },
    { name: "Working Capital", value: formatCurrency(ratios.workingCapital), label: "WC", desc: "Net operating buffer" }
  ];

  return (
    <div className="space-y-8" id="dashboard-tab-container">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              id={kpi.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`p-6 rounded-2xl border bg-gradient-to-br ${kpi.gradient} backdrop-blur-xl hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-white/10 transition-all duration-300"></div>
              <div className="flex justify-between items-start" id={`${kpi.id}-header`}>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                <div className={`p-2 rounded-lg bg-slate-900/60 border border-slate-700/50 ${kpi.textColor}`} id={`${kpi.id}-icon-bg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4" id={`${kpi.id}-body`}>
                <h3 className="text-3xl font-bold font-sans tracking-tight text-white">{kpi.value}</h3>
                <div className="flex items-center gap-1.5 mt-2" id={`${kpi.id}-sub`}>
                  {kpi.isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${kpi.isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                    {kpi.sub}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Metrics Rail */}
      <motion.div 
        id="secondary-metrics-rail"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
      >
        {secondaryKpis.map((sub, i) => (
          <div key={sub.name} className="flex flex-col border-r border-slate-800 last:border-0 px-3 md:px-4" id={`sec-metric-${i}`}>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">{sub.label}</span>
            <span className="text-sm font-semibold text-slate-400 truncate mt-1" title={sub.name}>{sub.name}</span>
            <span className="text-lg font-bold text-slate-100 mt-1">{sub.value}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 truncate">{sub.desc}</span>
          </div>
        ))}
      </motion.div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-charts-container">
        {/* Revenue & Expenses Area Chart */}
        <motion.div
          id="revenue-expense-chart-container"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 lg:col-span-8 flex flex-col h-[400px]"
        >
          <div className="flex justify-between items-center mb-6" id="chart-header-1">
            <div>
              <h4 className="text-lg font-bold text-slate-100">Revenue & Operating Costs Trend</h4>
              <p className="text-xs text-slate-500">Historical performance scaling monthly cycles</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Zoom
            </span>
          </div>
          <div className="flex-1 w-full" id="rev-exp-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" name="Total Expenses" dataKey={(r) => r.cogs + r.operatingExpenses} stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Profit Bar Chart */}
        <motion.div
          id="monthly-profit-chart-container"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 lg:col-span-4 flex flex-col h-[400px]"
        >
          <div className="mb-6" id="chart-header-2">
            <h4 className="text-lg font-bold text-slate-100">Net Profit Velocity</h4>
            <p className="text-xs text-slate-500">Monthly bottom-line net income bars</p>
          </div>
          <div className="flex-1 w-full" id="profit-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={records} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  formatter={(value: any) => [formatCurrency(Number(value)), "Net Income"]}
                />
                <Bar 
                  dataKey="netIncome" 
                  radius={[4, 4, 0, 0]}
                  fill="#6366f1"
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-lower-grid">
        {/* Cash Balance Trend Line Chart */}
        <motion.div
          id="cash-balance-chart-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex flex-col h-[350px]"
        >
          <div className="flex justify-between items-center mb-6" id="chart-header-3">
            <div>
              <h4 className="text-lg font-bold text-slate-100">Cumulative Liquidity Position</h4>
              <p className="text-xs text-slate-500">Total cash and cash equivalents growth</p>
            </div>
            <div className="text-right" id="latest-cash-indicator">
              <span className="text-xs font-semibold text-slate-500 block">LATEST CASH</span>
              <span className="text-lg font-extrabold text-amber-400">{formatCurrency(latest.cashBalance)}</span>
            </div>
          </div>
          <div className="flex-1 w-full" id="cash-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
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
                  formatter={(value: any) => [formatCurrency(Number(value)), "Cash Balance"]}
                />
                <Area type="monotone" dataKey="cashBalance" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cash Flow Subcomponents Comparison (Operating, Investing, Financing) */}
        <motion.div
          id="cashflow-sub-chart-container"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex flex-col h-[350px]"
        >
          <div className="mb-6" id="chart-header-4">
            <h4 className="text-lg font-bold text-slate-100">Operating, Investing & Financing Profiles</h4>
            <p className="text-xs text-slate-500">Deconstructing historical operational flow vs expansions</p>
          </div>
          <div className="flex-1 w-full" id="sub-cashflow-chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={records} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" name="Operating Cash Flow" dataKey="operatingCashFlow" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Investing (CapEx)" dataKey="investingCashFlow" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" name="Financing Flow" dataKey="financingCashFlow" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
