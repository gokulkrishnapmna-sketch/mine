import type {
  DeliverableType,
  Department,
  Priority,
  ReferenceProvider,
  Status,
} from "./types";

export const PRIORITIES: Priority[] = ["critical", "high", "medium", "low"];

export const PRIORITY_META: Record<
  Priority,
  { label: string; weight: number; dot: string; badge: string; ring: string }
> = {
  critical: {
    label: "Critical",
    weight: 100,
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-400/30",
    ring: "ring-red-500/40",
  },
  high: {
    label: "High",
    weight: 75,
    dot: "bg-orange-500",
    badge:
      "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-400/30",
    ring: "ring-orange-500/40",
  },
  medium: {
    label: "Medium",
    weight: 50,
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/30",
    ring: "ring-blue-500/40",
  },
  low: {
    label: "Low",
    weight: 25,
    dot: "bg-slate-400",
    badge:
      "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-400/20",
    ring: "ring-slate-400/40",
  },
};

export const STATUSES: Status[] = [
  "backlog",
  "todo",
  "in_progress",
  "waiting_inputs",
  "review",
  "approved",
  "completed",
  "archived",
];

export const STATUS_META: Record<
  Status,
  { label: string; badge: string; accent: string }
> = {
  backlog: {
    label: "Backlog",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    accent: "border-slate-300 dark:border-slate-600",
  },
  todo: {
    label: "To Do",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    accent: "border-violet-400",
  },
  in_progress: {
    label: "In Progress",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    accent: "border-amber-400",
  },
  waiting_inputs: {
    label: "Waiting for Inputs",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    accent: "border-rose-400",
  },
  review: {
    label: "Review",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    accent: "border-sky-400",
  },
  approved: {
    label: "Approved",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    accent: "border-teal-400",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    accent: "border-emerald-400",
  },
  archived: {
    label: "Archived",
    badge: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    accent: "border-slate-300 dark:border-slate-700",
  },
};

/** Statuses that count toward Gokul's active workload. */
export const ACTIVE_STATUSES: Status[] = [
  "backlog",
  "todo",
  "in_progress",
  "waiting_inputs",
  "review",
];

export const KANBAN_COLUMNS: Status[] = STATUSES;

export const DELIVERABLE_TYPES: { value: DeliverableType; label: string }[] = [
  { value: "social_media_post", label: "Social Media Post" },
  { value: "linkedin_creative", label: "LinkedIn Creative" },
  { value: "presentation", label: "Presentation" },
  { value: "video", label: "Video" },
  { value: "motion_graphic", label: "Motion Graphic" },
  { value: "event_collateral", label: "Event Collateral" },
  { value: "website_asset", label: "Website Asset" },
  { value: "poster", label: "Poster" },
  { value: "brochure", label: "Brochure" },
  { value: "branding", label: "Branding" },
  { value: "print_design", label: "Print Design" },
  { value: "other", label: "Other" },
];

export const DELIVERABLE_LABEL: Record<DeliverableType, string> =
  Object.fromEntries(DELIVERABLE_TYPES.map((d) => [d.value, d.label])) as Record<
    DeliverableType,
    string
  >;

/** Rough effort baseline (in working days) per deliverable, used by AI estimator. */
export const DELIVERABLE_EFFORT_DAYS: Record<DeliverableType, number> = {
  social_media_post: 0.5,
  linkedin_creative: 0.5,
  presentation: 2,
  video: 4,
  motion_graphic: 3,
  event_collateral: 2.5,
  website_asset: 2,
  poster: 1,
  brochure: 2,
  branding: 5,
  print_design: 1.5,
  other: 1.5,
};

export const DEPARTMENTS: Department[] = [
  "Marketing",
  "Sales",
  "Product",
  "Engineering",
  "People & Culture",
  "Finance",
  "Operations",
  "Leadership",
  "Customer Success",
];

export const REFERENCE_PROVIDER_META: Record<
  ReferenceProvider,
  { label: string; pattern?: RegExp }
> = {
  google_drive: { label: "Google Drive", pattern: /drive\.google\.com|docs\.google\.com/i },
  figma: { label: "Figma", pattern: /figma\.com/i },
  youtube: { label: "YouTube", pattern: /youtube\.com|youtu\.be/i },
  dropbox: { label: "Dropbox", pattern: /dropbox\.com/i },
  onedrive: { label: "OneDrive", pattern: /onedrive\.live\.com|1drv\.ms/i },
  link: { label: "Link" },
};

export function detectProvider(url: string): ReferenceProvider {
  for (const [key, meta] of Object.entries(REFERENCE_PROVIDER_META)) {
    if (meta.pattern?.test(url)) return key as ReferenceProvider;
  }
  return "link";
}

/** Gokul's capacity in "effort points" of concurrent active work. */
export const CAPACITY_BASELINE = 40;

export const EFFORT_POINTS = {
  small: 2,
  medium: 5,
  large: 9,
  xl: 14,
} as const;
