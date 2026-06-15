"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Firm = "FTMO" | "The5%ers" | "FundedNext" | "Other";

type Preset = {
  daily_dd_pct: number;
  max_dd_pct: number;
  target_pct: number;
  min_days: number;
  phase: string;
};

const PRESETS: Record<Firm, Preset> = {
  FTMO: { daily_dd_pct: 5, max_dd_pct: 10, target_pct: 10, min_days: 4, phase: "Phase 1" },
  "The5%ers": { daily_dd_pct: 5, max_dd_pct: 10, target_pct: 8, min_days: 0, phase: "Phase 1" },
  FundedNext: { daily_dd_pct: 5, max_dd_pct: 10, target_pct: 8, min_days: 5, phase: "Phase 1" },
  Other: { daily_dd_pct: 5, max_dd_pct: 10, target_pct: 10, min_days: 0, phase: "Phase 1" },
};

export default function NewAccountPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [firm, setFirm] = useState<Firm>("FTMO");
  const [label, setLabel] = useState("");
  const [accountSize, setAccountSize] = useState("10000");
  const [dailyDD, setDailyDD] = useState(String(PRESETS.FTMO.daily_dd_pct));
  const [maxDD, setMaxDD] = useState(String(PRESETS.FTMO.max_dd_pct));
  const [target, setTarget] = useState(String(PRESETS.FTMO.target_pct));
  const [minDays, setMinDays] = useState(String(PRESETS.FTMO.min_days));
  const [phase, setPhase] = useState(PRESETS.FTMO.phase);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const handleFirmChange = (selected: Firm) => {
    setFirm(selected);
    const preset = PRESETS[selected];
    setDailyDD(String(preset.daily_dd_pct));
    setMaxDD(String(preset.max_dd_pct));
    setTarget(String(preset.target_pct));
    setMinDays(String(preset.min_days));
    setPhase(preset.phase);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("accounts").insert({
      user_id: userData.user.id,
      firm: firm,
      label: label || (firm + " " + accountSize),
      account_size: Number(accountSize),
      daily_dd_pct: Number(dailyDD),
      max_dd_pct: Number(maxDD),
      target_pct: Number(target),
      min_days: Number(minDays),
      phase: phase,
      start_date: startDate,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition">
            Back to dashboard
          </a>
          <h1 className="text-2xl font-medium text-text-primary mt-4">Add new account</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Select your firm to auto-fill the standard rules. You can adjust them after.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text mb-2 block">Firm</label>
            <select
              value={firm}
              onChange={(e) => handleFirmChange(e.target.value as Firm)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple"
            >
              <option value="FTMO">FTMO</option>
              <option value="The5%ers">The5%ers</option>
              <option value="FundedNext">FundedNext</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="label-text mb-2 block">Label (optional nickname)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={firm + " 10K #1"}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple"
            />
          </div>

          <div>
            <label className="label-text mb-2 block">Account size ($)</label>
            <input
              type="number"
              required
              min="1"
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-2 block">Daily DD %</label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                value={dailyDD}
                onChange={(e) => setDailyDD(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple"
              />
            </div>
            <div>
              <label className="label-text mb-2 block">Max DD %</label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                value={maxDD}
                onChange={(e) => setMaxDD(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-2 block">Profit target %</label>
              <input
                type="number"
                required
                step="0.1"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple"
              />
            </div>
            <div>
              <label className="label-text mb-2 block">Min trading days</label>
              <input
                type="number"
                required
                min="0"
                value={minDays}
                onChange={(e) => setMinDays(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text mb-2 block">Phase</label>
              <input
                type="text"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-purple"
              />
            </div>
            <div>
              <label className="label-text mb-2 block">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-text-primary font-mono outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger-fg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent-purple px-4 py-2 text-sm font-medium text-text-primary hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add account"}
          </button>
        </form>
      </div>
    </main>
  );
}
