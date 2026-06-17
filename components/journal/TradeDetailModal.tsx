// components/journal/TradeDetailModal.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import MistakeTag from './MistakeTag';
import { MISTAKE_OPTIONS, SETUP_OPTIONS } from '@/lib/journal';
import { supabase } from '@/lib/supabase';

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
  entry_screenshot_url?: string | null;
  exit_screenshot_url?: string | null;
}

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
}

export default function TradeDetailModal({
  trade,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TradeDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [setups, setSetups] = useState<string[]>([]);
  const [rMultiple, setRMultiple] = useState<string>('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (trade) {
      setNotes(trade.notes || '');
      setRating(trade.rating || null);
      setMistakes(trade.mistakes || []);
      setSetups(trade.setup_tags || []);
      setRMultiple(trade.r_multiple?.toString() || '');
    }
  }, [trade]);

  const toggleMistake = useCallback((m: string) => {
    setMistakes(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  }, []);

  const toggleSetup = useCallback((s: string) => {
    setSetups(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  }, []);

  const handleSave = async () => {
    if (!trade) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('trades')
      .update({
        notes: notes.trim() || null,
        rating,
        mistakes: mistakes.length > 0 ? mistakes : null,
        setup_tags: setups.length > 0 ? setups : null,
        r_multiple: rMultiple ? parseFloat(rMultiple) : null,
      })
      .eq('id', trade.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert('Error saving: ' + error.message);
      return;
    }

    onUpdate(data as Trade);
    onClose();
  };

  const handleDelete = async () => {
    if (!trade || !onDelete) return;
    if (!confirm('Delete this trade? This cannot be undone.')) return;

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', trade.id);

    if (error) {
      alert('Error deleting: ' + error.message);
      return;
    }

    onDelete(trade.id);
    onClose();
  };

  if (!isOpen || !trade) return null;

  const profitClass = (trade.profit || 0) >= 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]';
  const isWin = (trade.profit || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2C2C2A]">
          <div>
            <h3 className="text-[#F1EFE8] font-medium text-sm">
              {trade.symbol || 'Unknown'} — {trade.side?.toUpperCase() || 'TRADE'}
            </h3>
            <p className="text-[#5F5E5A] text-xs mt-0.5">
              Ticket #{trade.ticket || 'N/A'} · {trade.lots} lots
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5F5E5A] hover:text-[#F1EFE8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trade Info */}
        <div className="p-4 grid grid-cols-2 gap-3 text-xs border-b border-[#2C2C2A]">
          <div>
            <span className="text-[#5F5E5A] uppercase tracking-wider text-[10px]">Open</span>
            <p className="text-[#F1EFE8] mt-0.5 font-mono">
              {trade.open_time ? new Date(trade.open_time).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-[#5F5E5A] uppercase tracking-wider text-[10px]">Close</span>
            <p className="text-[#F1EFE8] mt-0.5 font-mono">
              {trade.close_time ? new Date(trade.close_time).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-[#5F5E5A] uppercase tracking-wider text-[10px]">P&L</span>
            <p className={`${profitClass} mt-0.5 font-mono font-medium`}>
              ${trade.profit?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <span className="text-[#5F5E5A] uppercase tracking-wider text-[10px]">R Multiple</span>
            <input
              type="number"
              step="0.01"
              value={rMultiple}
              onChange={(e) => setRMultiple(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full bg-[#111110] border border-[#2C2C2A] rounded px-2 py-1 mt-0.5 text-[#F1EFE8] font-mono text-xs focus:border-[#534AB7] focus:outline-none"
            />
          </div>
        </div>

        {/* Rating */}
        <div className="p-4 border-b border-[#2C2C2A]">
          <label className="text-[#5F5E5A] uppercase tracking-wider text-[10px] block mb-2">
            Trade Rating
          </label>
          <StarRating rating={rating} onChange={setRating} interactive size="lg" />
        </div>

        {/* Setup Tags */}
        <div className="p-4 border-b border-[#2C2C2A]">
          <label className="text-[#5F5E5A] uppercase tracking-wider text-[10px] block mb-2">
            Setup / Strategy
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SETUP_OPTIONS.map(setup => (
              <MistakeTag
                key={setup}
                label={setup}
                selected={setups.includes(setup)}
                onClick={() => toggleSetup(setup)}
                color="#378ADD"
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Mistakes */}
        <div className="p-4 border-b border-[#2C2C2A]">
          <label className="text-[#5F5E5A] uppercase tracking-wider text-[10px] block mb-2">
            Mistakes Made
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MISTAKE_OPTIONS.map(mistake => (
              <MistakeTag
                key={mistake}
                label={mistake}
                selected={mistakes.includes(mistake)}
                onClick={() => toggleMistake(mistake)}
                color="#E24B4A"
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="p-4 border-b border-[#2C2C2A]">
          <label className="text-[#5F5E5A] uppercase tracking-wider text-[10px] block mb-2">
            Trade Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What worked? What didn't? Lessons learned..."
            rows={4}
            className="w-full bg-[#111110] border border-[#2C2C2A] rounded-lg px-3 py-2 text-[#F1EFE8] text-xs placeholder-[#5F5E5A] focus:border-[#534AB7] focus:outline-none resize-none"
          />
        </div>

        {/* Actions */}
        <div className="p-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#534AB7] hover:bg-[#534AB7]/90 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Journal Entry'}
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 border border-[#791F1F] text-[#E24B4A] hover:bg-[#501313]/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}