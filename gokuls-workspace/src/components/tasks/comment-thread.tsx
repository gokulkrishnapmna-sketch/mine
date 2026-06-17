"use client";

import { useMemo, useState } from "react";
import { HelpCircle, Send, CornerDownRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Comment } from "@/lib/types";
import { cn, formatRelative } from "@/lib/utils";

/** Renders @mentions as highlighted chips. */
function renderBody(body: string, names: string[]) {
  if (names.length === 0) return body;
  const pattern = new RegExp(`(@(?:${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}))`, "g");
  return body.split(pattern).map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="rounded bg-primary/10 px-1 font-medium text-primary">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function CommentItem({
  comment,
  replies,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string) => void;
}) {
  const { getUser, users } = useStore();
  const author = getUser(comment.authorId);
  const names = users.map((u) => u.name);

  return (
    <div className="flex gap-3">
      {author && <Avatar name={author.name} color={author.avatarColor} />}
      <div className="min-w-0 flex-1">
        <div className="rounded-xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold">{author?.name}</span>
            {comment.isQuestion && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                <HelpCircle className="size-3" /> Question
              </span>
            )}
            <span className="text-xs text-muted-foreground">{formatRelative(comment.createdAt)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{renderBody(comment.body, names)}</p>
        </div>
        <button
          onClick={() => onReply(comment.id)}
          className="mt-1 inline-flex items-center gap-1 px-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <CornerDownRight className="size-3" /> Reply
        </button>

        {replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
            {replies.map((r) => {
              const ra = getUser(r.authorId);
              return (
                <div key={r.id} className="flex gap-2.5">
                  {ra && <Avatar name={ra.name} color={ra.avatarColor} size="sm" />}
                  <div className="min-w-0 flex-1 rounded-lg rounded-tl-sm border border-border bg-secondary/40 px-3 py-2">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-xs font-semibold">{ra?.name}</span>
                      <span className="text-[11px] text-muted-foreground">{formatRelative(r.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{renderBody(r.body, names)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentThread({ taskId }: { taskId: string }) {
  const { comments, currentUser, addComment, isAdmin } = useStore();
  const [body, setBody] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const taskComments = useMemo(
    () => comments.filter((c) => c.taskId === taskId).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [comments, taskId]
  );
  const roots = taskComments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => taskComments.filter((c) => c.parentId === id);

  function submit() {
    if (!body.trim()) return;
    addComment(taskId, body.trim(), { parentId: replyTo, isQuestion: isQuestion && !replyTo });
    setBody("");
    setIsQuestion(false);
    setReplyTo(null);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        {roots.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet. Start the conversation below.</p>
        )}
        {roots.map((c) => (
          <CommentItem key={c.id} comment={c} replies={repliesOf(c.id)} onReply={(id) => setReplyTo(id)} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-md bg-secondary/60 px-2 py-1 text-xs text-muted-foreground">
            Replying in thread
            <button onClick={() => setReplyTo(null)} className="hover:text-foreground">
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <Avatar name={currentUser.name} color={currentUser.avatarColor} />
          <div className="flex-1">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment… use @Name to mention someone."
              rows={2}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
            />
            <div className="mt-2 flex items-center justify-between">
              {isAdmin && !replyTo ? (
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                    className="size-3.5 rounded border-border"
                  />
                  <HelpCircle className="size-3.5" /> Mark as question (notifies the requester)
                </label>
              ) : (
                <span className="text-[11px] text-muted-foreground">⌘+Enter to send</span>
              )}
              <Button size="sm" onClick={submit} disabled={!body.trim()}>
                <Send className="size-3.5" /> {isQuestion ? "Ask" : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
