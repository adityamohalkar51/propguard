"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImportDropzone from "@/components/ImportDropzone";
type Account = {
  id: string;
  firm: string;
  label: string | null;
  account_size: number;
  daily_dd_pct: number;
  max_dd_pct: number;
  target_pct: number;
  min_days: number;
  phase: string;
  start_date: string | null;
};
export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("accounts").select("*").eq("id", id).single();
      if (error || !data) {
        router.push("/dashboard");
        return;
      }
      setAccount(data as Account);
      setLoading(false);
    };
    load();
  }, [id, router]);
  const handleChange = (field: keyof Account, value: string) => {
    if (!account) return;
    setAccount({ ...account, [field]: value });
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("accounts").update({
      firm: account.firm,
      label: account.label,
      account_size: Number(account.account_size),
      daily_dd_pct: Number(account.daily_dd_pct),
      max_dd_pct: Number(account.max_dd_pct),
      target_pct: Number(account.target_pct),
      min_days: Number(account.min_days),
      phase: account.phase,
      start_date: account.start_date,
    }).eq("id", id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  };
  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this account and all its trade data? This cannot be undone.");
    if (!confirmed) return;
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  };
  if (loading || !account) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary text-sm">Loading...</p>
      </main>
    );
  }
  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition">Back to dashboard</a>
          <h1 className="text-2xl font-medium text-text-primary mt-4">Edit account</h1>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label-text mb-2 block">Firm</label>
            <select value={account.firm} onChange={(e) => handleChange("firm", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple">
              <option value="FTMO">FTMO</option>
              <option value="The5%ers">The5%ers</option>
              <option value="FundedNext">FundedNext</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="label-text mb-2 block">Label</label>
            <input type="text" value={account.label ?? ""} onChange={(e) => handleChange("label", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple" />
          </div>
          <div>
            <label className="label-text mb-2 block">Account size</label>
            <input type="number" required min="1" value={account.account_size} onChange={(e) => handleChange("account_size", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-2 block">Daily DD %</label>
              <input type="number" required step="0.1" min="0" value={account.daily_dd_pct} onChange={(e) => handleChange("daily_dd_pct", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple" />
            </div>
            <div>
              <label className="label-text mb-2 block">Max DD %</label>
              <input type="number" required step="0.1" min="0" value={account.max_dd_pct} onChange={(e) => handleChange("max_dd_pct", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-2 block">Target %</label>
              <input type="number" required step="0.1" min="0" value={account.target_pct} onChange={(e) => handleChange("target_pct", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple" />
            </div>
            <div>
              <label className="label-text mb-2 block">Min days</label>
              <input type="number" required min="0" value={account.min_days} onChange={(e) => handleChange("min_days", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-2 block">Phase</label>
              <input type="text" value={account.phase} onChange={(e) => handleChange("phase", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple" />
            </div>
            <div>
              <label className="label-text mb-2 block">Start date</label>
              <input type="date" value={account.start_date ?? ""} onChange={(e) => handleChange("start_date", e.target.value)} className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple" />
            </div>
          </div>
          {error && <p className="text-sm text-danger-fg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 rounded-md bg-accent-purple px-4 py-2 text-sm font-medium text-text-primary hover:opacity-90 transition disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <button type="button" onClick={handleDelete} className="rounded-md border border-danger-bannerBorder bg-danger-bannerBg px-4 py-2 text-sm font-medium text-danger-fgLight hover:opacity-90 transition">Delete</button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-sm font-medium text-text-primary mb-3">
            Import trades
          </h2>
          <ImportDropzone accountId={id} onImported={() => window.location.reload()} />
        </div>
      </div>
    </main>
  );
}