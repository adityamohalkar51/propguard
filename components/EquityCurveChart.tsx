"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Trade {
  close_time: string | null
  profit: number
}

interface EquityCurveChartProps {
  trades: Trade[]
  startingBalance: number
}

interface ChartPoint {
  date: string
  equity: number
  label: string
  fullDate: string
}

export default function EquityCurveChart({ trades, startingBalance }: EquityCurveChartProps) {
  const closedTrades = trades
    .filter(t => t.close_time)
    .sort((a, b) => new Date(a.close_time!).getTime() - new Date(b.close_time!).getTime())

  if (closedTrades.length === 0) {
    return (
      <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-8 text-center">
        <p className="text-[#5F5E5A] text-xs">No closed trades yet. Import an MT5 report to see your equity curve.</p>
      </div>
    )
  }

  let running = startingBalance
  const data: ChartPoint[] = [
    {
      date: "start",
      equity: startingBalance,
      label: "Start",
      fullDate: "Start"
    }
  ]

  for (const t of closedTrades) {
    running += t.profit || 0
    const d = new Date(t.close_time!)
    const fullDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    data.push({
      date: t.close_time!,
      equity: Number(running.toFixed(2)),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate
    })
  }

  // Only show a label on the first point of each calendar day (avoids repeated tick labels)
  const seenLabels = new Set<string>()
  const tickData = data.map((d) => {
    if (seenLabels.has(d.label)) {
      return { ...d, label: "" }
    }
    seenLabels.add(d.label)
    return d
  })

  const equities = data.map(d => d.equity)
  const minEquity = Math.min(...equities, startingBalance)
  const maxEquity = Math.max(...equities, startingBalance)
  const padding = Math.max((maxEquity - minEquity) * 0.1, 10)
  const finalEquity = data[data.length - 1].equity
  const isUp = finalEquity >= startingBalance
  const lineColor = isUp ? "#1D9E75" : "#E24B4A"

  return (
    <div className="bg-[#1A1A18] border border-[#2C2C2A] rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Equity Curve</div>
          <div className="font-mono text-lg" style={{ color: lineColor }}>
            ${finalEquity.toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[1px] text-[#5F5E5A] mb-1">Net Change</div>
          <div className="font-mono text-sm" style={{ color: lineColor }}>
            {isUp ? "+" : ""}{(finalEquity - startingBalance).toFixed(2)}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={tickData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2A" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#5F5E5A"
            tick={{ fontSize: 10, fill: "#5F5E5A" }}
            tickLine={false}
            axisLine={{ stroke: "#2C2C2A" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            domain={[minEquity - padding, maxEquity + padding]}
            stroke="#5F5E5A"
            tick={{ fontSize: 10, fill: "#5F5E5A" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${Math.round(v)}`}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A1A18",
              border: "1px solid #2C2C2A",
              borderRadius: 8,
              fontSize: 11
            }}
            labelStyle={{ color: "#888780" }}
            itemStyle={{ color: lineColor }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
            labelFormatter={(_label, payload) => {
              const point = payload && payload[0] ? (payload[0].payload as ChartPoint) : null
              return point ? point.fullDate : ""
            }}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
