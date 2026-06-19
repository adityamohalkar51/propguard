// components/journal/TradeDetailModal.tsx
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Save, Trash2, Upload, ImageOff } from 'lucide-react';
import StarRating from './StarRating';
import MistakeTag from './MistakeTag';
import { MISTAKE_OPTIONS, SETUP_OPTIONS } from '@/lib/journal';
import { createBrowserClient } from '@supabase/ssr';
import StrategyBadge from '@/components/StrategyBadge';

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
  strategy_id?: string | null;
}

interface Strategy {
  id: string;
  name: string;
  color: string;
}

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
}

type ScreenshotKind = 'entry' | 'exit';

export default function TradeDetailModal({
  trade,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TradeDetailModalProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [setups, setSetups] = useState<string[]>([]);
  const [rMultiple, setRMultiple] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [strategyId, setStrategyId] = useState<string | null>(null);

  const [entryUrl, setEntryUrl] = useState<string | null>(null);
  const [exitUrl, setExitUrl] = useState<string | null>(null);
  const [uploadingEntry, setUploadingEntry] = useState(false);
  const [uploadingExit, setUploadingExit] = useState(false);
  const entryInputRef = useRef<HTMLInputElement>(null);
  const exitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadStrategies() {
      const { data } = await supabase
        .from('strategies')
        .select('id, name, color')
        .order('created_at', { ascending: true });
      if (data) setStrategies(data);
    }
    if (isOpen) loadStrategies();
  }, [isOpen]);

  React.useEffect(() => {
    if (trade) {
      setNotes(trade.notes || '');
      setRating(trade.rating || null);
      setMistakes(trade.mistakes || []);
      setSetups(trade.setup_tags || []);
      setRMultiple(trade.r_multiple?.toString() || '');
      setStrategyId(trade.strategy_id || null);
      setEntryUrl(trade.entry_screenshot_url || null);
      setExitUrl(trade.exit_screenshot_url || null);
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

  const handleScreenshotUpload = async (kind: ScreenshotKind, file: File) => {
    if (!trade) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const setUploading = kind === 'entry' ? setUploadingEntry : setUploadingExit;
    const setUrl = kind === 'entry' ? setEntryUrl : setExitUrl;

    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${trade.account_id}/${trade.id}-${kind}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert('Error uploading: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from('trade-screenshots')
      .getPublicUrl(path);

    const column = kind === 'entry' ? 'entry_screenshot_url' : 'exit_screenshot_url';

    const { error: dbError } = await supabase
      .from('trades')
      .update({ [column]: publicData.publicUrl })
      .eq('id', trade.id);

    setUploading(false);

    if (dbError) {
      alert('Error saving screenshot: ' + dbError.message);
      return;
    }

    setUrl(publicData.publicUrl);
  };

  const handleScreenshotRemove = async (kind: ScreenshotKind) => {
    if (!trade) return;
    const column = kind === 'entry' ? 'entry_screenshot_url' : 'exit_screenshot_url';
    const setUrl = kind === 'entry' ? setEntryUrl : setExitUrl;

    const { error } = await supabase
      .from('trades')
      .update({ [column]: null })
      .eq('id', trade.id);

    if (error) {
      alert('Error removing screenshot: ' + error.message);
      return;
    }

    setUrl(null);
  };

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
        strategy_id: strategyId || null,
      })
      .eq('id', trade.id)
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert('Error saving: ' + error.message);
      return;
    }

    onUpdate({ ...(data as Trade), entry_screenshot_url: entryUrl, exit_screenshot_url: exitUrl });
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

  const renderScreenshotBox = (kind: ScreenshotKind) => {
    const url = kind === 'entry' ? entryUrl : exitUrl;
    const uploading = kind === 'entry' ? uploadingEntry : uploadingExit;
    const inputRef = kind === 'entry' ? entryInputRef : exitInputRef;
    const label = kind === 'entry' ? 'Entry' : 'Exit';

    return (
      <div>
        <span className="text-[#5F5E5A] uppercase tracking-wider text-[10px] block mb-1.5">
          {label} Screenshot
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleScreenshotUpload(kind, file);
            e.target.value = '';
          }}
        />
        {url ? (
          <div className="relative group">
            <img
              src={url}
              alt={`${label} screenshot`}
              className="w-full h-28 object-cover rounded-lg border border-[#2C2C2A] cursor-pointer"
              onClick={() => window.open(url, '_blank')}
            />
            <button
              onClick={() => handleScreenshotRemove(kind)}
              className="absolute top-1.5 right-1.5 bg-[#111110]/90 hover:bg-[#501313] text-[#E24B4A] rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ImageOff className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-28 border border-dashed border-[#2C2C2A] hover:border-[#534AB7] rounded-lg flex flex-col items-center justify-center gap-1.5 text-[#5F5E5A] hover:text-[#888780] transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span className="text-[10px]">{uploading ? 'Uploading...' : 'Upload image'}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2C2C2A]">
          <div>
            <h3 className="text-[#F1EFE8] font-medium text-sm">
              {trade.symbol || 'Unknown'} - {trade.side?.toUpperCase() || 'TRADE'}
            </h3>
            <p className="text-[#5F5E5A] text-xs mt-0.5">
              Ticket #{trade.ticket || 'N/A'} · {trade.lots} lots
            </p>
          </div>
          <button onClick={onClose} className="text-[#5F5E5A] hover:text-[#F1EFE8] transition-colors">
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

        {/* Screenshots */}
        <div className="p-4 grid grid-cols-2 gap-3 border-b border-[#2C2C2A]">
          {renderScreenshotBox('entry')}
          {renderScreenshotBox('exit')}
        </div>

        {/* Strategy */}
        <div className="p-4 border-b border-[#2C2C2A]">
          <label className="text-[#5F5E5A] uppercase tracking-wider text-[10px] block mb-2">
            Strategy
          </label>
          {strategies.length === 0 ? (
            <a href="/strategies" target="_blank" className="text-[#534AB7] text-xs hover:underline">
              + Create your first strategy →
            </a>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setStrategyId(null)}
                className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                  strategyId === null
                    ? 'border-[#534AB7] bg-[#534AB7]/20 text-[#AFA9EC]'
                    : 'border-[#2C2C2A] text-[#888780] hover:border-[#534AB7]'
                }`}
              >
                None
              </button>
              {strategies.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStrategyId(s.id)}
                  className={`transition-opacity ${strategyId === s.id ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                >
                  <StrategyBadge name={s.name} color={s.color} small />
                </button>
              ))}
            </div>
          )}
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
            Setup / Pattern
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
