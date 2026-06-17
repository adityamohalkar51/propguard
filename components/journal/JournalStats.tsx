// components/journal/JournalStats.tsx
'use client';

import React from 'react';
import { JournalStats as Stats } from '@/lib/journal';
import { TrendingUp, TrendingDown, Target, BarChart3, Star, AlertTriangle } from 'lucide-react';

interface JournalStatsProps {
  stats: Stats;
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-[#111110] border border-[#2C2C2A] rounded-lg p-3 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
        <span className="text-[10px] text-[#5F5E5A] uppercase tracking-wider truncate">{label}</span>
      </div>
      <p className="text-[#F1EFE8] font-mono text-base font-medium truncate">{value}</p>
      {subtext && <p className="text-[10px] text-[#5F5E5A] mt-1 truncate">{subtext}</p>}
    </div>
  );
}

export default function JournalStats({ stats }: JournalStatsProps) {
  const winRateColor = stats.winRate >= 50 ? 'text-[#1D9E75]' : 'text-[#EF9F27]';
  const totalPnLColor = stats.totalPnL >= 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Trades"
          value={stats.totalTrades.toString()}
          subtext={`${stats.winRate.toFixed(1)}% win rate`}
          icon={BarChart3}
          color="text-[#85B7EB]"
        />
        <StatCard
          label="Net P&L"
          value={`$${stats.totalPnL.toFixed(2)}`}
          subtext={`Avg $${stats.avgDailyPnL.toFixed(2)}/day`}
          icon={stats.totalPnL >= 0 ? TrendingUp : TrendingDown}
          color={totalPnLColor}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          subtext={`${stats.avgWin.toFixed(2)} avg win · ${stats.avgLoss.toFixed(2)} avg loss`}
          icon={Target}
          color={winRateColor}
        />
        <StatCard
          label="Avg Rating"
          value={stats.avgRating ? stats.avgRating.toFixed(1) : '—'}
          subtext="1-5 scale"
          icon={Star}
          color="text-[#EF9F27]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#1D9E75]" />
            <span className="text-[10px] text-[#1D9E75] uppercase tracking-wider">Best Day</span>
          </div>
          <p className="text-[#1D9E75] font-mono text-base font-medium truncate">+${stats.bestDay.toFixed(2)}</p>
        </div>
        <div className="bg-[#E24B4A]/10 border border-[#E24B4A]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-[#E24B4A]" />
            <span className="text-[10px] text-[#E24B4A] uppercase tracking-wider">Worst Day</span>
          </div>
          <p className="text-[#E24B4A] font-mono text-base font-medium truncate">${stats.worstDay.toFixed(2)}</p>
        </div>
      </div>

      {stats.topMistakes.length > 0 && (
        <div className="bg-[#501313]/20 border border-[#791F1F]/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#E24B4A]" />
            <span className="text-[10px] text-[#E24B4A] uppercase tracking-wider">Top Mistakes</span>
          </div>
          <div className="space-y-1.5">
            {stats.topMistakes.map((m, i) => (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-[#5F5E5A] w-4 flex-shrink-0">{i + 1}.</span>
                  <span className="text-xs text-[#F1EFE8] truncate">{m.label}</span>
                </div>
                <span className="text-xs text-[#E24B4A] font-mono flex-shrink-0">{m.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topSetups.length > 0 && (
        <div className="bg-[#04342C]/20 border border-[#1D9E75]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3.5 h-3.5 text-[#1D9E75]" />
            <span className="text-[10px] text-[#1D9E75] uppercase tracking-wider">Top Setups</span>
          </div>
          <div className="space-y-1.5">
            {stats.topSetups.map((s, i) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-[#5F5E5A] w-4 flex-shrink-0">{i + 1}.</span>
                  <span className="text-xs text-[#F1EFE8] truncate">{s.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-[#5F5E5A]">{s.winRate.toFixed(0)}% WR</span>
                  <span className="text-xs text-[#85B7EB] font-mono">{s.count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}