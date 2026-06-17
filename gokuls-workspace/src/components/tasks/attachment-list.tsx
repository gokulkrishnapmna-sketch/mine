import {
  FileText,
  FileImage,
  FileArchive,
  FileVideo,
  Presentation,
  File,
  Download,
} from "lucide-react";
import type { Attachment } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ICON = {
  image: FileImage,
  pdf: FileText,
  ppt: Presentation,
  doc: FileText,
  zip: FileArchive,
  video: FileVideo,
  other: File,
};

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) {
    return <p className="text-sm text-muted-foreground">No files attached.</p>;
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {attachments.map((a) => {
        const Icon = ICON[a.kind];
        return (
          <li
            key={a.id}
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/40"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">
                {a.sizeLabel} · {formatDate(a.uploadedAt)}
              </p>
            </div>
            <a
              href={a.url}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Download ${a.name}`}
            >
              <Download className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
