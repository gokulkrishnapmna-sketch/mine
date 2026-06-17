"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { TaskCard } from "@/components/tasks/task-card";
import { KANBAN_COLUMNS, STATUS_META } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Status, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function DraggableCard({ task, commentCount }: { task: Task; commentCount: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
    >
      <TaskCard task={task} commentCount={commentCount} compact />
    </div>
  );
}

function Column({
  status,
  tasks,
  commentCount,
}: {
  status: Status;
  tasks: Task[];
  commentCount: (id: string) => number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-4 w-1 rounded-full border-l-2", meta.accent)} />
          <span className="text-sm font-semibold">{meta.label}</span>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[200px] flex-1 flex-col gap-2.5 rounded-xl border border-dashed border-transparent bg-secondary/40 p-2 transition-colors",
          isOver && "border-primary/50 bg-accent"
        )}
      >
        {tasks.map((t) => (
          <DraggableCard key={t.id} task={t} commentCount={commentCount(t.id)} />
        ))}
        {tasks.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { tasks, comments, changeStatus } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = useMemo(() => {
    const map = {} as Record<Status, Task[]>;
    for (const s of KANBAN_COLUMNS) map[s] = [];
    for (const t of tasks) map[t.status]?.push(t);
    return map;
  }, [tasks]);

  const commentCount = (id: string) => comments.filter((c) => c.taskId === id).length;
  const activeTask = tasks.find((t) => t.id === activeId);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }
  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const overId = e.over?.id;
    if (!overId) return;
    const task = tasks.find((t) => t.id === e.active.id);
    if (task && overId !== task.status && KANBAN_COLUMNS.includes(overId as Status)) {
      changeStatus(task.id, overId as Status);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {KANBAN_COLUMNS.map((s) => (
          <Column key={s} status={s} tasks={byStatus[s]} commentCount={commentCount} />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} commentCount={commentCount(activeTask.id)} compact dragging />}
      </DragOverlay>
    </DndContext>
  );
}
