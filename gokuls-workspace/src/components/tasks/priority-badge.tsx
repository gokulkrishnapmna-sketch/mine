import { Badge } from "@/components/ui/badge";
import { PRIORITY_META } from "@/lib/constants";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge className={cn(meta.badge, className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

export function PriorityDot({ priority, className }: { priority: Priority; className?: string }) {
  return <span className={cn("size-2 rounded-full", PRIORITY_META[priority].dot, className)} />;
}
