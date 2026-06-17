import {
  dailyLoss,
  dailyDDUsagePct,
  maxDDLoss,
  maxDDUsagePct,
  targetProgressPct,
  getStatus,
  dailyDollarBuffer,
  maxDollarBuffer,
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

  const highestEquity = trades.reduce((max, t, i) => {
    const eq = initialBalance + trades.slice(0, i + 1).reduce((s, x) => s + x.profit, 0);
    return eq > max ? eq : max;
  }, initialBalance);

  const dailyUsage = dailyDDUsagePct(dayStartValue, currentEquity, accountSize, dailyDDPct);
  const maxUsage = maxDDUsagePct(currentEquity, initialBalance, highestEquity, accountSize, maxDDPct, "static");
  const targetProgress = targetProgressPct(currentEquity, initialBalance, accountSize, targetPct);
  const status = getStatus(dailyUsage, maxUsage);
  const dailyBuffer = dailyDollarBuffer(dayStartValue, currentEquity, accountSize, dailyDDPct);
  const maxBuffer = maxDollarBuffer(currentEquity, initialBalance, highestEquity, accountSize, maxDDPct, "static");

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
