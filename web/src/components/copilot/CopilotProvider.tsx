"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createChat, mostRecentOrNewChat } from "@/lib/copilot/repo";

type View = "hidden" | "popup" | "full";

interface CopilotCtx {
  view: View;
  chatId: string | null;
  open: (v?: Exclude<View, "hidden">) => void;
  close: () => void;
  expand: () => void;
  minimize: () => void;
  selectChat: (id: string) => void;
  startNewChat: () => Promise<void>;
}

const Ctx = createContext<CopilotCtx | null>(null);

export function useCopilot(): CopilotCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCopilot must be used within CopilotProvider");
  return c;
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("hidden");
  const [chatId, setChatId] = useState<string | null>(null);

  // The first time the copilot opens, attach to the most recent chat (or make one).
  useEffect(() => {
    if (view !== "hidden" && !chatId) {
      mostRecentOrNewChat()
        .then((c) => setChatId(c.id))
        .catch(() => {});
    }
  }, [view, chatId]);

  const value: CopilotCtx = {
    view,
    chatId,
    open: (v = "popup") => setView(v),
    close: () => setView("hidden"),
    expand: () => setView("full"),
    minimize: () => setView("popup"),
    selectChat: setChatId,
    startNewChat: async () => {
      const c = await createChat();
      setChatId(c.id);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
