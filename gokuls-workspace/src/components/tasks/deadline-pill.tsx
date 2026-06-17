import { CalendarClock } from "lucide-react";
import { cn, daysUntil, formatDate } from "@/lib/utils";

export function DeadlinePill({ deadline, className }: { deadline: string | null; className?: string }) {
  const d = daysUntil(deadline);
  if (deadline === null || d === null) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <CalendarClock className="size-3.5" /> No deadline
      </span>
    );
  }

  const tone =
    d < 0
      ? "text-red-600 dark:text-red-400"
      : d <= 2
        ? "text-orange-600 dark:text-orange-400"
        : d <= 7
          ? "text-amber-600 dark:text-amber-400"
          : "text-muted-foreground";

  const label =
    d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Due today" : d === 1 ? "Due tomorrow" : `${d}d left`;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", tone, className)} title={formatDate(deadline)}>
      <CalendarClock className="size-3.5" /> {label}
    </span>
  );
}
