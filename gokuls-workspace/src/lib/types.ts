// ─────────────────────────────────────────────────────────────
// Domain types for Gokul's Workspace
// These mirror the Supabase/PostgreSQL schema in `supabase/schema.sql`.
// ─────────────────────────────────────────────────────────────

export type Role = "requester" | "admin";

export type Priority = "critical" | "high" | "medium" | "low";

export type Status =
  | "backlog"
  | "todo"
  | "in_progress"
  | "waiting_inputs"
  | "review"
  | "approved"
  | "completed"
  | "archived";

export type DeliverableType =
  | "social_media_post"
  | "linkedin_creative"
  | "presentation"
  | "video"
  | "motion_graphic"
  | "event_collateral"
  | "website_asset"
  | "poster"
  | "brochure"
  | "branding"
  | "print_design"
  | "other";

export type EffortEstimate = "small" | "medium" | "large" | "xl";

export type Department =
  | "Marketing"
  | "Sales"
  | "Product"
  | "Engineering"
  | "People & Culture"
  | "Finance"
  | "Operations"
  | "Leadership"
  | "Customer Success";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  department?: Department;
}

export interface Attachment {
  id: string;
  name: string;
  /** Logical file kind, drives the icon + preview behaviour. */
  kind: "image" | "pdf" | "ppt" | "doc" | "zip" | "video" | "other";
  sizeLabel: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export type ReferenceProvider =
  | "google_drive"
  | "figma"
  | "youtube"
  | "dropbox"
  | "onedrive"
  | "link";

export interface ReferenceLink {
  id: string;
  label: string;
  url: string;
  provider: ReferenceProvider;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  /** user ids mentioned via @name */
  mentions: string[];
  /** parent comment id for threaded replies */
  parentId: string | null;
  /** flags a comment as a question that expects an answer */
  isQuestion?: boolean;
  createdAt: string;
}

export type ActivityType =
  | "created"
  | "status_changed"
  | "priority_changed"
  | "deadline_changed"
  | "comment_added"
  | "question_asked"
  | "question_answered"
  | "file_uploaded"
  | "assigned"
  | "completed";

export interface ActivityEvent {
  id: string;
  taskId: string;
  type: ActivityType;
  actorId: string;
  message: string;
  createdAt: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone?: string;
}

export interface Task {
  id: string;
  reference: string; // human friendly, e.g. GW-104
  title: string;
  description: string;
  businessObjective: string;
  status: Status;
  priority: Priority;
  deliverableType: DeliverableType;
  department: Department;
  requesterId: string;
  contact: ContactPerson;
  deadline: string | null;
  estimatedCompletion: string | null;
  effort: EffortEstimate | null;
  tags: string[];
  pendingInfo: string[];
  additionalNotes?: string;
  attachments: Attachment[];
  references: ReferenceLink[];
  intakeScore: number; // 1–100
  createdAt: string;
  updatedAt: string;
  /** manual ordering within the smart queue (lower = earlier) */
  queueRank?: number;
}

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "comment_added"
  | "question_asked"
  | "question_answered"
  | "deadline_changed"
  | "priority_changed"
  | "task_completed";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  taskId: string | null;
  recipientId: string;
  read: boolean;
  createdAt: string;
}
