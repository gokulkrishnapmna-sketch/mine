import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityEvent,
  Attachment,
  Comment,
  Notification,
  ReferenceLink,
  Task,
} from "@/lib/types";
import {
  mapActivity,
  mapComment,
  mapNotification,
  mapProfile,
  mapTask,
  taskInsertPayload,
  type DbActivity,
  type DbComment,
  type DbNotification,
  type DbProfile,
  type DbTask,
} from "./mappers";

const TASK_SELECT = "*, attachments(*), reference_links(*)";

export interface WorkspaceSnapshot {
  users: ReturnType<typeof mapProfile>[];
  tasks: Task[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: Notification[];
}

/** Initial load: everything the signed-in user is allowed to read. */
export async function fetchWorkspace(sb: SupabaseClient): Promise<WorkspaceSnapshot> {
  const [profiles, tasks, comments, activity, notifications] = await Promise.all([
    sb.from("profiles").select("*").order("name"),
    sb.from("tasks").select(TASK_SELECT).order("created_at", { ascending: false }),
    sb.from("comments").select("*").order("created_at"),
    sb.from("activity_events").select("*").order("created_at", { ascending: false }),
    sb.from("notifications").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    users: ((profiles.data ?? []) as DbProfile[]).map(mapProfile),
    tasks: ((tasks.data ?? []) as DbTask[]).map(mapTask),
    comments: ((comments.data ?? []) as DbComment[]).map(mapComment),
    activity: ((activity.data ?? []) as DbActivity[]).map(mapActivity),
    notifications: ((notifications.data ?? []) as DbNotification[]).map(mapNotification),
  };
}

export async function fetchTasks(sb: SupabaseClient): Promise<Task[]> {
  const { data } = await sb.from("tasks").select(TASK_SELECT).order("created_at", { ascending: false });
  return ((data ?? []) as DbTask[]).map(mapTask);
}

export async function fetchComments(sb: SupabaseClient): Promise<Comment[]> {
  const { data } = await sb.from("comments").select("*").order("created_at");
  return ((data ?? []) as DbComment[]).map(mapComment);
}

export async function fetchActivity(sb: SupabaseClient): Promise<ActivityEvent[]> {
  const { data } = await sb.from("activity_events").select("*").order("created_at", { ascending: false });
  return ((data ?? []) as DbActivity[]).map(mapActivity);
}

export async function fetchNotifications(sb: SupabaseClient): Promise<Notification[]> {
  const { data } = await sb.from("notifications").select("*").order("created_at", { ascending: false });
  return ((data ?? []) as DbNotification[]).map(mapNotification);
}

/** Create a task plus its attachments and reference links. Returns the saved task. */
export async function insertTask(sb: SupabaseClient, task: Task): Promise<Task | null> {
  const { data, error } = await sb
    .from("tasks")
    .insert(taskInsertPayload(task))
    .select(TASK_SELECT)
    .single();
  if (error || !data) return null;
  const saved = mapTask(data as DbTask);

  if (task.references.length) {
    await sb.from("reference_links").insert(
      task.references.map((r: ReferenceLink) => ({
        task_id: saved.id,
        label: r.label,
        url: r.url,
        provider: r.provider,
      }))
    );
  }
  if (task.attachments.length) {
    await sb.from("attachments").insert(
      task.attachments.map((a: Attachment) => ({
        task_id: saved.id,
        name: a.name,
        kind: a.kind,
        storage_path: a.url,
        uploaded_by: task.requesterId,
      }))
    );
  }
  return saved;
}

const PATCH_MAP: Record<string, string> = {
  status: "status",
  priority: "priority",
  effort: "effort",
  estimatedCompletion: "estimated_completion",
  deadline: "deadline",
  title: "title",
  description: "description",
  businessObjective: "business_objective",
};

export async function updateTask(sb: SupabaseClient, id: string, patch: Partial<Task>): Promise<void> {
  const payload: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(PATCH_MAP)) {
    if (key in patch) payload[col] = (patch as Record<string, unknown>)[key];
  }
  if (Object.keys(payload).length === 0) return;
  await sb.from("tasks").update(payload).eq("id", id);
}

export async function updateQueueRanks(sb: SupabaseClient, orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, i) => sb.from("tasks").update({ queue_rank: i + 1 }).eq("id", id))
  );
}

export async function insertComment(sb: SupabaseClient, c: Comment): Promise<void> {
  await sb.from("comments").insert({
    task_id: c.taskId,
    author_id: c.authorId,
    body: c.body,
    mentions: c.mentions,
    parent_id: c.parentId,
    is_question: c.isQuestion ?? false,
  });
}

export async function insertActivity(sb: SupabaseClient, a: ActivityEvent): Promise<void> {
  await sb.from("activity_events").insert({
    task_id: a.taskId,
    type: a.type,
    actor_id: a.actorId,
    message: a.message,
  });
}

export async function insertNotifications(sb: SupabaseClient, items: Notification[]): Promise<void> {
  if (!items.length) return;
  await sb.from("notifications").insert(
    items.map((n) => ({
      type: n.type,
      title: n.title,
      body: n.body,
      task_id: n.taskId,
      recipient_id: n.recipientId,
    }))
  );
}

export async function markNotificationRead(sb: SupabaseClient, id: string): Promise<void> {
  await sb.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllRead(sb: SupabaseClient, userId: string): Promise<void> {
  await sb.from("notifications").update({ read: true }).eq("recipient_id", userId);
}
