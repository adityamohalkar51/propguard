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
export default function AccountCard({ account }: { account: Account }) {
  return (
    <a href={"/accounts/" + account.id} className="block rounded-lg border border-border bg-card p-5 hover:border-accent-purple transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-text-primary font-medium">{account.label || account.firm}</p>
          <p className="text-xs text-text-secondary mt-1">{account.firm} - {account.phase}</p>
        </div>
        <span className="font-mono text-sm text-text-primary">${account.account_size.toLocaleString()}</span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Daily DD</span>
            <span className="font-mono text-xs text-text-secondary">{account.daily_dd_pct}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill bg-safe-fg" style={{ width: "0%" }} /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Max DD</span>
            <span className="font-mono text-xs text-text-secondary">{account.max_dd_pct}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill bg-safe-fg" style={{ width: "0%" }} /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="label-text">Target</span>
            <span className="font-mono text-xs text-target-text">{account.target_pct}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill bg-target" style={{ width: "0%" }} /></div>
        </div>
      </div>
    </a>
  );
}
