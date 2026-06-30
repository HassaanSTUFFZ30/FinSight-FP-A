export interface MonthlyFinancialRecord {
  month: string; // e.g., "Jan 2024", "Feb 2024"
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number; // SG&A, R&D, Marketing, etc.
  ebit: number; // Operating Income
  interestExpense: number;
  taxExpense: number;
  netIncome: number;
  
  // Cash Flow
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  cashBalance: number;
  freeCashFlow: number; // OCF - CapEx
  capex: number;

  // Balance Sheet
  totalAssets: number;
  currentAssets: number;
  cashAndEquivalents: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  nonCurrentAssets: number; // PP&E, Intangibles, etc.

  totalLiabilities: number;
  currentLiabilities: number;
  accountsPayable: number;
  shortTermDebt: number;
  otherCurrentLiabilities: number;
  longTermDebt: number;

  totalEquity: number;
  retainedEarnings: number;
  shareCapital: number;

  // Additional Metrics
  workingCapital: number;
}

export type ForecastModelType = "MOVING_AVERAGE" | "LINEAR_REGRESSION" | "EXPONENTIAL_SMOOTHING";

export interface ForecastRecord {
  month: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
  isForecast: boolean;
}

export interface FinancialRatio {
  name: string;
  value: number;
  previousValue: number;
  category: "Liquidity" | "Profitability" | "Solvency" | "Efficiency";
  unit: string | "%" | "x";
  description: string;
  status: "Good" | "Neutral" | "Critical";
}

export interface FinancialSummaryData {
  records: MonthlyFinancialRecord[];
  ratios: {
    currentRatio: number;
    quickRatio: number;
    roa: number;
    roe: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    debtToEquity: number;
    debtRatio: number;
    interestCoverage: number;
    workingCapital: number;
  };
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    totalNetProfit: number;
    latestCashBalance: number;
    avgMonthlyBurn: number;
    estimatedRunwayMonths: number;
  };
}
