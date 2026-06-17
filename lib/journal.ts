// lib/journal.ts
// NO external import — all types defined here

export interface Trade {
  id: string;
  account_id: string;
  ticket: string | null;
  symbol: string | null;
  side: string | null;
  open_time: string | null;
  close_time: string | null;
  lots: number | null;
  profit: number;
  created_at: string;
  notes?: string | null;
  rating?: number | null;
  mistakes?: string[] | null;
  setup_tags?: string[] | null;
  r_multiple?: number | null;
  entry_screenshot_url?: string | null;
  exit_screenshot_url?: string | null;
}

export interface JournalEntry {
  trade_id: string;
  notes: string;
  rating: number;
  mistakes: string[];
  setup_tags: string[];
  r_multiple: number | null;
}

export interface DailyPnL {
  date: string;
  pnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  bestTrade: number;
  worstTrade: number;
  avgRating: number | null;
  mistakes: string[];
  trades: Trade[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: DailyPnL[];
}

export interface JournalStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number | null;
  bestDay: number;
  worstDay: number;
  avgDailyPnL: number;
  totalPnL: number;
  avgRating: number | null;
  topMistakes: { label: string; count: number }[];
  topSetups: { label: string; count: number; winRate: number }[];
}

export const MISTAKE_OPTIONS = [
  'Overtrading',
  'Revenge Trading',
  'Moving Stop Loss',
  'FOMO Entry',
  'No Trade Plan',
  'Wrong Position Size',
  'Trading News',
  'Ignored Setup Rules',
  'Emotional Decision',
  'Chased Price',
];

export const SETUP_OPTIONS = [
  'Breakout',
  'Pullback',
  'Trend Continuation',
  'Reversal',
  'Support/Resistance',
  'Supply/Demand',
  'Moving Average Bounce',
  'Pattern (H&S, DB)',
  'News/Event',
  'Scalp',
];

export function groupTradesByDay(trades: Trade[]): Map<string, Trade[]> {
  const map = new Map<string, Trade[]>();
  
  for (const trade of trades) {
    if (!trade.close_time) continue;
    const date = new Date(trade.close_time).toISOString().split('T')[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(trade);
  }
  
  return map;
}

export function computeDailyPnL(trades: Trade[]): DailyPnL[] {
  const grouped = groupTradesByDay(trades);
  const days: DailyPnL[] = [];
  
  for (const [date, dayTrades] of Array.from(grouped)) {
    const pnl = dayTrades.reduce((sum: number, t: Trade) => sum + (t.profit || 0), 0);
    const wins = dayTrades.filter((t: Trade) => (t.profit || 0) > 0);
    const losses = dayTrades.filter((t: Trade) => (t.profit || 0) < 0);
    const ratings = dayTrades.filter((t: Trade) => t.rating).map((t: Trade) => t.rating!);
    
    const allMistakes = dayTrades.flatMap((t: Trade) => t.mistakes || []);
    const mistakeCounts = new Map<string, number>();
    allMistakes.forEach((m: string) => mistakeCounts.set(m, (mistakeCounts.get(m) || 0) + 1));
    
    days.push({
      date,
      pnl,
      tradeCount: dayTrades.length,
      winCount: wins.length,
      lossCount: losses.length,
      bestTrade: Math.max(...dayTrades.map((t: Trade) => t.profit || 0)),
      worstTrade: Math.min(...dayTrades.map((t: Trade) => t.profit || 0)),
      avgRating: ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null,
      mistakes: Array.from(new Set(allMistakes)),
      trades: dayTrades,
    });
  }
  
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

export function getCalendarMonth(
  trades: Trade[],
  year: number,
  month: number
): CalendarMonth {
  const daily = computeDailyPnL(trades);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  
  const days: DailyPnL[] = [];
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      date: '',
      pnl: 0,
      tradeCount: 0,
      winCount: 0,
      lossCount: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgRating: null,
      mistakes: [],
      trades: [],
    });
  }
  
  const dailyMap = new Map(daily.map(d => [d.date, d]));
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = dailyMap.get(dateStr);
    
    if (existing) {
      days.push(existing);
    } else {
      days.push({
        date: dateStr,
        pnl: 0,
        tradeCount: 0,
        winCount: 0,
        lossCount: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgRating: null,
        mistakes: [],
        trades: [],
      });
    }
  }
  
  return { year, month, days };
}

export function computeJournalStats(trades: Trade[]): JournalStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      avgRR: null,
      bestDay: 0,
      worstDay: 0,
      avgDailyPnL: 0,
      totalPnL: 0,
      avgRating: null,
      topMistakes: [],
      topSetups: [],
    };
  }
  
  const wins = trades.filter((t: Trade) => (t.profit || 0) > 0);
  const losses = trades.filter((t: Trade) => (t.profit || 0) < 0);
  
  const totalWin = wins.reduce((s: number, t: Trade) => s + (t.profit || 0), 0);
  const totalLoss = Math.abs(losses.reduce((s: number, t: Trade) => s + (t.profit || 0), 0));
  
  const daily = computeDailyPnL(trades);
  const dailyPnLs = daily.map((d: DailyPnL) => d.pnl);
  
  const ratings = trades.filter((t: Trade) => t.rating).map((t: Trade) => t.rating!);
  
  const allMistakes = trades.flatMap((t: Trade) => t.mistakes || []);
  const mistakeCounts = new Map<string, number>();
  allMistakes.forEach((m: string) => mistakeCounts.set(m, (mistakeCounts.get(m) || 0) + 1));
  const topMistakes = Array.from(mistakeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
  
  const allSetups = trades.flatMap((t: Trade) => t.setup_tags || []);
  const setupCounts = new Map<string, { count: number; wins: number }>();
  allSetups.forEach((s: string) => {
    const existing = setupCounts.get(s) || { count: 0, wins: 0 };
    existing.count++;
    setupCounts.set(s, existing);
  });
  
  trades.forEach((t: Trade) => {
    if ((t.profit || 0) > 0) {
      (t.setup_tags || []).forEach((s: string) => {
        const existing = setupCounts.get(s)!;
        existing.wins++;
      });
    }
  });
  
  const topSetups = Array.from(setupCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([label, { count, wins }]) => ({ label, count, winRate: count > 0 ? (wins / count) * 100 : 0 }));
  
  return {
    totalTrades: trades.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    profitFactor: totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? Infinity : 0,
    avgWin: wins.length > 0 ? totalWin / wins.length : 0,
    avgLoss: losses.length > 0 ? totalLoss / losses.length : 0,
    avgRR: null,
    bestDay: dailyPnLs.length > 0 ? Math.max(...dailyPnLs) : 0,
    worstDay: dailyPnLs.length > 0 ? Math.min(...dailyPnLs) : 0,
    avgDailyPnL: dailyPnLs.length > 0 ? dailyPnLs.reduce((a: number, b: number) => a + b, 0) / dailyPnLs.length : 0,
    totalPnL: trades.reduce((s: number, t: Trade) => s + (t.profit || 0), 0),
    avgRating: ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : null,
    topMistakes,
    topSetups,
  };
}

export function getPnLColor(pnl: number, intensity: 'bg' | 'text' = 'bg'): string {
  if (pnl > 0) return intensity === 'bg' ? 'bg-[#1D9E75]/20 text-[#1D9E75]' : 'text-[#1D9E75]';
  if (pnl < 0) return intensity === 'bg' ? 'bg-[#E24B4A]/20 text-[#E24B4A]' : 'text-[#E24B4A]';
  return intensity === 'bg' ? 'bg-[#2C2C2A] text-[#5F5E5A]' : 'text-[#5F5E5A]';
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-[#1D9E75]';
  if (rating >= 3) return 'text-[#EF9F27]';
  return 'text-[#E24B4A]';
}