"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TaskForm } from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="New Design Request"
        description="One structured brief — so nothing gets lost in chats, emails, or calls. The assistant checks your brief as you type."
      />
      <TaskForm />
    </div>
  );
}
