"use client";
import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { addMessage, renameChat } from "./repo";
import { buildDataSnapshot, describePage } from "./context";
import type { Attachment, ChatMessage, CopilotRequest, ReportContent, ReportFormat, WireMessage } from "./types";

async function streamCopilot(
  payload: CopilotRequest,
  onToken: (full: string) => void,
): Promise<{ text: string; model?: string }> {
  const res = await fetch("/api/copilot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const model = res.headers.get("x-model") ?? undefined;
  if (!res.body) {
    const t = await res.text();
    onToken(t);
    return { text: t, model };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
    onToken(text);
  }
  return { text, model };
}

const toWire = (messages: ChatMessage[]): WireMessage[] =>
  messages.map((m) => ({ role: m.role, content: m.content, attachments: m.attachments }));

const makeTitle = (s: string) => {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > 42 ? `${t.slice(0, 42)}...` : t || "New chat";
};

export function useCopilotChat(chatId: string | null) {
  const messages =
    useLiveQuery(
      () =>
        chatId
          ? db.messages.where("chatId").equals(chatId).sortBy("createdAt")
          : Promise.resolve<ChatMessage[]>([]),
      [chatId],
    ) ?? [];
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = useCallback(
    async (text: string, attachments: Attachment[] | undefined, path: string) => {
      const trimmed = text.trim();
      if (!chatId || busy || (!trimmed && !attachments?.length)) return;
      setBusy(true);
      await addMessage({ chatId, role: "user", content: trimmed, attachments });
      const chat = await db.chats.get(chatId);
      if (chat && chat.title === "New chat") await renameChat(chatId, makeTitle(trimmed || attachments?.[0]?.name || "New chat"));

      const history = await db.messages.where("chatId").equals(chatId).sortBy("createdAt");
      const data = await buildDataSnapshot();
      const page = describePage(path);
      setStreaming("");
      try {
        const { text: full, model } = await streamCopilot(
          { messages: toWire(history), page, data, mode: "chat" },
          (partial) => setStreaming(partial),
        );
        await addMessage({ chatId, role: "assistant", content: full, model });
      } catch {
        await addMessage({
          chatId,
          role: "assistant",
          content: "Something went wrong reaching the copilot. Please try again.",
        });
      } finally {
        setStreaming(null);
        setBusy(false);
      }
    },
    [chatId, busy],
  );

  return { messages, streaming, busy, send };
}

export async function requestReport(chatId: string, path: string, format: ReportFormat): Promise<ReportContent> {
  const history = await db.messages.where("chatId").equals(chatId).sortBy("createdAt");
  const data = await buildDataSnapshot();
  const page = describePage(path);
  const messages: WireMessage[] = [
    ...toWire(history),
    {
      role: "user",
      content: "Create a downloadable report from what we have discussed and from my data. Make it concrete and useful.",
    },
  ];
  const res = await fetch("/api/copilot", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, page, data, mode: "report", reportFormat: format } satisfies CopilotRequest),
  });
  if (!res.ok) throw new Error(res.status === 503 ? "Add your Gemini API key first." : `Report failed (${res.status})`);
  return (await res.json()) as ReportContent;
}
