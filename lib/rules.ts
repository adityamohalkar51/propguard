export type DDBasis = "balance" | "equity";
export type MaxDDMode = "static" | "trailing";
export type Status = "SAFE" | "WATCH" | "DANGER";

export type AccountRules = {
  accountSize: number;
  dailyDDPct: number;
  maxDDPct: number;
  targetPct: number;
  ddBasis?: DDBasis;
  maxDDMode?: MaxDDMode;
};

export type DailyResult = {
  date: string;
  startBalance: number;
  endBalance: number;
  pnl: number;
};

/**
 * Daily loss = day-start value - current equity (only positive if loss)
 */
export function dailyLoss(dayStartValue: number, currentEquity: number): number {
  const diff = dayStartValue - currentEquity;
  return diff > 0 ? diff : 0;
}

/**
 * Daily DD usage as a percentage of the daily DD limit (0-100+)
 */
export function dailyDDUsagePct(
  dayStartValue: number,
  currentEquity: number,
  accountSize: number,
  dailyDDPct: number
): number {
  const loss = dailyLoss(dayStartValue, currentEquity);
  const limitDollars = (dailyDDPct / 100) * accountSize;
  if (limitDollars <= 0) return 0;
  return (loss / limitDollars) * 100;
}

/**
 * Max drawdown loss in dollars.
 * static: from initial account size
 * trailing: from the highest equity ever reached
 */
export function maxDDLoss(
  currentEquity: number,
  initialBalance: number,
  highestEquity: number,
  mode: MaxDDMode = "static"
): number {
  const reference = mode === "trailing" ? Math.max(highestEquity, initialBalance) : initialBalance;
  const diff = reference - currentEquity;
  return diff > 0 ? diff : 0;
}

/**
 * Max DD usage as a percentage of the max DD limit (0-100+)
 */
export function maxDDUsagePct(
  currentEquity: number,
  initialBalance: number,
  highestEquity: number,
  accountSize: number,
  maxDDPct: number,
  mode: MaxDDMode = "static"
): number {
  const loss = maxDDLoss(currentEquity, initialBalance, highestEquity, mode);
  const limitDollars = (maxDDPct / 100) * accountSize;
  if (limitDollars <= 0) return 0;
  return (loss / limitDollars) * 100;
}

/**
 * Profit target progress as a percentage of the target (0-100+)
 */
export function targetProgressPct(
  currentEquity: number,
  initialBalance: number,
  accountSize: number,
  targetPct: number
): number {
  const profit = currentEquity - initialBalance;
  const targetDollars = (targetPct / 100) * accountSize;
  if (targetDollars <= 0) return 0;
  const pct = (profit / targetDollars) * 100;
  return pct > 0 ? pct : 0;
}

/**
 * Status based on the highest usage among daily DD and max DD.
 * SAFE < 50%, WATCH 50-80%, DANGER > 80%
 */
export function getStatus(dailyUsagePct: number, maxUsagePct: number): Status {
  const worst = Math.max(dailyUsagePct, maxUsagePct);
  if (worst > 80) return "DANGER";
  if (worst >= 50) return "WATCH";
  return "SAFE";
}

/**
 * Dollar buffer remaining before a daily DD breach.
 * Positive = safe amount of additional loss allowed.
 * Negative = already breached by this amount.
 */
export function dailyDollarBuffer(
  dayStartValue: number,
  currentEquity: number,
  accountSize: number,
  dailyDDPct: number
): number {
  const loss = dailyLoss(dayStartValue, currentEquity);
  const limitDollars = (dailyDDPct / 100) * accountSize;
  return limitDollars - loss;
}

/**
 * Dollar buffer remaining before a max DD breach.
 */
export function maxDollarBuffer(
  currentEquity: number,
  initialBalance: number,
  highestEquity: number,
  accountSize: number,
  maxDDPct: number,
  mode: MaxDDMode = "static"
): number {
  const loss = maxDDLoss(currentEquity, initialBalance, highestEquity, mode);
  const limitDollars = (maxDDPct / 100) * accountSize;
  return limitDollars - loss;
}