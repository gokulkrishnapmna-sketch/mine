import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-500";
  if (score >= 70) return "text-sky-500";
  if (score >= 45) return "text-amber-500";
  return "text-red-500";
}

export function IntakeScoreRing({
  score,
  size = 44,
  label = true,
}: {
  score: number;
  size?: number;
  label?: boolean;
}) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-secondary"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-700", scoreColor(score))}
            stroke="currentColor"
            fill="none"
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-bold",
            scoreColor(score)
          )}
        >
          {score}
        </span>
      </div>
      {label && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Intake</span>}
    </div>
  );
}
