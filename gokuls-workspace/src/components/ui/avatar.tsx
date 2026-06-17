import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

export function Avatar({ name, color = "#6366f1", size = "md", className }: AvatarProps) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-background",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </span>
  );
}
