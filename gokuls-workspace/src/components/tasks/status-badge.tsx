import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/lib/constants";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const meta = STATUS_META[status];
  return <Badge className={cn("ring-transparent", meta.badge, className)}>{meta.label}</Badge>;
}
