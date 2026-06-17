"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusBadge } from "@/components/tasks/status-badge";
import { DeadlinePill } from "@/components/tasks/deadline-pill";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { buildQueue, queueScore } from "@/lib/queue";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function QueueRow({
  task,
  index,
  draggable,
}: {
  task: Task;
  index: number;
  draggable: boolean;
}) {
  const { getUser } = useStore();
  const requester = getUser(task.requesterId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft",
        isDragging && "z-10 shadow-soft-lg ring-2 ring-primary/40"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
        {index + 1}
      </span>
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Reorder"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{task.reference}</span>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        <p className="mt-0.5 truncate text-sm font-medium">{task.title}</p>
      </Link>
      <div className="hidden items-center gap-4 sm:flex">
        <DeadlinePill deadline={task.deadline} />
        <div className="flex items-center gap-1.5">
          {requester && <Avatar name={requester.name} color={requester.avatarColor} size="sm" />}
        </div>
        <span
          className="w-12 text-right text-xs font-semibold tabular-nums text-muted-foreground"
          title="Queue score"
        >
          {queueScore(task)}
        </span>
      </div>
    </div>
  );
}

export default function QueuePage() {
  const { tasks, isAdmin, reorderQueue } = useStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const queue = useMemo(() => buildQueue(tasks), [tasks]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = queue.map((t) => t.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    reorderQueue(arrayMove(ids, from, to));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Smart Queue"
        description="Automatically ranked by priority weight, deadline proximity, and age. Visible to everyone."
      />

      <Card className="mb-4 flex items-start gap-3 border-primary/20 bg-accent/40 p-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">How ranking works:</span> score = priority
          weight (Critical 100 → Low 25) + deadline urgency + aging + intake quality.
          {isAdmin
            ? " Drag the handle to manually pin an order — your order overrides the score."
            : " Only Gokul can manually reorder the queue."}
        </p>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={queue.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {queue.map((t, i) => (
              <QueueRow key={t.id} task={t} index={i} draggable={isAdmin} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
