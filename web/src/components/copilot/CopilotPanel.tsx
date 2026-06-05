"use client";
import { ChevronDown, Maximize2, Minimize2, Plus, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useCopilotChat } from "@/lib/copilot/client";
import { cn } from "@/lib/utils";
import { useCopilot } from "./CopilotProvider";
import { Composer } from "./Composer";
import { MessageItem, StreamingBubble } from "./MessageItem";
import { SessionList } from "./SessionList";

export function CopilotPanel({ compact }: { compact: boolean }) {
  const { chatId, expand, minimize, close, startNewChat } = useCopilot();
  const { messages, streaming, busy, send } = useCopilotChat(chatId);
  const pathname = usePathname();
  const chat = useLiveQuery(() => (chatId ? db.chats.get(chatId) : undefined), [chatId]);
  const [showSessions, setShowSessions] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, streaming]);

  return (
    <div className="flex h-full overflow-hidden rounded-[inherit] bg-canvas">
      {!compact && (
        <aside className="hidden w-60 shrink-0 border-r border-line bg-surface/40 sm:block">
          <SessionList />
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-1 border-b border-line px-3 py-2">
          <span className="beacon grid h-6 w-6 shrink-0 place-items-center rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <p className="min-w-0 flex-1 truncate px-1 text-sm font-semibold text-ink">{chat?.title ?? "Copilot"}</p>
          <HeaderBtn label="New chat" onClick={() => void startNewChat()}>
            <Plus className="h-4 w-4" />
          </HeaderBtn>
          {compact ? (
            <HeaderBtn label="Expand to full page" onClick={expand}>
              <Maximize2 className="h-4 w-4" />
            </HeaderBtn>
          ) : (
            <HeaderBtn label="Minimize to popup" onClick={minimize}>
              <Minimize2 className="h-4 w-4" />
            </HeaderBtn>
          )}
          <HeaderBtn label="Close" onClick={close}>
            <X className="h-4 w-4" />
          </HeaderBtn>
        </header>

        {compact && (
          <div className="relative border-b border-line">
            <button
              onClick={() => setShowSessions((o) => !o)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-ink-soft hover:bg-surface-2"
            >
              <span>Chats</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showSessions && "rotate-180")} />
            </button>
            {showSessions && (
              <div className="absolute inset-x-0 top-full z-10 max-h-72 overflow-y-auto border-b border-line bg-canvas shadow-[var(--shadow-lift)]">
                <SessionList onPick={() => setShowSessions(false)} />
              </div>
            )}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {messages.length === 0 && streaming === null ? (
            <EmptyChat />
          ) : (
            <>
              {messages.map((m) => (
                <MessageItem key={m.id} message={m} />
              ))}
              {streaming !== null && <StreamingBubble text={streaming} />}
            </>
          )}
        </div>

        <Composer busy={busy} chatId={chatId} path={pathname} onSend={(t, a) => send(t, a, pathname)} />
      </div>
    </div>
  );
}

function HeaderBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <span className="beacon mb-3 grid h-12 w-12 place-items-center rounded-full">
        <Sparkles className="h-6 w-6 text-white" />
      </span>
      <p className="font-display text-lg text-ink">How can I help right now?</p>
      <p className="mt-1 max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
        I can read your circle, places, and notes and give you one clear next step. Ask me anything, or attach a file.
      </p>
    </div>
  );
}
