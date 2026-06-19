"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { ArrowLeft } from "lucide-react"
import StrategyBadge from "@/components/StrategyBadge"
import TradeList from "@/components/journal/TradeList"
import TradeDetailModal from "@/components/journal/TradeDetailModal"

interface Strategy {
  id: string
  name: string
  description: string | null
  color: string
}

interface Trade {
  id: string
  account_id: string
  ticket: string | null
  symbol: string | null
  side: string | null
  open_time: string | null
  close_time: string | null
  lots: number | null
  profit: number
  created_at: string
  notes?: string | null
  rating?: number | null
  mistakes?: string[] | null
  setup_tags?: string[] | null
  r_multiple?: number | null
  strategy_id?: string | null
}

export default function StrategyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    setLoading(true)

    const { data: strat } = await supabase
      .from("strategies")
      .select("id, name, description, color")
      .eq("id", id)
      .single()

    if (!strat) {
      setLoading(false)
      return
    }
    setStrategy(strat)

    const { data: tradeData } = await supabase
      .from("trades")
      .select("*")
      .eq("strategy_id", id)
      .order("close_time", { ascending: false })

    setTrades(tradeData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  function openTrade(trade: Trade) {
    setSelectedTrade(trade)
    setModalOpen(true)
  }

  function handleTradeUpdate(updated: Trade) {
    // If strategy was changed away from this one, remove from list
    if (updated.strategy_id !== id) {
      setTrades(prev => prev.filter(t => t.id !== updated.id))
    } else {
      setTrades(prev => prev.map(t => t.id === updated.id ? updated : t))
    }
  }

  function handleTradeDelete(tradeId: string) {
    setTrades(prev => prev.filter(t => t.id !== tradeId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111110] text-[#F1EFE8] flex items-center justify-center">
        <p className="text-[#888780] text-sm">Loading...</p>
      </div>
    )
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-[#111110] text-[#F1EFE8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888780] text-sm mb-4">Strategy not found.</p>
          <button
            onClick={() => router.push("/strategies")}
            className="text-[#534AB7] text-sm hover:underline"
          >
            ← Back to Playbook
          </button>
        </div>
      </div>
    )
  }

  const tradeCount = trades.length
  const winCount = trades.filter(t => (t.profit || 0) > 0).length
  const winRate = tradeCount > 0 ? Math.round((winCount / tradeCount) * 100) : null
  const totalPnl = trades.reduce((sum, t) => sum + (t.profit || 0), 0)
  const avgPnl = tradeCount > 0 ? totalPnl / tradeCount : null
  const avgR = (() => {
    const withR = trades.filter(t => t.r_multiple !== null && t.r_multiple !== undefined)
    if (withR.length === 0) return null
    return withR.reduce((s, t) => s + (t.r_multiple || 0), 0) / withR.length
  })()

  return (
    <div className="min-h-screen bg-[#111110] text-[#F1EFE8]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push("/strategies")}
          className="inline-flex items-center gap-1.5 text-[#888780] hover:text-[#F1EFE8] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Playbook
        </button>

        {/* Header */}
        <div
          className="bg-[#1A1A18] border border-[#2C2C2A] rounded-xl p-5 mb-6"
          style={{ borderLeftColor: strategy.color, borderLeftWidth: 3 }}
        >
          <StrategyBadge name={strategy.name} color={strategy.color} />
          {strategy.description && (
            <p className="text-[#888780] text-xs mt-3 leading-relaxed">{strategy.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Trades</div>
            <div className="font-mono text-lg">{tradeCount}</div>
          </div>
          <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Win Rate</div>
            <div className="font-mono text-lg">
              {winRate !== null ? (
                <span style={{ color: winRate >= 50 ? "#1D9E75" : "#E24B4A" }}>{winRate}%</span>
              ) : "—"}
            </div>
          </div>
          <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Total P&L</div>
            <div className="font-mono text-lg">
              <span style={{ color: totalPnl >= 0 ? "#1D9E75" : "#E24B4A" }}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Avg R</div>
            <div className="font-mono text-lg">
              {avgR !== null ? (
                <span style={{ color: avgR >= 0 ? "#1D9E75" : "#E24B4A" }}>
                  {avgR >= 0 ? "+" : ""}{avgR.toFixed(2)}R
                </span>
              ) : "—"}
            </div>
          </div>
        </div>

        {/* Trades */}
        <h2 className="text-sm font-medium text-[#888780] uppercase tracking-[1px] mb-3">
          Tagged Trades
        </h2>
        <TradeList trades={trades} onTradeClick={openTrade} />
      </div>

      <TradeDetailModal
        trade={selectedTrade}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleTradeUpdate}
        onDelete={handleTradeDelete}
      />
    </div>
  )
}
