"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Link2, Paperclip, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAssistPanel } from "./ai-assist-panel";
import { useStore } from "@/lib/store";
import {
  DELIVERABLE_TYPES,
  DEPARTMENTS,
  PRIORITIES,
  PRIORITY_META,
  detectProvider,
  REFERENCE_PROVIDER_META,
} from "@/lib/constants";
import { estimateEffort, validateRequest, type DraftRequest } from "@/lib/ai";
import type {
  Attachment,
  DeliverableType,
  Department,
  Priority,
  ReferenceLink,
  Task,
} from "@/lib/types";
import { uid } from "@/lib/utils";

const FILE_KIND: Record<string, Attachment["kind"]> = {
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  ppt: "ppt",
  pptx: "ppt",
  doc: "doc",
  docx: "doc",
  zip: "zip",
  mp4: "video",
  mov: "video",
};

export function TaskForm() {
  const router = useRouter();
  const { currentUser, createTask, tasks } = useStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [businessObjective, setBusinessObjective] = useState("");
  const [department, setDepartment] = useState<Department>(currentUser.department ?? "Marketing");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [deliverableType, setDeliverableType] = useState<DeliverableType | "">("");
  const [contactName, setContactName] = useState(currentUser.name);
  const [contactEmail, setContactEmail] = useState(currentUser.email);
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingInput, setPendingInput] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [refUrl, setRefUrl] = useState("");
  const [references, setReferences] = useState<ReferenceLink[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const draft: DraftRequest = useMemo(
    () => ({
      title,
      description,
      businessObjective,
      deliverableType,
      deadline: deadline || null,
      priority,
      contactEmail,
      contactPhone,
      references: references.length,
      attachments: attachments.length,
      pendingInfo: pending,
    }),
    [
      title,
      description,
      businessObjective,
      deliverableType,
      deadline,
      priority,
      contactEmail,
      contactPhone,
      references.length,
      attachments.length,
      pending,
    ]
  );

  function addReference() {
    const url = refUrl.trim();
    if (!url) return;
    const provider = detectProvider(url);
    setReferences((r) => [
      ...r,
      { id: uid("r"), url, provider, label: REFERENCE_PROVIDER_META[provider].label },
    ]);
    setRefUrl("");
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next: Attachment[] = Array.from(files).map((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      return {
        id: uid("a"),
        name: f.name,
        kind: FILE_KIND[ext] ?? "other",
        sizeLabel: `${(f.size / 1024).toFixed(0)} KB`,
        url: "#",
        uploadedBy: currentUser.id,
        uploadedAt: new Date().toISOString(),
      };
    });
    setAttachments((a) => [...a, ...next]);
  }

  function addToken(
    value: string,
    setValue: (v: string) => void,
    list: string[],
    setList: (v: string[]) => void
  ) {
    const v = value.trim();
    if (v && !list.includes(v)) setList([...list, v]);
    setValue("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const validation = validateRequest(draft);
    if (validation.missing.length > 0) return;

    const ref = `GW-${119 + tasks.filter((t) => t.reference.startsWith("GW-")).length}`;
    const now = new Date().toISOString();
    const task: Task = {
      id: uid("t"),
      reference: ref,
      title: title.trim(),
      description: description.trim(),
      businessObjective: businessObjective.trim(),
      status: "backlog",
      priority: (priority || "medium") as Priority,
      deliverableType: deliverableType as DeliverableType,
      department,
      requesterId: currentUser.id,
      contact: { name: contactName, email: contactEmail, phone: contactPhone || undefined },
      deadline: deadline || null,
      estimatedCompletion: null,
      effort: estimateEffort(draft).effort,
      tags,
      pendingInfo: pending,
      additionalNotes: notes || undefined,
      attachments,
      references,
      intakeScore: validation.score,
      createdAt: now,
      updatedAt: now,
    };
    const id = await createTask(task);
    router.push(`/tasks/${id}`);
  }

  const validation = validateRequest(draft);
  const missingAfterSubmit = submitted && validation.missing.length > 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">The request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Task Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 launch — LinkedIn campaign creatives"
              />
            </Field>
            <Field label="Task Description" required hint="What needs to be designed? Be specific.">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the deliverable, format, sizes, copy ownership, style direction…"
              />
            </Field>
            <Field label="Business Objective" required hint="Why is this needed? What outcome does it drive?">
              <Textarea
                value={businessObjective}
                onChange={(e) => setBusinessObjective(e.target.value)}
                rows={2}
                placeholder="e.g. Drive demo signups for the v3 launch."
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Classification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Deliverable Type" required>
              <Select value={deliverableType} onChange={(e) => setDeliverableType(e.target.value as DeliverableType)}>
                <option value="">Select type…</option>
                {DELIVERABLE_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority" hint="Or apply the AI suggestion →">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="">Let Gokul decide</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Department" required>
              <Select value={department} onChange={(e) => setDepartment(e.target.value as Department)}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Deadline" required>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </Field>
            <Field label="Tags" className="sm:col-span-2">
              <TokenInput
                value={tagInput}
                setValue={setTagInput}
                tokens={tags}
                onAdd={() => addToken(tagInput, setTagInput, tags, setTags)}
                onRemove={(t) => setTags(tags.filter((x) => x !== t))}
                placeholder="Add a tag and press Enter…"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact person</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Field label="Name" required>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1 …" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">References & files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Reference Links" hint="Figma, Google Drive, YouTube, Dropbox, OneDrive…">
              <div className="flex gap-2">
                <Input
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addReference();
                    }
                  }}
                  placeholder="https://figma.com/…"
                />
                <Button type="button" variant="outline" size="icon" onClick={addReference}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {references.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {references.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs"
                    >
                      <Link2 className="size-3.5 text-muted-foreground" />
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                        {REFERENCE_PROVIDER_META[r.provider].label}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.url}</span>
                      <button type="button" onClick={() => setReferences(references.filter((x) => x.id !== r.id))}>
                        <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>

            <Field label="Reference Files" hint="PDF, PPT, DOC, images, video, ZIP">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent">
                <Paperclip className="size-4" />
                Click to attach files
                <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </label>
              {attachments.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {attachments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-1.5 text-xs"
                    >
                      <Paperclip className="size-3.5 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground">{a.sizeLabel}</span>
                      <button type="button" onClick={() => setAttachments(attachments.filter((x) => x.id !== a.id))}>
                        <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dependencies & notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="What information is still pending?" hint="Anything you still owe Gokul before he can start.">
              <TokenInput
                value={pendingInput}
                setValue={setPendingInput}
                tokens={pending}
                onAdd={() => addToken(pendingInput, setPendingInput, pending, setPending)}
                onRemove={(t) => setPending(pending.filter((x) => x !== t))}
                placeholder="e.g. Final copy, approved logo… (Enter to add)"
              />
            </Field>
            <Field label="Additional Notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything else Gokul should know…" />
            </Field>
          </CardContent>
        </Card>

        {missingAfterSubmit && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            Please complete the required fields highlighted in the assistant before submitting.
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            <Send className="size-4" /> Submit Request
          </Button>
        </div>
      </div>

      <div className="lg:block">
        <AiAssistPanel draft={draft} onApplyPriority={(p) => setPriority(p)} />
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TokenInput({
  value,
  setValue,
  tokens,
  onAdd,
  onRemove,
  placeholder,
}: {
  value: string;
  setValue: (v: string) => void;
  tokens: string[];
  onAdd: () => void;
  onRemove: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
        placeholder={placeholder}
      />
      {tokens.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tokens.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
            >
              {t}
              <button type="button" onClick={() => onRemove(t)}>
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
