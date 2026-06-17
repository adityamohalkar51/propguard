// components/journal/CalendarView.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarMonth, getPnLColor } from '@/lib/journal';

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

interface CalendarViewProps {
  trades: Trade[];
  onDayClick?: (date: string, trades: Trade[]) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ trades, onDayClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendar = useMemo(() => getCalendarMonth(trades, year, month), [trades, year, month]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-[#2C2C2A] rounded-lg text-[#5F5E5A] hover:text-[#F1EFE8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-[#F1EFE8] font-medium text-sm">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-[#2C2C2A] rounded-lg text-[#5F5E5A] hover:text-[#F1EFE8] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_DAYS.map(day => (
          <div key={day} className="text-center text-[10px] text-[#5F5E5A] uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendar.days.map((day, idx) => {
          const isToday = day.date === todayStr;
          const hasTrades = day.tradeCount > 0;
          const isEmpty = !day.date;

          return (
            <button
              key={idx}
              onClick={() => day.date && hasTrades && onDayClick?.(day.date, day.trades)}
              disabled={!hasTrades}
              className={`
                relative aspect-square rounded-lg p-1 flex flex-col items-center justify-center
                transition-all duration-150
                ${isEmpty ? 'invisible' : ''}
                ${hasTrades ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                ${isToday ? 'ring-1 ring-[#534AB7]' : ''}
                ${hasTrades ? getPnLColor(day.pnl, 'bg') : 'bg-[#111110]'}
              `}
            >
              <span className={`text-xs font-mono ${isToday ? 'text-[#534AB7] font-medium' : 'text-[#888780]'}`}>
                {day.date ? parseInt(day.date.split('-')[2]) : ''}
              </span>
              
              {hasTrades && (
                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                  <span className={`text-[10px] font-mono font-medium ${day.pnl >= 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
                    {day.pnl >= 0 ? '+' : ''}{day.pnl.toFixed(0)}
                  </span>
                  <span className="text-[8px] text-[#5F5E5A]">
                    {day.tradeCount}t
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[#2C2C2A]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75]/20" />
          <span className="text-[10px] text-[#5F5E5A]">Profit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#E24B4A]/20" />
          <span className="text-[10px] text-[#5F5E5A]">Loss</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#2C2C2A]" />
          <span className="text-[10px] text-[#5F5E5A]">No Trades</span>
        </div>
      </div>
    </div>
  );
}