"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AccountCard from "@/components/AccountCard";
import BreachBanner from "@/components/BreachBanner";
import { computeMetrics } from "@/lib/dashboardUtils";
import { BookOpen, LayoutList } from "lucide-react";

type Account = {
  id: string;
  firm: string;
  label: string | null;
  account_size: number;
  daily_dd_pct: number;
  max_dd_pct: number;
  target_pct: number;
  phase: string;
};

type Trade = {
  account_id: string;
  profit: number;
  close_time: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setEmail(userData.user.email ?? null);

      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, firm, label, account_size, daily_dd_pct, max_dd_pct, target_pct, phase")
        .order("created_at", { ascending: false });

      const { data: trades } = await supabase
        .from("trades")
        .select("account_id, profit, close_time");

      const accountList = (accounts as Account[]) ?? [];
      const tradeList = (trades as Trade[]) ?? [];

      const result = accountList.map((acc) => {
        const accTrades = tradeList
          .filter((t) => t.account_id === acc.id)
          .map((t) => ({ profit: t.profit, close_time: t.close_time }));
        const metrics = computeMetrics(
          accTrades,
          acc.account_size,
          acc.daily_dd_pct,
          acc.max_dd_pct,
          acc.target_pct
        );
        return { account: acc, metrics };
      });

      setItems(result);
      setLoading(false);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const dangerItems = items
    .filter((i) => i.metrics.status === "DANGER")
    .map((i) => ({
      label: i.account.label || i.account.firm,
      buffer: Math.min(i.metrics.dailyBuffer, i.metrics.maxBuffer),
    }));

  const totalEquity = items.reduce((sum, i) => sum + i.metrics.currentEquity, 0);
  const totalPnl = items.reduce((sum, i) => sum + i.metrics.totalPnl, 0);
  const dangerCount = items.filter((i) => i.metrics.status === "DANGER").length;
  const watchCount = items.filter((i) => i.metrics.status === "WATCH").length;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-secondary mt-1">{email}</p>
          </div>
          <div className="flex gap-3">
            <a href="/journal" className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-card transition">
              <BookOpen className="w-3.5 h-3.5" />
              Trade Journal
            </a>
            <a href="/strategies" className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-card transition">
              <LayoutList className="w-3.5 h-3.5" />
              Strategies
            </a>
            <a href="/accounts/new" className="rounded-md bg-accent-purple px-4 py-2 text-sm font-medium text-text-primary hover:opacity-90 transition">+ Add account</a>
            <button onClick={handleLogout} className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition">Log out</button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="label-text mb-1">Total Equity</p>
              <p className="font-mono text-lg text-text-primary">${totalEquity.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="label-text mb-1">Total P&L</p>
              <p className={"font-mono text-lg " + (totalPnl >= 0 ? "text-safe-fg" : "text-danger-fg")}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="label-text mb-1">Accounts</p>
              <p className="font-mono text-lg text-text-primary">{items.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="label-text mb-1">Alerts</p>
              <p className="font-mono text-lg">
                {dangerCount > 0 && <span className="text-danger-fg">{dangerCount} DANGER </span>}
                {watchCount > 0 && <span className="text-watch-fg">{watchCount} WATCH</span>}
                {dangerCount === 0 && watchCount === 0 && <span className="text-safe-fg">All Safe</span>}
              </p>
            </div>
          </div>
        )}

        <BreachBanner items={dangerItems} />

        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-text-secondary text-sm">No accounts yet. Click Add account to add your first prop firm challenge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: any) => (
              <AccountCard key={item.account.id} account={item.account} metrics={item.metrics} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
