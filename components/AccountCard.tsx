import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";

type AccountMetrics = {
  dailyUsage: number;
  maxUsage: number;
  targetProgress: number;
  status: "SAFE" | "WATCH" | "DANGER";
  dailyBuffer: number;
  maxBuffer: number;
  todayPnl: number;
  totalPnl: number;
  currentEquity: number;
};

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

export default function AccountCard({ account, metrics }: { account: Account; metrics: AccountMetrics }) {
  return (
    <a href={"/accounts/" + account.id} className="block rounded-lg border border-border bg-card p-5 hover:border-accent-purple transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-text-primary font-medium">{account.label || account.firm}</p>
          <p className="text-xs text-text-secondary mt-0.5">{account.firm} - {account.phase}</p>
        </div>
        <StatusBadge status={metrics.status} />
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p className="label-text">Equity</p>
          <p className="font-mono text-sm text-text-primary">${metrics.currentEquity.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="label-text">Today P&L</p>
          <p className={"font-mono text-sm " + (metrics.todayPnl >= 0 ? "text-safe-fg" : "text-danger-fg")}>
            {metrics.todayPnl >= 0 ? "+" : ""}${metrics.todayPnl.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Daily DD</span>
            <span className="font-mono text-xs text-text-secondary">{metrics.dailyUsage.toFixed(1)}% / {account.daily_dd_pct}%</span>
          </div>
          <ProgressBar usagePct={metrics.dailyUsage} type="dd" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Max DD</span>
            <span className="font-mono text-xs text-text-secondary">{metrics.maxUsage.toFixed(1)}% / {account.max_dd_pct}%</span>
          </div>
          <ProgressBar usagePct={metrics.maxUsage} type="dd" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Target</span>
            <span className="font-mono text-xs text-target-text">{metrics.targetProgress.toFixed(1)}% / {account.target_pct}%</span>
          </div>
          <ProgressBar usagePct={metrics.targetProgress} type="target" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex justify-between">
        <span className="label-text">Buffer (Daily)</span>
        <span className={"font-mono text-xs " + (metrics.dailyBuffer < 0 ? "text-danger-fg" : "text-text-secondary")}>
          {metrics.dailyBuffer >= 0 ? "$" + metrics.dailyBuffer.toFixed(2) : "-$" + Math.abs(metrics.dailyBuffer).toFixed(2)}
        </span>
      </div>
    </a>
  );
}
