import { ExternalLink, Figma, Youtube, HardDrive, Cloud, Link2 } from "lucide-react";
import type { ReferenceLink, ReferenceProvider } from "@/lib/types";
import { REFERENCE_PROVIDER_META } from "@/lib/constants";

const ICON: Record<ReferenceProvider, typeof Link2> = {
  figma: Figma,
  youtube: Youtube,
  google_drive: HardDrive,
  dropbox: Cloud,
  onedrive: Cloud,
  link: Link2,
};

export function ReferenceList({ references }: { references: ReferenceLink[] }) {
  if (references.length === 0) {
    return <p className="text-sm text-muted-foreground">No reference links.</p>;
  }
  return (
    <ul className="space-y-2">
      {references.map((r) => {
        const Icon = ICON[r.provider];
        return (
          <li key={r.id}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{REFERENCE_PROVIDER_META[r.provider].label}</p>
                <p className="truncate text-xs text-muted-foreground">{r.url}</p>
              </div>
              <ExternalLink className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
