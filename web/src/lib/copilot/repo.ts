import { db } from "@/lib/db";
import { nowISO } from "@/lib/utils";
import type { Chat, ChatMessage } from "./types";

const rid = (p: string) =>
  `${p}_${
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.abs(Math.floor(performance.now() * 1000)).toString(36)
  }`;

export async function createChat(title = "New chat"): Promise<Chat> {
  const t = nowISO();
  const chat: Chat = { id: rid("chat"), title, createdAt: t, updatedAt: t };
  await db.chats.put(chat);
  return chat;
}

export const renameChat = (id: string, title: string) =>
  db.chats.update(id, { title: title.trim() || "Untitled", updatedAt: nowISO() });

export async function deleteChat(id: string): Promise<void> {
  await db.transaction("rw", db.chats, db.messages, async () => {
    await db.messages.where("chatId").equals(id).delete();
    await db.chats.delete(id);
  });
}

export async function addMessage(
  m: Omit<ChatMessage, "id" | "createdAt"> & Partial<Pick<ChatMessage, "id" | "createdAt">>,
): Promise<ChatMessage> {
  const msg = { id: rid("msg"), createdAt: nowISO(), ...m } as ChatMessage;
  await db.messages.put(msg);
  await db.chats.update(m.chatId, { updatedAt: nowISO() });
  return msg;
}

export const getMessages = (chatId: string) =>
  db.messages.where("chatId").equals(chatId).sortBy("createdAt");

export const messageCount = (chatId: string) =>
  db.messages.where("chatId").equals(chatId).count();

/** Pick the most recent chat, or create one. Used when the copilot opens. */
export async function mostRecentOrNewChat(): Promise<Chat> {
  const recent = await db.chats.orderBy("updatedAt").reverse().first();
  return recent ?? (await createChat());
}
