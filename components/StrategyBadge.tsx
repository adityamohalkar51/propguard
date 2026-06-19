interface StrategyBadgeProps {
  name: string
  color: string
  small?: boolean
}

export default function StrategyBadge({ name, color, small = false }: StrategyBadgeProps) {
  return (
    <span
      style={{ backgroundColor: color + "22", color: color, borderColor: color + "55" }}
      className={`inline-flex items-center rounded border font-medium ${small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"}`}
    >
      <span
        style={{ backgroundColor: color }}
        className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0"
      />
      {name}
    </span>
  )
}
