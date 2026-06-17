type ProgressBarProps = {
  usagePct: number;
  type: "dd" | "target";
};

export default function ProgressBar({ usagePct, type }: ProgressBarProps) {
  const capped = Math.min(usagePct, 100);

  let fillColor = "bg-safe-fg";
  if (type === "dd") {
    if (usagePct > 80) fillColor = "bg-danger-fg";
    else if (usagePct >= 50) fillColor = "bg-watch-fg";
    else fillColor = "bg-safe-fg";
  } else {
    fillColor = "bg-target";
  }

  return (
    <div className="progress-track">
      <div className={"progress-fill " + fillColor} style={{ width: capped + "%" }} />
    </div>
  );
}
