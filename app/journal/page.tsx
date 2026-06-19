// app/journal/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { computeJournalStats } from '@/lib/journal';
import CalendarView from '@/components/journal/CalendarView';
import JournalStats from '@/components/journal/JournalStats';
import TradeList from '@/components/journal/TradeList';
import TradeDetailModal from '@/components/journal/TradeDetailModal';
import { BookOpen, LayoutGrid, List, ChevronLeft, Loader2 } from 'lucide-react';

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
  strategy_id?: string | null;
}

interface Account {
  id: string;
  user_id: string;
  firm: string;
  label: string | null;
  account_size: number;
  created_at: string;
}

interface Strategy {
  id: string;
  name: string;
  color: string;
}

type ViewMode = 'calendar' | 'list';

export default function JournalPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedStrategy, setSelectedStrategy] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchAccounts();
    fetchStrategies();
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [selectedAccount]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const fetchAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('accounts')
      .select('id, user_id, firm, label, account_size, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return;
    }

    setAccounts(data || []);
  };

  const fetchStrategies = async () => {
    const { data, error } = await supabase
      .from('strategies')
      .select('id, name, color')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching strategies:', error);
      return;
    }

    setStrategies(data || []);
  };

  const fetchTrades = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from('trades')
      .select('id, account_id, ticket, symbol, side, open_time, close_time, lots, profit, created_at, notes, rating, mistakes, setup_tags, r_multiple, strategy_id')
      .order('close_time', { ascending: false });

    if (selectedAccount !== 'all') {
      query = query.eq('account_id', selectedAccount);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching trades:', error);
      setLoading(false);
      return;
    }

    setTrades(data || []);
    setLoading(false);
  };

  const handleTradeUpdate = useCallback((updatedTrade: Trade) => {
    setTrades((prev) => prev.map((t) => t.id === updatedTrade.id ? updatedTrade : t));
  }, []);

  const handleTradeDelete = useCallback((tradeId: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
  }, []);

  const filteredTrades = selectedStrategy === 'all'
    ? trades
    : selectedStrategy === 'none'
      ? trades.filter((t) => !t.strategy_id)
      : trades.filter((t) => t.strategy_id === selectedStrategy);

  const stats = computeJournalStats(filteredTrades);

  return (
    <div className="min-h-screen bg-[#111110]">
      <header className="border-b border-[#2C2C2A] bg-[#1A1A18]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-1.5 hover:bg-[#2C2C2A] rounded-lg text-[#5F5E5A] hover:text-[#F1EFE8] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#26215C] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[#AFA9EC]" />
              </div>
              <h1 className="text-[#F1EFE8] font-medium text-sm">Trade Journal</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-[#111110] border border-[#2C2C2A] rounded-lg px-3 py-1.5 text-xs text-[#F1EFE8] focus:border-[#534AB7] focus:outline-none"
            >
              <option value="all">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.label || acc.firm} (${acc.account_size})
                </option>
              ))}
            </select>

            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="bg-[#111110] border border-[#2C2C2A] rounded-lg px-3 py-1.5 text-xs text-[#F1EFE8] focus:border-[#534AB7] focus:outline-none"
            >
              <option value="all">All Strategies</option>
              <option value="none">No Strategy</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="flex bg-[#111110] border border-[#2C2C2A] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-[#2C2C2A] text-[#F1EFE8]' : 'text-[#5F5E5A] hover:text-[#888780]'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#2C2C2A] text-[#F1EFE8]' : 'text-[#5F5E5A] hover:text-[#888780]'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-[#534AB7] animate-spin" />
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-[#2C2C2A] mx-auto mb-3" />
            <h3 className="text-[#F1EFE8] text-sm font-medium mb-1">No trades yet</h3>
            <p className="text-[#5F5E5A] text-xs max-w-xs mx-auto">
              Import trades from your MT5 report in the account detail page to start journaling.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-[#534AB7] hover:bg-[#534AB7]/90 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-[#2C2C2A] mx-auto mb-3" />
            <h3 className="text-[#F1EFE8] text-sm font-medium mb-1">No trades match this filter</h3>
            <p className="text-[#5F5E5A] text-xs max-w-xs mx-auto">
              Try a different strategy or account filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <JournalStats stats={stats} />
            </div>

            <div className="lg:col-span-2">
              {viewMode === 'calendar' ? (
                <CalendarView 
                  trades={filteredTrades} 
                  onDayClick={() => setViewMode('list')}
                />
              ) : (
                <TradeList 
                  trades={filteredTrades} 
                  onTradeClick={(trade: Trade) => {
                    setSelectedTrade(trade);
                    setIsModalOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <TradeDetailModal
        trade={selectedTrade}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrade(null);
        }}
        onUpdate={handleTradeUpdate}
        onDelete={handleTradeDelete}
      />
    </div>
  );
}
