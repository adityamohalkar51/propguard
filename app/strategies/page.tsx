"use client"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import StrategyBadge from "@/components/StrategyBadge"

interface Strategy {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  trade_count?: number
  win_count?: number
  total_profit?: number
}

const COLORS = [
  "#534AB7", "#1D9E75", "#EF9F27", "#E24B4A",
  "#378ADD", "#A855F7", "#EC4899", "#14B8A6"
]

export default function StrategiesPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Strategy | null>(null)
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0] })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data: strats } = await supabase
      .from("strategies")
      .select("*")
      .order("created_at", { ascending: true })

    if (!strats) { setLoading(false); return }

    const enriched = await Promise.all(strats.map(async (s) => {
      const { data: trades } = await supabase
        .from("trades")
        .select("profit")
        .eq("strategy_id", s.id)

      const trade_count = trades?.length ?? 0
      const win_count = trades?.filter(t => t.profit > 0).length ?? 0
      const total_profit = trades?.reduce((sum, t) => sum + t.profit, 0) ?? 0
      return { ...s, trade_count, win_count, total_profit }
    }))

    setStrategies(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditTarget(null)
    setForm({ name: "", description: "", color: COLORS[0] })
    setShowForm(true)
  }

  function openEdit(s: Strategy, e: React.MouseEvent) {
    e.stopPropagation()
    setEditTarget(s)
    setForm({ name: s.name, description: s.description ?? "", color: s.color })
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    if (editTarget) {
      await supabase.from("strategies").update({
        name: form.name.trim(),
        description: form.description.trim() || null,
        color: form.color
      }).eq("id", editTarget.id)
    } else {
      await supabase.from("strategies").insert({
        user_id: user.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        color: form.color
      })
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function confirmDelete(id: string) {
    await supabase.from("strategies").delete().eq("id", id)
    setDeleteId(null)
    load()
  }

  function handleDeleteClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeleteId(id)
  }

  return (
    <div className="min-h-screen bg-[#111110] text-[#F1EFE8]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-[#888780] hover:text-[#F1EFE8] text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-medium">Strategy Playbook</h1>
            <p className="text-[#888780] text-sm mt-1">Define your setups. Tag trades. See what works.</p>
          </div>
          <button
            onClick={openNew}
            className="px-4 py-2 bg-[#534AB7] hover:bg-[#4740a0] rounded-lg text-sm font-medium transition-colors"
          >
            + New Strategy
          </button>
        </div>

        {loading ? (
          <div className="text-[#888780] text-sm">Loading...</div>
        ) : strategies.length === 0 ? (
          <div className="border border-[#2C2C2A] rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-[#888780] text-sm">No strategies yet. Create your first setup.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map(s => {
              const winRate = s.trade_count! > 0 ? Math.round((s.win_count! / s.trade_count!) * 100) : null
              const avgProfit = s.trade_count! > 0 ? (s.total_profit! / s.trade_count!).toFixed(2) : null
              return (
                <div
                  key={s.id}
                  onClick={() => router.push(`/strategies/${s.id}`)}
                  className="bg-[#1A1A18] border border-[#2C2C2A] rounded-xl p-5 cursor-pointer hover:border-[#534AB7]/50 transition-colors"
                  style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <StrategyBadge name={s.name} color={s.color} />
                    <div className="flex gap-2">
                      <button onClick={(e) => openEdit(s, e)} className="text-[#888780] hover:text-[#F1EFE8] text-xs transition-colors">Edit</button>
                      <button onClick={(e) => handleDeleteClick(s.id, e)} className="text-[#888780] hover:text-[#E24B4A] text-xs transition-colors">Delete</button>
                    </div>
                  </div>
                  {s.description && (
                    <p className="text-[#888780] text-xs mb-4 leading-relaxed">{s.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Trades</div>
                      <div className="font-mono text-sm">{s.trade_count}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Win Rate</div>
                      <div className="font-mono text-sm">
                        {winRate !== null ? (
                          <span style={{ color: winRate >= 50 ? "#1D9E75" : "#E24B4A" }}>{winRate}%</span>
                        ) : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Avg P&L</div>
                      <div className="font-mono text-sm">
                        {avgProfit !== null ? (
                          <span style={{ color: Number(avgProfit) >= 0 ? "#1D9E75" : "#E24B4A" }}>
                            {Number(avgProfit) >= 0 ? "+" : ""}{avgProfit}
                          </span>
                        ) : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowForm(false)}>
          <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-medium mb-5">{editTarget ? "Edit Strategy" : "New Strategy"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[1px] text-[#888780] block mb-1.5">Strategy Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. London Breakout"
                  className="w-full bg-[#111110] border border-[#2C2C2A] rounded-lg px-3 py-2 text-sm text-[#F1EFE8] placeholder-[#5F5E5A] focus:outline-none focus:border-[#534AB7]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[1px] text-[#888780] block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Entry rules, exit criteria, session..."
                  rows={3}
                  className="w-full bg-[#111110] border border-[#2C2C2A] rounded-lg px-3 py-2 text-sm text-[#F1EFE8] placeholder-[#5F5E5A] focus:outline-none focus:border-[#534AB7] resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[1px] text-[#888780] block mb-2">Color Tag</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-[#2C2C2A] rounded-lg text-sm text-[#888780] hover:text-[#F1EFE8] transition-colors">Cancel</button>
              <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 py-2 bg-[#534AB7] hover:bg-[#4740a0] disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                {saving ? "Saving..." : editTarget ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setDeleteId(null)}>
          <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-xl w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-base font-medium mb-2">Delete Strategy?</h3>
            <p className="text-[#888780] text-sm mb-6">Trades tagged with this strategy will be untagged. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-[#2C2C2A] rounded-lg text-sm text-[#888780] hover:text-[#F1EFE8] transition-colors">Cancel</button>
              <button onClick={() => confirmDelete(deleteId)} className="flex-1 py-2 bg-[#501313] border border-[#791F1F] hover:bg-[#E24B4A] rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
