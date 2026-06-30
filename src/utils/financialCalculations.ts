import { MonthlyFinancialRecord, ForecastRecord, ForecastModelType, FinancialRatio, FinancialSummaryData } from "../types";

/**
 * Summarizes a financial dataset into key aggregates and ratios
 */
export function summarizeFinancialData(records: MonthlyFinancialRecord[]): FinancialSummaryData {
  if (records.length === 0) {
    return {
      records: [],
      ratios: {
        currentRatio: 0, quickRatio: 0, roa: 0, roe: 0, grossMargin: 0,
        operatingMargin: 0, netMargin: 0, debtToEquity: 0, debtRatio: 0,
        interestCoverage: 0, workingCapital: 0
      },
      metrics: {
        totalRevenue: 0, totalExpenses: 0, totalNetProfit: 0, latestCashBalance: 0,
        avgMonthlyBurn: 0, estimatedRunwayMonths: 99
      }
    };
  }

  // Calculate aggregates over the entire dataset
  const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);
  const totalExpenses = records.reduce((sum, r) => sum + r.cogs + r.operatingExpenses, 0);
  const totalNetProfit = records.reduce((sum, r) => sum + r.netIncome, 0);
  
  const latest = records[records.length - 1];
  const latestCashBalance = latest.cashBalance;

  // Calculate Cash Burn Rate (average net outflows over months with negative cash flow, or simply average monthly operating outflow)
  // Standard FP&A definition of net monthly burn: average net cash flow over the last 6 months, if negative.
  const last6Months = records.slice(-6);
  const netFlows = last6Months.map(r => r.netCashFlow);
  const avgNetFlow = netFlows.reduce((sum, val) => sum + val, 0) / Math.max(1, last6Months.length);
  
  // Calculate burn of operational expenses if net flow is positive, to show runway in a stress scenario
  const avgMonthlyOpExpenses = last6Months.reduce((sum, r) => sum + r.operatingExpenses + r.cogs, 0) / Math.max(1, last6Months.length);
  const avgMonthlyBurn = avgNetFlow < 0 ? Math.abs(avgNetFlow) : avgMonthlyOpExpenses * 0.25; // 25% stress of OPEX as synthetic burn if positive cash flow
  
  const estimatedRunwayMonths = avgMonthlyBurn > 0 ? parseFloat((latestCashBalance / avgMonthlyBurn).toFixed(1)) : 99.0;

  // Calculate latest ratios
  const ratios = {
    currentRatio: latest.currentLiabilities > 0 ? latest.currentAssets / latest.currentLiabilities : 0,
    quickRatio: latest.currentLiabilities > 0 ? (latest.currentAssets - latest.inventory) / latest.currentLiabilities : 0,
    roa: latest.totalAssets > 0 ? (latest.netIncome * 12) / latest.totalAssets : 0, // Annualized
    roe: latest.totalEquity > 0 ? (latest.netIncome * 12) / latest.totalEquity : 0, // Annualized
    grossMargin: latest.revenue > 0 ? latest.grossProfit / latest.revenue : 0,
    operatingMargin: latest.revenue > 0 ? latest.ebit / latest.revenue : 0,
    netMargin: latest.revenue > 0 ? latest.netIncome / latest.revenue : 0,
    debtToEquity: latest.totalEquity > 0 ? (latest.shortTermDebt + latest.longTermDebt) / latest.totalEquity : 0,
    debtRatio: latest.totalAssets > 0 ? (latest.shortTermDebt + latest.longTermDebt) / latest.totalAssets : 0,
    interestCoverage: latest.interestExpense > 0 ? latest.ebit / latest.interestExpense : 99,
    workingCapital: latest.currentAssets - latest.currentLiabilities
  };

  return {
    records,
    ratios,
    metrics: {
      totalRevenue,
      totalExpenses,
      totalNetProfit,
      latestCashBalance,
      avgMonthlyBurn,
      estimatedRunwayMonths
    }
  };
}

/**
 * Generates an array of structured ratios with categories, comparison values, and status ratings
 */
export function generateDetailedRatios(records: MonthlyFinancialRecord[]): FinancialRatio[] {
  if (records.length < 2) return [];

  const latest = records[records.length - 1];
  const previous = records[records.length - 2]; // Previous month comparison

  const calcRatios = (r: MonthlyFinancialRecord) => {
    const totalDebt = (r.shortTermDebt || 0) + (r.longTermDebt || 0);
    return {
      currentRatio: r.currentLiabilities > 0 ? r.currentAssets / r.currentLiabilities : 0,
      quickRatio: r.currentLiabilities > 0 ? (r.currentAssets - r.inventory) / r.currentLiabilities : 0,
      roa: r.totalAssets > 0 ? (r.netIncome * 12) / r.totalAssets : 0,
      roe: r.totalEquity > 0 ? (r.netIncome * 12) / r.totalEquity : 0,
      grossMargin: r.revenue > 0 ? r.grossProfit / r.revenue : 0,
      operatingMargin: r.revenue > 0 ? r.ebit / r.revenue : 0,
      netMargin: r.revenue > 0 ? r.netIncome / r.revenue : 0,
      debtRatio: r.totalAssets > 0 ? totalDebt / r.totalAssets : 0,
      debtToEquity: r.totalEquity > 0 ? totalDebt / r.totalEquity : 0,
      interestCoverage: r.interestExpense > 0 ? r.ebit / r.interestExpense : 99,
      workingCapital: r.currentAssets - r.currentLiabilities
    };
  };

  const lR = calcRatios(latest);
  const pR = calcRatios(previous);

  return [
    {
      name: "Current Ratio",
      value: lR.currentRatio,
      previousValue: pR.currentRatio,
      category: "Liquidity",
      unit: "x",
      description: "Measures ability to pay short-term obligations with short-term assets. > 2.0x is robust.",
      status: lR.currentRatio >= 2.0 ? "Good" : lR.currentRatio >= 1.2 ? "Neutral" : "Critical"
    },
    {
      name: "Quick Ratio",
      value: lR.quickRatio,
      previousValue: pR.quickRatio,
      category: "Liquidity",
      unit: "x",
      description: "Stringent liquidity indicator, excluding inventories. > 1.2x is highly safe.",
      status: lR.quickRatio >= 1.2 ? "Good" : lR.quickRatio >= 0.8 ? "Neutral" : "Critical"
    },
    {
      name: "Gross Margin",
      value: lR.grossMargin * 100,
      previousValue: pR.grossMargin * 100,
      category: "Profitability",
      unit: "%",
      description: "Direct production markup efficiency. Higher indicates strong pricing power.",
      status: lR.grossMargin >= 0.60 ? "Good" : lR.grossMargin >= 0.40 ? "Neutral" : "Critical"
    },
    {
      name: "Operating Margin",
      value: lR.operatingMargin * 100,
      previousValue: pR.operatingMargin * 100,
      category: "Profitability",
      unit: "%",
      description: "EBIT as a percentage of Sales. Measures general administrative efficiency.",
      status: lR.operatingMargin >= 0.20 ? "Good" : lR.operatingMargin >= 0.10 ? "Neutral" : "Critical"
    },
    {
      name: "Net Margin",
      value: lR.netMargin * 100,
      previousValue: pR.netMargin * 100,
      category: "Profitability",
      unit: "%",
      description: "Final bottom-line net profit generated from each dollar of revenue.",
      status: lR.netMargin >= 0.15 ? "Good" : lR.netMargin >= 0.05 ? "Neutral" : "Critical"
    },
    {
      name: "Return on Assets (ROA)",
      value: lR.roa * 100,
      previousValue: pR.roa * 100,
      category: "Profitability",
      unit: "%",
      description: "Annualized return on total asset base. High values signal capital efficiency.",
      status: lR.roa >= 0.12 ? "Good" : lR.roa >= 0.05 ? "Neutral" : "Critical"
    },
    {
      name: "Return on Equity (ROE)",
      value: lR.roe * 100,
      previousValue: pR.roe * 100,
      category: "Profitability",
      unit: "%",
      description: "Annualized return on shareholder equity. Heavily watched by institutional investors.",
      status: lR.roe >= 0.20 ? "Good" : lR.roe >= 0.08 ? "Neutral" : "Critical"
    },
    {
      name: "Debt-to-Equity Ratio",
      value: lR.debtToEquity,
      previousValue: pR.debtToEquity,
      category: "Solvency",
      unit: "x",
      description: "Proportion of co-financing via debt. Lower values minimize distress risk. < 1.0x is safe.",
      status: lR.debtToEquity <= 0.8 ? "Good" : lR.debtToEquity <= 1.5 ? "Neutral" : "Critical"
    },
    {
      name: "Debt Ratio",
      value: lR.debtRatio * 100,
      previousValue: pR.debtRatio * 100,
      category: "Solvency",
      unit: "%",
      description: "Percentage of total assets financed by total debt. Benchmark is under 40%.",
      status: lR.debtRatio <= 0.35 ? "Good" : lR.debtRatio <= 0.60 ? "Neutral" : "Critical"
    },
    {
      name: "Interest Coverage Ratio",
      value: lR.interestCoverage,
      previousValue: pR.interestCoverage,
      category: "Solvency",
      unit: "x",
      description: "Ability to service debt interest with EBIT. > 3.0x is highly desirable.",
      status: lR.interestCoverage >= 4.0 ? "Good" : lR.interestCoverage >= 1.5 ? "Neutral" : "Critical"
    },
    {
      name: "Working Capital",
      value: lR.workingCapital,
      previousValue: pR.workingCapital,
      category: "Efficiency",
      unit: "$",
      description: "Net short-term operational funding. Positive indicates immediate trade execution capacity.",
      status: lR.workingCapital > 0 ? "Good" : "Critical"
    }
  ];
}

/**
 * Statistical Forecasting engine (Moving Average, Linear Regression, Exponential Smoothing)
 * Projects cash flows or revenue out 12 months with high-accuracy standard-error bands.
 */
export function forecastFinancials(
  records: MonthlyFinancialRecord[],
  targetField: "cashBalance" | "revenue" | "operatingCashFlow" | "freeCashFlow" = "cashBalance",
  modelType: ForecastModelType = "LINEAR_REGRESSION",
  forecastMonths: number = 12
): ForecastRecord[] {
  if (records.length === 0) return [];

  const historicalValues = records.map(r => r[targetField]);
  const n = historicalValues.length;

  // Initialize output with historical records
  const result: ForecastRecord[] = records.map(r => ({
    month: r.month,
    predicted: r[targetField],
    lowerBound: r[targetField],
    upperBound: r[targetField],
    isForecast: false
  }));

  // Parse the last month and prepare chronological projections
  const lastRecord = records[records.length - 1];
  const lastMonthParts = lastRecord.month.split(" ");
  const monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  let currentMonthIndex = monthsList.indexOf(lastMonthParts[0]);
  let currentYear = parseInt(lastMonthParts[1]);

  const predictions: number[] = [];
  const lowerBounds: number[] = [];
  const upperBounds: number[] = [];

  // 1. Fit statistical models
  if (modelType === "MOVING_AVERAGE") {
    // Standard MA Forecaster with window = 4
    const windowSize = Math.min(4, n);
    let movingHistory = [...historicalValues];
    
    // Compute Standard Error of historical residuals
    let sumSqRes = 0;
    for (let i = windowSize; i < n; i++) {
      const actual = historicalValues[i];
      const pred = historicalValues.slice(i - windowSize, i).reduce((s, v) => s + v, 0) / windowSize;
      sumSqRes += Math.pow(actual - pred, 2);
    }
    const stdErr = Math.sqrt(sumSqRes / Math.max(1, n - windowSize));

    for (let i = 0; i < forecastMonths; i++) {
      const windowVal = movingHistory.slice(-windowSize);
      const nextPred = windowVal.reduce((s, v) => s + v, 0) / windowSize;
      predictions.push(nextPred);
      movingHistory.push(nextPred);

      // Uncertainty expands over time (compounding error)
      const expansionFactor = Math.sqrt(i + 1);
      lowerBounds.push(nextPred - 1.96 * stdErr * expansionFactor);
      upperBounds.push(nextPred + 1.96 * stdErr * expansionFactor);
    }

  } else if (modelType === "EXPONENTIAL_SMOOTHING") {
    // Single Exponential Smoothing with alpha = 0.4
    const alpha = 0.4;
    let s = historicalValues[0];
    
    // Fit historic
    const fitSeries: number[] = [s];
    for (let i = 1; i < n; i++) {
      s = alpha * historicalValues[i] + (1 - alpha) * s;
      fitSeries.push(s);
    }

    // Residual error
    let sumSqRes = 0;
    for (let i = 1; i < n; i++) {
      sumSqRes += Math.pow(historicalValues[i] - fitSeries[i - 1], 2);
    }
    const stdErr = Math.sqrt(sumSqRes / Math.max(1, n - 1));

    const finalValue = fitSeries[fitSeries.length - 1];
    for (let i = 0; i < forecastMonths; i++) {
      predictions.push(finalValue);
      const expansionFactor = Math.sqrt(i + 1);
      lowerBounds.push(finalValue - 1.96 * stdErr * expansionFactor);
      upperBounds.push(finalValue + 1.96 * stdErr * expansionFactor);
    }

  } else {
    // Default: LINEAR_REGRESSION (OLS fitting)
    // Fit y = m * x + c
    let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += historicalValues[i];
      sumXX += i * i;
      sumXY += i * historicalValues[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate standard error of estimate (S_yx)
    let sumSqRes = 0;
    for (let i = 0; i < n; i++) {
      const fitted = slope * i + intercept;
      sumSqRes += Math.pow(historicalValues[i] - fitted, 2);
    }
    const stdErr = Math.sqrt(sumSqRes / Math.max(1, n - 2));

    for (let i = 0; i < forecastMonths; i++) {
      const nextX = n + i;
      const nextPred = slope * nextX + intercept;
      predictions.push(nextPred);

      // Regressive margin of error expands slightly further from pivot mean
      const leverageFactor = 1 + (1 / n) + (12 * Math.pow(nextX - (n - 1) / 2, 2)) / (n * (n * n - 1));
      const predictionStdErr = stdErr * Math.sqrt(Math.max(1, leverageFactor));

      lowerBounds.push(nextPred - 1.96 * predictionStdErr);
      upperBounds.push(nextPred + 1.96 * predictionStdErr);
    }
  }

  // Generate date records for forecasts
  for (let i = 0; i < forecastMonths; i++) {
    currentMonthIndex++;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear++;
    }
    result.push({
      month: `${monthsList[currentMonthIndex]} ${currentYear}`,
      predicted: Math.round(predictions[i]),
      lowerBound: Math.round(lowerBounds[i]),
      upperBound: Math.round(upperBounds[i]),
      isForecast: true
    });
  }

  return result;
}
