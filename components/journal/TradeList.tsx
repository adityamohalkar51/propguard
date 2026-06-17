// components/journal/TradeList.tsx
'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import StarRating from './StarRating';

interface Trade {
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
}

interface TradeListProps {
  trades: Trade[];
  onTradeClick: (trade: Trade) => void;
}

export default function TradeList({ trades, onTradeClick }: TradeListProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-[#5F5E5A] text-xs">
        No trades found. Import an MT5 report to get started.
      </div>
    );
  }

  const grouped = new Map<string, Trade[]>();
  for (const trade of trades) {
    const date = trade.close_time 
      ? new Date(trade.close_time).toISOString().split('T')[0]
      : 'Unknown';
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(trade);
  }

  const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {sortedDates.map(date => {
        const dayTrades = grouped.get(date)!;
        const dayPnL = dayTrades.reduce((s, t) => s + (t.profit || 0), 0);
        const dayColor = dayPnL >= 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]';

        return (
          <div key={date} className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-[#111110] border-b border-[#2C2C2A]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-[#5F5E5A]" />
                <span className="text-xs text-[#888780] font-mono">
                  {date === 'Unknown' ? 'Unknown Date' : new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <span className={`text-xs font-mono font-medium ${dayColor}`}>
                {dayPnL >= 0 ? '+' : ''}${dayPnL.toFixed(2)} · {dayTrades.length} trades
              </span>
            </div>

            <div className="divide-y divide-[#2C2C2A]/50">
              {dayTrades.map(trade => {
                const isWin = (trade.profit || 0) > 0;
                const profitColor = isWin ? 'text-[#1D9E75]' : 'text-[#E24B4A]';

                return (
                  <button
                    key={trade.id}
                    onClick={() => onTradeClick(trade)}
                    className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#2C2C2A]/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1 h-8 rounded-full ${isWin ? 'bg-[#1D9E75]' : 'bg-[#E24B4A]'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#F1EFE8] font-medium">
                            {trade.symbol || 'Unknown'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.side?.toLowerCase() === 'buy' ? 'bg-[#1D9E75]/20 text-[#1D9E75]' : 'bg-[#E24B4A]/20 text-[#E24B4A]'}`}>
                            {trade.side?.toUpperCase() || 'N/A'}
                          </span>
                          {trade.rating && (
                            <StarRating rating={trade.rating} size="sm" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#5F5E5A]">
                            {trade.lots} lots
                          </span>
                          {trade.mistakes && trade.mistakes.length > 0 && (
                            <span className="text-[10px] text-[#E24B4A]">
                              {trade.mistakes.length} mistake{trade.mistakes.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {trade.setup_tags && trade.setup_tags.length > 0 && (
                            <span className="text-[10px] text-[#378ADD]">
                              {trade.setup_tags[0]}
                              {trade.setup_tags.length > 1 && ` +${trade.setup_tags.length - 1}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className={`text-sm font-mono font-medium ${profitColor}`}>
                        {isWin ? '+' : ''}${trade.profit?.toFixed(2) || '0.00'}
                      </p>
                      {trade.r_multiple && (
                        <p className="text-[10px] text-[#5F5E5A] font-mono">
                          {trade.r_multiple > 0 ? '+' : ''}{trade.r_multiple}R
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}