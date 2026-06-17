type Status = "SAFE" | "WATCH" | "DANGER";

export default function StatusBadge({ status }: { status: Status }) {
  const styles = {
    SAFE: "bg-safe-bg text-safe-fg",
    WATCH: "bg-watch-bg text-watch-fgLight",
    DANGER: "bg-danger-bg text-danger-fgLight",
  };
  return (
    <span className={"inline-flex items-center rounded px-2 py-0.5 text-xs font-medium tracking-wide " + styles[status]}>
      {status}
    </span>
  );
}
