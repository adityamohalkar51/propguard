"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AccountCard from "@/components/AccountCard";
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
export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setEmail(userData.user.email ?? null);
      const { data: accountsData } = await supabase
        .from("accounts")
        .select("id, firm, label, account_size, daily_dd_pct, max_dd_pct, target_pct, phase")
        .order("created_at", { ascending: false });
      setAccounts((accountsData as Account[]) ?? []);
      setLoading(false);
    };
    load();
  }, [router]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-secondary mt-1">Logged in as {email}</p>
          </div>
          <div className="flex gap-3">
            <a href="/accounts/new" className="rounded-md bg-accent-purple px-4 py-2 text-sm font-medium text-text-primary hover:opacity-90 transition">+ Add account</a>
            <button onClick={handleLogout} className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition">Log out</button>
          </div>
        </div>
        {accounts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-text-secondary text-sm">No accounts yet. Click Add account to add your first prop firm challenge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
