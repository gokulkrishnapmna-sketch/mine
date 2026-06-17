"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
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

interface State {
  users: User[];
  tasks: Task[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: Notification[];
  currentUserId: string;
}

const STORAGE_KEY = "gokuls-workspace:v1";

const initialState: State = {
  users: SEED_USERS,
  tasks: SEED_TASKS,
  comments: SEED_COMMENTS,
  activity: SEED_ACTIVITY,
  notifications: SEED_NOTIFICATIONS,
  currentUserId: CURRENT_USER_ID,
};

type Action =
  | { type: "HYDRATE"; payload: State }
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
  currentUser: User;
  isAdmin: boolean;
  getUser: (id: string) => User | undefined;
  createTask: (task: Task) => void;
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

/** Naive @mention resolver: matches "@First Last" against user names. */
function resolveMentions(body: string, users: User[]): string[] {
  const ids: string[] = [];
  for (const u of users) {
    if (new RegExp(`@${u.name}`, "i").test(body)) ids.push(u.id);
  }
  return ids;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount (demo persistence).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", payload: JSON.parse(raw) });
    } catch {
      /* ignore corrupt state */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable */
    }
  }, [state]);

  const getUser = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? state.users[0],
    [state.users, state.currentUserId]
  );

  const createTask = useCallback(
    (task: Task) => {
      const activity = makeActivity(task.id, "created", task.requesterId, "Task created");
      // Notify Gokul that a new request landed.
      const notifications = [
        makeNotification(
          "task_assigned",
          `New request: ${task.reference}`,
          task.title,
          task.id,
          GOKUL_ID
        ),
      ];
      dispatch({ type: "ADD_TASK", task, activity, notifications });
    },
    []
  );

  const updateTask = useCallback(
    (
      id: string,
      patch: Partial<Task>,
      opts?: { activityType?: ActivityType; message?: string }
    ) => {
      const task = state.tasks.find((t) => t.id === id);
      const activity =
        opts?.activityType && task
          ? makeActivity(id, opts.activityType, state.currentUserId, opts.message ?? "Task updated")
          : undefined;
      const notifications =
        task && task.requesterId !== state.currentUserId
          ? [
              makeNotification(
                "task_updated",
                `${task.reference} updated`,
                opts?.message ?? "Your request was updated.",
                id,
                task.requesterId
              ),
            ]
          : undefined;
      dispatch({ type: "UPDATE_TASK", id, patch, activity, notifications });
    },
    [state.tasks, state.currentUserId]
  );

  const changeStatus = useCallback(
    (id: string, status: Status) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task || task.status === status) return;
      const type: ActivityType = status === "completed" ? "completed" : "status_changed";
      const message =
        status === "completed" ? "Task completed" : `Moved to ${STATUS_META[status].label}`;
      const notifications: Notification[] = [];
      if (task.requesterId !== state.currentUserId) {
        notifications.push(
          makeNotification(
            status === "completed" ? "task_completed" : "task_updated",
            `${task.reference}: ${STATUS_META[status].label}`,
            message,
            id,
            task.requesterId
          )
        );
      }
      dispatch({
        type: "UPDATE_TASK",
        id,
        patch: { status },
        activity: makeActivity(id, type, state.currentUserId, message),
        notifications,
      });
    },
    [state.tasks, state.currentUserId]
  );

  const changePriority = useCallback(
    (id: string, priority: Priority) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task || task.priority === priority) return;
      const message = `Priority changed to ${PRIORITY_META[priority].label}`;
      const notifications: Notification[] =
        task.requesterId !== state.currentUserId
          ? [
              makeNotification(
                "priority_changed",
                `${task.reference}: priority ${PRIORITY_META[priority].label}`,
                message,
                id,
                task.requesterId
              ),
            ]
          : [];
      dispatch({
        type: "UPDATE_TASK",
        id,
        patch: { priority },
        activity: makeActivity(id, "priority_changed", state.currentUserId, message),
        notifications,
      });
    },
    [state.tasks, state.currentUserId]
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
      // Always loop in the relevant counterpart.
      if (state.currentUserId === GOKUL_ID) recipients.add(task.requesterId);
      else recipients.add(GOKUL_ID);
      recipients.delete(state.currentUserId);

      const notifications = [...recipients].map((rid) =>
        makeNotification(
          opts?.isQuestion ? "question_asked" : "comment_added",
          opts?.isQuestion ? `Question on ${task.reference}` : `New comment on ${task.reference}`,
          body.slice(0, 90),
          taskId,
          rid
        )
      );

      dispatch({ type: "ADD_COMMENT", comment, activity, notifications });
    },
    [state.tasks, state.users, state.currentUserId]
  );

  const value: StoreContextValue = {
    ...state,
    currentUser,
    isAdmin: currentUser.role === "admin",
    getUser,
    createTask,
    updateTask,
    changeStatus,
    changePriority,
    addComment,
    markNotificationRead: (id) => dispatch({ type: "READ_NOTIFICATION", id }),
    markAllRead: () => dispatch({ type: "READ_ALL_NOTIFICATIONS" }),
    setCurrentUser: (id) => dispatch({ type: "SET_USER", id }),
    reorderQueue: (orderedIds) => dispatch({ type: "REORDER_QUEUE", orderedIds }),
    reset: () => {
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: "HYDRATE", payload: initialState });
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
