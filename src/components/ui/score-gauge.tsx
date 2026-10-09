import { CheckCircle2 } from "lucide-react";

export function ScoreGauge({
  score,
  status,
  size = 190,
  dark = false,
  compact = false
}: {
  score: number;
  status: string;
  size?: number;
  dark?: boolean;
  compact?: boolean;
}) {
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#2B9B70" : score >= 70 ? "#8ad5b8" : score >= 50 ? "#D9A62E" : "#f2938d";

  return (
    <div role="img" aria-label={`TaqwaScore ${score} dari 100, ${status}`} className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={dark ? "rgba(255,255,255,0.18)" : "#D6EFE6"} strokeWidth={stroke} fill="none" />
        <circle
          className="animated-ring"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className={`absolute text-center ${dark ? "text-white" : "text-ink"}`}>
        <div className={`${compact ? "text-3xl" : "text-4xl"} font-black leading-none`}>{score}</div>
        <div className="mt-1 text-[11px] font-semibold opacity-80">Skor Maks. 100</div>
        {!compact && <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          {score >= 80 && <CheckCircle2 className="h-3.5 w-3.5" />}
          {status}
        </div>}
      </div>
    </div>
  );
}
