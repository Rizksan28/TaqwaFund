import type { ScoreIndicator } from "@/types";

export function IndicatorCard({ indicator }: { indicator: ScoreIndicator }) {
  const tone = indicator.value >= 80 ? "bg-success" : indicator.value >= 70 ? "bg-emeraldBrand" : "bg-warning";

  return (
    <article className="rounded-lg bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-ink">{indicator.label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{indicator.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xl font-black text-ink">{indicator.value}</span>
          <span className="text-sm text-muted">/100</span>
        </div>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-mint">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${indicator.value}%` }} />
      </div>
    </article>
  );
}
