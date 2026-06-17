import type {
  ActivityEvent,
  Attachment,
  Comment,
  Notification,
  ReferenceLink,
  Task,
  User,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Database row shapes (snake_case) → domain types (camelCase).
// Mirrors supabase/schema.sql. Hand-written to avoid a codegen step.
// ─────────────────────────────────────────────────────────────

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role: User["role"];
  department: string | null;
}

export interface DbAttachment {
  id: string;
  task_id: string;
  name: string;
  kind: string;
  size_bytes: number | null;
  storage_path: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface DbReference {
  id: string;
  task_id: string;
  label: string;
  url: string;
  provider: ReferenceLink["provider"];
}

export interface DbTask {
  id: string;
  reference: string;
  title: string;
  description: string;
  business_objective: string;
  status: Task["status"];
  priority: Task["priority"];
  deliverable_type: Task["deliverableType"];
  department: string;
  requester_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  deadline: string | null;
  estimated_completion: string | null;
  effort: Task["effort"];
  tags: string[] | null;
  pending_info: string[] | null;
  additional_notes: string | null;
  intake_score: number;
  queue_rank: number | null;
  created_at: string;
  updated_at: string;
  attachments?: DbAttachment[];
  reference_links?: DbReference[];
}

export interface DbComment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  mentions: string[] | null;
  parent_id: string | null;
  is_question: boolean;
  created_at: string;
}

export interface DbActivity {
  id: string;
  task_id: string;
  type: ActivityEvent["type"];
  actor_id: string;
  message: string;
  created_at: string;
}

export interface DbNotification {
  id: string;
  type: Notification["type"];
  title: string;
  body: string;
  task_id: string | null;
  recipient_id: string;
  read: boolean;
  created_at: string;
}

function bytesLabel(b: number | null): string {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export const mapProfile = (p: DbProfile): User => ({
  id: p.id,
  name: p.name,
  email: p.email,
  avatarColor: p.avatar_color,
  role: p.role,
  department: (p.department as User["department"]) ?? undefined,
});

export const mapAttachment = (a: DbAttachment): Attachment => ({
  id: a.id,
  name: a.name,
  kind: a.kind as Attachment["kind"],
  sizeLabel: bytesLabel(a.size_bytes),
  url: a.storage_path,
  uploadedBy: a.uploaded_by ?? "",
  uploadedAt: a.created_at,
});

export const mapReference = (r: DbReference): ReferenceLink => ({
  id: r.id,
  label: r.label,
  url: r.url,
  provider: r.provider,
});

export const mapTask = (t: DbTask): Task => ({
  id: t.id,
  reference: t.reference,
  title: t.title,
  description: t.description,
  businessObjective: t.business_objective,
  status: t.status,
  priority: t.priority,
  deliverableType: t.deliverable_type,
  department: t.department as Task["department"],
  requesterId: t.requester_id,
  contact: { name: t.contact_name, email: t.contact_email, phone: t.contact_phone ?? undefined },
  deadline: t.deadline,
  estimatedCompletion: t.estimated_completion,
  effort: t.effort,
  tags: t.tags ?? [],
  pendingInfo: t.pending_info ?? [],
  additionalNotes: t.additional_notes ?? undefined,
  attachments: (t.attachments ?? []).map(mapAttachment),
  references: (t.reference_links ?? []).map(mapReference),
  intakeScore: t.intake_score,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
  queueRank: t.queue_rank ?? undefined,
});

export const mapComment = (c: DbComment): Comment => ({
  id: c.id,
  taskId: c.task_id,
  authorId: c.author_id,
  body: c.body,
  mentions: c.mentions ?? [],
  parentId: c.parent_id,
  isQuestion: c.is_question,
  createdAt: c.created_at,
});

export const mapActivity = (a: DbActivity): ActivityEvent => ({
  id: a.id,
  taskId: a.task_id,
  type: a.type,
  actorId: a.actor_id,
  message: a.message,
  createdAt: a.created_at,
});

export const mapNotification = (n: DbNotification): Notification => ({
  id: n.id,
  type: n.type,
  title: n.title,
  body: n.body,
  taskId: n.task_id,
  recipientId: n.recipient_id,
  read: n.read,
  createdAt: n.created_at,
});

/** Domain Task → insert payload (DB fills id, reference, timestamps). */
export function taskInsertPayload(t: Task) {
  return {
    title: t.title,
    description: t.description,
    business_objective: t.businessObjective,
    status: t.status,
    priority: t.priority,
    deliverable_type: t.deliverableType,
    department: t.department,
    requester_id: t.requesterId,
    contact_name: t.contact.name,
    contact_email: t.contact.email,
    contact_phone: t.contact.phone ?? null,
    deadline: t.deadline,
    estimated_completion: t.estimatedCompletion,
    effort: t.effort,
    tags: t.tags,
    pending_info: t.pendingInfo,
    additional_notes: t.additionalNotes ?? null,
    intake_score: t.intakeScore,
  };
}
