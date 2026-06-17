type BannerItem = {
  label: string;
  buffer: number;
};

export default function BreachBanner({ items }: { items: BannerItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-danger-bannerBorder bg-danger-bannerBg px-4 py-3 mb-6">
      <p className="text-sm font-medium text-danger-fgLight mb-1">Breach Warning</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <p key={i} className="text-xs text-danger-fg">
            {item.label}: buffer{" "}
            <span className="font-mono font-medium">
              {item.buffer >= 0 ? "$" + item.buffer.toFixed(2) : "-$" + Math.abs(item.buffer).toFixed(2)}
            </span>
            {item.buffer < 0 ? " — BREACHED" : " remaining"}
          </p>
        ))}
      </div>
    </div>
  );
}
