"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { db } from "@/lib/db";
import { createChat, deleteChat, renameChat } from "@/lib/copilot/repo";
import { cn } from "@/lib/utils";
import { useCopilot } from "./CopilotProvider";

export function SessionList({ onPick }: { onPick?: () => void }) {
  const { chatId, selectChat, startNewChat } = useCopilot();
  const chats = useLiveQuery(() => db.chats.orderBy("updatedAt").reverse().toArray(), []) ?? [];

  const handleDelete = async (id: string) => {
    await deleteChat(id);
    if (id === chatId) {
      const next = await db.chats.orderBy("updatedAt").reverse().first();
      selectChat(next ? next.id : (await createChat()).id);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
        <button
          onClick={async () => {
            await startNewChat();
            onPick?.();
          }}
          className="focus-ring flex w-full items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-medium text-ink transition hover:brightness-95"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {chats.length === 0 && <p className="px-2 py-3 text-xs text-ink-faint">No chats yet.</p>}
        {chats.map((c) => (
          <SessionRow
            key={c.id}
            title={c.title}
            active={c.id === chatId}
            onSelect={() => {
              selectChat(c.id);
              onPick?.();
            }}
            onRename={(t) => renameChat(c.id, t)}
            onDelete={() => handleDelete(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SessionRow({
  title,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  title: string;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void | Promise<unknown>;
  onDelete: () => void | Promise<unknown>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [val, setVal] = useState(title);

  const save = async () => {
    await onRename(val);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm",
        active ? "bg-warm-soft text-beacon-deep" : "text-ink-soft hover:bg-surface-2",
      )}
    >
      {editing ? (
        <>
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save();
              if (e.key === "Escape") setEditing(false);
            }}
            className="min-w-0 flex-1 rounded-md bg-surface px-1.5 py-0.5 text-ink outline-none ring-1 ring-line"
          />
          <IconBtn label="Save" onClick={save}>
            <Check className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Cancel" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5" />
          </IconBtn>
        </>
      ) : confirm ? (
        <>
          <span className="flex-1 truncate text-xs text-ink-soft">Delete this chat?</span>
          <IconBtn label="Confirm delete" onClick={onDelete} className="text-[color:var(--color-ember)]">
            <Check className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Keep" onClick={() => setConfirm(false)}>
            <X className="h-3.5 w-3.5" />
          </IconBtn>
        </>
      ) : (
        <>
          <button onClick={onSelect} className="min-w-0 flex-1 truncate py-0.5 text-left">
            {title}
          </button>
          <IconBtn
            label="Rename"
            onClick={() => {
              setVal(title);
              setEditing(true);
            }}
            className="text-ink-faint"
          >
            <Pencil className="h-3.5 w-3.5" />
          </IconBtn>
          <IconBtn label="Delete" onClick={() => setConfirm(true)} className="text-ink-faint">
            <Trash2 className="h-3.5 w-3.5" />
          </IconBtn>
        </>
      )}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void | Promise<unknown>;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={() => void onClick()}
      className={cn("focus-ring grid h-6 w-6 shrink-0 place-items-center rounded-md hover:bg-surface", className)}
    >
      {children}
    </button>
  );
}
