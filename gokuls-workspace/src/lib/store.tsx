"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityEvent,
  ActivityType,
  Comment,
  Notification,
  NotificationType,
  Priority,
  Status,
  Task,
  User,
} from "./types";
import {
  CURRENT_USER_ID,
  GOKUL_ID,
  SEED_ACTIVITY,
  SEED_COMMENTS,
  SEED_NOTIFICATIONS,
  SEED_TASKS,
  SEED_USERS,
} from "./seed";
import { STATUS_META, PRIORITY_META } from "./constants";
import { uid } from "./utils";
import { isSupabaseConfigured } from "./supabase/config";
import { createBrowserSupabase } from "./supabase/client";
import * as repo from "./supabase/repo";

interface State {
  users: User[];
  tasks: Task[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: Notification[];
  currentUserId: string;
}

const STORAGE_KEY = "gokuls-workspace:v1";
const LIVE = isSupabaseConfigured;

const demoState: State = {
  users: SEED_USERS,
  tasks: SEED_TASKS,
  comments: SEED_COMMENTS,
  activity: SEED_ACTIVITY,
  notifications: SEED_NOTIFICATIONS,
  currentUserId: CURRENT_USER_ID,
};

const emptyState: State = {
  users: [],
  tasks: [],
  comments: [],
  activity: [],
  notifications: [],
  currentUserId: "",
};

type Action =
  | { type: "HYDRATE"; payload: State }
  | { type: "SET_COLLECTION"; key: keyof State; value: any }
  | { type: "ADD_TASK"; task: Task; activity: ActivityEvent; notifications: Notification[] }
  | { type: "UPDATE_TASK"; id: string; patch: Partial<Task>; activity?: ActivityEvent; notifications?: Notification[] }
  | { type: "ADD_COMMENT"; comment: Comment; activity: ActivityEvent; notifications: Notification[] }
  | { type: "READ_NOTIFICATION"; id: string }
  | { type: "READ_ALL_NOTIFICATIONS" }
  | { type: "SET_USER"; id: string }
  | { type: "REORDER_QUEUE"; orderedIds: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "SET_COLLECTION":
      return { ...state, [action.key]: action.value };
    case "ADD_TASK":
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
        activity: [action.activity, ...state.activity],
        notifications: [...action.notifications, ...state.notifications],
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, ...action.patch, updatedAt: new Date().toISOString() }
            : t
        ),
        activity: action.activity ? [action.activity, ...state.activity] : state.activity,
        notifications: action.notifications
          ? [...action.notifications, ...state.notifications]
          : state.notifications,
      };
    case "ADD_COMMENT":
      return {
        ...state,
        comments: [...state.comments, action.comment],
        activity: [action.activity, ...state.activity],
        notifications: [...action.notifications, ...state.notifications],
      };
    case "READ_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case "READ_ALL_NOTIFICATIONS":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.recipientId === state.currentUserId ? { ...n, read: true } : n
        ),
      };
    case "SET_USER":
      return { ...state, currentUserId: action.id };
    case "REORDER_QUEUE":
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          const idx = action.orderedIds.indexOf(t.id);
          return idx === -1 ? t : { ...t, queueRank: idx + 1 };
        }),
      };
    default:
      return state;
  }
}

interface StoreContextValue extends State {
  mode: "demo" | "live";
  loading: boolean;
  currentUser: User;
  isAdmin: boolean;
  getUser: (id: string) => User | undefined;
  createTask: (task: Task) => Promise<string>;
  updateTask: (id: string, patch: Partial<Task>, opts?: { activityType?: ActivityType; message?: string }) => void;
  changeStatus: (id: string, status: Status) => void;
  changePriority: (id: string, priority: Priority) => void;
  addComment: (taskId: string, body: string, opts?: { parentId?: string | null; isQuestion?: boolean }) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setCurrentUser: (id: string) => void;
  reorderQueue: (orderedIds: string[]) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function makeActivity(taskId: string, type: ActivityType, actorId: string, message: string): ActivityEvent {
  return { id: uid("ae"), taskId, type, actorId, message, createdAt: new Date().toISOString() };
}

function makeNotification(
  type: NotificationType,
  title: string,
  body: string,
  taskId: string | null,
  recipientId: string
): Notification {
  return {
    id: uid("n"),
    type,
    title,
    body,
    taskId,
    recipientId,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

function resolveMentions(body: string, users: User[]): string[] {
  const ids: string[] = [];
  for (const u of users) {
    if (new RegExp(`@${u.name}`, "i").test(body)) ids.push(u.id);
  }
  return ids;
}

const FALLBACK_USER: User = {
  id: "",
  name: "You",
  email: "",
  avatarColor: "#6366f1",
  role: "requester",
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, LIVE ? emptyState : demoState);
  const [loading, setLoading] = useState(LIVE);
  const sbRef = useRef<SupabaseClient | null>(null);

  // ── DEMO mode: localStorage persistence ──────────────────────
  useEffect(() => {
    if (LIVE) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", payload: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (LIVE) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // ── LIVE mode: load from Supabase + realtime ─────────────────
  useEffect(() => {
    if (!LIVE) return;
    const sb = createBrowserSupabase();
    if (!sb) return;
    sbRef.current = sb;
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const snapshot = await repo.fetchWorkspace(sb);
      if (cancelled) return;
      dispatch({ type: "HYDRATE", payload: { ...snapshot, currentUserId: user.id } });
      setLoading(false);
    })();

    const refetch = {
      tasks: async () =>
        dispatch({ type: "SET_COLLECTION", key: "tasks", value: await repo.fetchTasks(sb) }),
      comments: async () =>
        dispatch({ type: "SET_COLLECTION", key: "comments", value: await repo.fetchComments(sb) }),
      activity: async () =>
        dispatch({ type: "SET_COLLECTION", key: "activity", value: await repo.fetchActivity(sb) }),
      notifications: async () =>
        dispatch({ type: "SET_COLLECTION", key: "notifications", value: await repo.fetchNotifications(sb) }),
    };

    const channel = sb
      .channel("workspace")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, refetch.tasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "attachments" }, refetch.tasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "reference_links" }, refetch.tasks)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, refetch.comments)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_events" }, refetch.activity)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, refetch.notifications)
      .subscribe();

    return () => {
      cancelled = true;
      sb.removeChannel(channel);
    };
  }, []);

  const getUser = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? (LIVE ? FALLBACK_USER : state.users[0]),
    [state.users, state.currentUserId]
  );

  const adminIds = useCallback(
    () => state.users.filter((u) => u.role === "admin").map((u) => u.id),
    [state.users]
  );

  const createTask = useCallback(
    async (task: Task): Promise<string> => {
      const recipients = adminIds().filter((id) => id !== task.requesterId);

      if (LIVE && sbRef.current) {
        const saved = await repo.insertTask(sbRef.current, task);
        const finalTask = saved ?? task;
        const activity = makeActivity(finalTask.id, "created", task.requesterId, "Task created");
        const notifications = recipients.map((id) =>
          makeNotification("task_assigned", `New request: ${finalTask.reference}`, task.title, finalTask.id, id)
        );
        dispatch({ type: "ADD_TASK", task: finalTask, activity, notifications });
        await Promise.all([
          repo.insertActivity(sbRef.current, activity),
          repo.insertNotifications(sbRef.current, notifications),
        ]);
        return finalTask.id;
      }

      const activity = makeActivity(task.id, "created", task.requesterId, "Task created");
      const notifications = [
        makeNotification("task_assigned", `New request: ${task.reference}`, task.title, task.id, GOKUL_ID),
      ];
      dispatch({ type: "ADD_TASK", task, activity, notifications });
      return task.id;
    },
    [adminIds]
  );

  const persistUpdate = useCallback(
    (id: string, patch: Partial<Task>, activity?: ActivityEvent, notifications?: Notification[]) => {
      dispatch({ type: "UPDATE_TASK", id, patch, activity, notifications });
      if (LIVE && sbRef.current) {
        repo.updateTask(sbRef.current, id, patch);
        if (activity) repo.insertActivity(sbRef.current, activity);
        if (notifications?.length) repo.insertNotifications(sbRef.current, notifications);
      }
    },
    []
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>, opts?: { activityType?: ActivityType; message?: string }) => {
      const task = state.tasks.find((t) => t.id === id);
      const activity =
        opts?.activityType && task
          ? makeActivity(id, opts.activityType, state.currentUserId, opts.message ?? "Task updated")
          : undefined;
      const notifications =
        task && task.requesterId !== state.currentUserId
          ? [makeNotification("task_updated", `${task.reference} updated`, opts?.message ?? "Your request was updated.", id, task.requesterId)]
          : undefined;
      persistUpdate(id, patch, activity, notifications);
    },
    [state.tasks, state.currentUserId, persistUpdate]
  );

  const changeStatus = useCallback(
    (id: string, status: Status) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task || task.status === status) return;
      const type: ActivityType = status === "completed" ? "completed" : "status_changed";
      const message = status === "completed" ? "Task completed" : `Moved to ${STATUS_META[status].label}`;
      const notifications =
        task.requesterId !== state.currentUserId
          ? [
              makeNotification(
                status === "completed" ? "task_completed" : "task_updated",
                `${task.reference}: ${STATUS_META[status].label}`,
                message,
                id,
                task.requesterId
              ),
            ]
          : [];
      persistUpdate(id, { status }, makeActivity(id, type, state.currentUserId, message), notifications);
    },
    [state.tasks, state.currentUserId, persistUpdate]
  );

  const changePriority = useCallback(
    (id: string, priority: Priority) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task || task.priority === priority) return;
      const message = `Priority changed to ${PRIORITY_META[priority].label}`;
      const notifications =
        task.requesterId !== state.currentUserId
          ? [makeNotification("priority_changed", `${task.reference}: priority ${PRIORITY_META[priority].label}`, message, id, task.requesterId)]
          : [];
      persistUpdate(id, { priority }, makeActivity(id, "priority_changed", state.currentUserId, message), notifications);
    },
    [state.tasks, state.currentUserId, persistUpdate]
  );

  const addComment = useCallback(
    (taskId: string, body: string, opts?: { parentId?: string | null; isQuestion?: boolean }) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const mentions = resolveMentions(body, state.users);
      const comment: Comment = {
        id: uid("c"),
        taskId,
        authorId: state.currentUserId,
        body,
        mentions,
        parentId: opts?.parentId ?? null,
        isQuestion: opts?.isQuestion,
        createdAt: new Date().toISOString(),
      };
      const activity = makeActivity(
        taskId,
        opts?.isQuestion ? "question_asked" : "comment_added",
        state.currentUserId,
        opts?.isQuestion ? "Asked a question" : "Added a comment"
      );

      const recipients = new Set<string>(mentions);
      const admins = adminIds();
      if (admins.includes(state.currentUserId)) recipients.add(task.requesterId);
      else admins.forEach((a) => recipients.add(a));
      recipients.delete(state.currentUserId);

      const notifications = [...recipients].filter(Boolean).map((rid) =>
        makeNotification(
          opts?.isQuestion ? "question_asked" : "comment_added",
          opts?.isQuestion ? `Question on ${task.reference}` : `New comment on ${task.reference}`,
          body.slice(0, 90),
          taskId,
          rid
        )
      );

      dispatch({ type: "ADD_COMMENT", comment, activity, notifications });
      if (LIVE && sbRef.current) {
        repo.insertComment(sbRef.current, comment);
        repo.insertActivity(sbRef.current, activity);
        repo.insertNotifications(sbRef.current, notifications);
      }
    },
    [state.tasks, state.users, state.currentUserId, adminIds]
  );

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: "READ_NOTIFICATION", id });
    if (LIVE && sbRef.current) repo.markNotificationRead(sbRef.current, id);
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: "READ_ALL_NOTIFICATIONS" });
    if (LIVE && sbRef.current && state.currentUserId) repo.markAllRead(sbRef.current, state.currentUserId);
  }, [state.currentUserId]);

  const reorderQueue = useCallback((orderedIds: string[]) => {
    dispatch({ type: "REORDER_QUEUE", orderedIds });
    if (LIVE && sbRef.current) repo.updateQueueRanks(sbRef.current, orderedIds);
  }, []);

  const value: StoreContextValue = {
    ...state,
    mode: LIVE ? "live" : "demo",
    loading,
    currentUser,
    isAdmin: currentUser.role === "admin",
    getUser,
    createTask,
    updateTask,
    changeStatus,
    changePriority,
    addComment,
    markNotificationRead,
    markAllRead,
    setCurrentUser: (id) => dispatch({ type: "SET_USER", id }),
    reorderQueue,
    reset: () => {
      if (LIVE) return;
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: "HYDRATE", payload: demoState });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
