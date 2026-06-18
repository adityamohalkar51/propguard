import {
  dailyDDUsagePct,
  targetProgressPct,
  getStatus,
  dailyDollarBuffer,
} from "./rules";

export type Trade = {
  profit: number;
  close_time: string;
};

export type AccountMetrics = {
  dailyUsage: number;
  maxUsage: number;
  targetProgress: number;
  status: "SAFE" | "WATCH" | "DANGER";
  dailyBuffer: number;
  maxBuffer: number;
  todayPnl: number;
  totalPnl: number;
  currentEquity: number;
};

export function computeMetrics(
  trades: Trade[],
  accountSize: number,
  dailyDDPct: number,
  maxDDPct: number,
  targetPct: number
): AccountMetrics {
  const initialBalance = accountSize;
  const totalPnl = trades.reduce((sum, t) => sum + t.profit, 0);
  const currentEquity = initialBalance + totalPnl;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTrades = trades.filter((t) => t.close_time.slice(0, 10) === todayStr);
  const todayPnl = todayTrades.reduce((sum, t) => sum + t.profit, 0);
  const dayStartValue = currentEquity - todayPnl;

  // FTMO: Max Loss = loss from initial balance (simple)
  const maxLossDollars = (maxDDPct / 100) * accountSize;
  const currentLoss = initialBalance - currentEquity;
  const maxUsage = currentLoss > 0 ? (currentLoss / maxLossDollars) * 100 : 0;
  const maxBuffer = maxLossDollars - (currentLoss > 0 ? currentLoss : 0);

  const dailyUsage = dailyDDUsagePct(dayStartValue, currentEquity, accountSize, dailyDDPct);
  const targetProgress = targetProgressPct(currentEquity, initialBalance, accountSize, targetPct);
  const status = getStatus(dailyUsage, maxUsage);
  const dailyBuffer = dailyDollarBuffer(dayStartValue, currentEquity, accountSize, dailyDDPct);

  return {
    dailyUsage,
    maxUsage,
    targetProgress,
    status,
    dailyBuffer,
    maxBuffer,
    todayPnl,
    totalPnl,
    currentEquity,
  };
}
