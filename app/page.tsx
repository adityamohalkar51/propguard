import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-accent-logo flex items-center justify-center">
            <span className="text-accent-icon text-sm font-medium">PG</span>
          </div>
          <span className="text-text-primary font-medium">PropGuard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition">Log in</Link>
          <Link href="/signup" className="rounded-md bg-accent-purple px-4 py-2 text-sm font-medium text-text-primary hover:opacity-90 transition">Get started free</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-safe-fg"></span>
          <span className="text-xs text-text-secondary">Built for FTMO, The5%ers, FundedNext traders</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium text-text-primary mb-6 leading-tight">
          Stop losing prop accounts<br />to rules you forgot
        </h1>
        <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto">
          PropGuard tracks your daily drawdown, max drawdown, and profit targets across all your challenge accounts. Get warned before you breach — not after.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="rounded-md bg-accent-purple px-6 py-3 text-sm font-medium text-text-primary hover:opacity-90 transition">
            Start tracking free
          </Link>
          <Link href="/login" className="rounded-md border border-border px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition">
            Log in
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Equity", value: "$28,450.00", color: "text-text-primary" },
              { label: "Total P&L", value: "-$312.50", color: "text-danger-fg" },
              { label: "Accounts", value: "3", color: "text-text-primary" },
              { label: "Alerts", value: "1 WATCH", color: "text-watch-fg" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-bg px-4 py-3">
                <p className="label-text mb-1">{stat.label}</p>
                <p className={"font-mono text-lg " + stat.color}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "FTMO 10K", firm: "FTMO - Phase 1", status: "SAFE", statusColor: "bg-safe-bg text-safe-fg", equity: "$9,850.00", dailyUsage: 12, maxUsage: 15, targetUsage: 8, buffer: "$383.00" },
              { label: "The5%ers 25K", firm: "The5%ers - Phase 1", status: "WATCH", statusColor: "bg-watch-bg text-watch-fgLight", equity: "$24,100.00", dailyUsage: 65, maxUsage: 42, targetUsage: 35, buffer: "$175.00" },
              { label: "FundedNext 10K", firm: "FundedNext - Phase 2", status: "SAFE", statusColor: "bg-safe-bg text-safe-fg", equity: "$10,200.00", dailyUsage: 5, maxUsage: 0, targetUsage: 20, buffer: "$475.00" },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border border-border bg-bg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-text-primary font-medium text-sm">{card.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{card.firm}</p>
                  </div>
                  <span className={"inline-flex items-center rounded px-2 py-0.5 text-xs font-medium " + card.statusColor}>{card.status}</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: "Daily DD", usage: card.dailyUsage, type: "dd" },
                    { name: "Max DD", usage: card.maxUsage, type: "dd" },
                    { name: "Target", usage: card.targetUsage, type: "target" },
                  ].map((bar) => (
                    <div key={bar.name}>
                      <div className="flex justify-between mb-1">
                        <span className="label-text">{bar.name}</span>
                        <span className="font-mono text-xs text-text-secondary">{bar.usage}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={"progress-fill " + (bar.type === "target" ? "bg-target" : bar.usage > 80 ? "bg-danger-fg" : bar.usage >= 50 ? "bg-watch-fg" : "bg-safe-fg")}
                          style={{ width: bar.usage + "%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between">
                  <span className="label-text">Buffer (Daily)</span>
                  <span className="font-mono text-xs text-text-secondary">{card.buffer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-medium text-text-primary text-center mb-10">Why prop traders use PropGuard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Real-time DD tracking", desc: "Know your exact daily and max drawdown usage at all times. Never get surprised by a breach again." },
            { title: "Multi-account view", desc: "Track all your FTMO, The5%ers, and FundedNext challenges in one dashboard. No more spreadsheets." },
            { title: "Dollar buffer warnings", desc: "See exactly how many dollars you have left before hitting your daily limit. Trade with confidence." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-text-primary font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <h2 className="text-2xl font-medium text-text-primary mb-4">Ready to protect your accounts?</h2>
        <p className="text-text-secondary mb-8">Free to use. No credit card required.</p>
        <Link href="/signup" className="rounded-md bg-accent-purple px-8 py-3 text-sm font-medium text-text-primary hover:opacity-90 transition">
          Create free account
        </Link>
      </section>

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-accent-logo flex items-center justify-center">
              <span className="text-accent-icon text-xs">PG</span>
            </div>
            <span className="text-text-secondary text-sm">PropGuard</span>
          </div>
          <p className="text-text-faint text-xs">Built for prop traders, by prop traders.</p>
        </div>
      </footer>
    </main>
  );
}
