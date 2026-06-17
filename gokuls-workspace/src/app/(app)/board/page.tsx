"use client";

import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/board/kanban-board";
import { useStore } from "@/lib/store";

export default function BoardPage() {
  const { isAdmin } = useStore();

  return (
    <div className="mx-auto max-w-[1600px]">
      <PageHeader
        title="Kanban Board"
        description={
          isAdmin
            ? "Drag cards across columns to update status — every change is logged automatically."
            : "Live board of all design work. Drag is available to Gokul; you can open any card for details."
        }
      />
      <KanbanBoard />
    </div>
  );
}
