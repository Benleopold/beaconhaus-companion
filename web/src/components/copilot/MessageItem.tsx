"use client";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Square, Volume2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTTS } from "@/lib/copilot/tts";
import type { ChatMessage } from "@/lib/copilot/types";

const MD =
  "text-[14.5px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_h1]:font-display [&_h1]:text-lg [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-base [&_h3]:mt-2 [&_h3]:font-semibold [&_strong]:font-semibold [&_a]:text-beacon-deep [&_a]:underline [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_table]:my-2 [&_table]:w-full [&_th]:border-b [&_th]:border-line [&_th]:py-1 [&_th]:text-left [&_td]:py-1 [&_td]:align-top [&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-ink-soft";

export function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const { playingId, toggle, supported } = useTTS();
  const [copied, setCopied] = useState(false);
  const playing = playingId === message.id;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "relative max-w-[88%] rounded-2xl px-3.5 pb-7 pt-2.5",
          isUser ? "bg-warm-soft text-ink" : "border border-line bg-surface text-ink",
        )}
      >
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {message.attachments.map((a) => (
              <span key={a.id} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-ink-soft">
                {a.name}
              </span>
            ))}
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">{message.content}</p>
        ) : (
          <div className={MD}>
            <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
          </div>
        )}

        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5">
          <button
            onClick={copy}
            aria-label="Copy message"
            className="focus-ring grid h-6 w-6 place-items-center rounded-md text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink-soft"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-sage" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {supported && (
            <button
              onClick={() => toggle(message.id, message.content)}
              aria-label={playing ? "Stop reading" : "Read aloud"}
              className="focus-ring grid h-6 w-6 place-items-center rounded-md text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink-soft"
            >
              {playing ? <Square className="h-3.5 w-3.5 text-beacon-deep" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[88%] rounded-2xl border border-line bg-surface px-3.5 py-2.5 text-[14.5px] leading-relaxed text-ink">
        {text ? (
          <span className="whitespace-pre-wrap">{text}</span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
          </span>
        )}
      </div>
    </div>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" style={{ animationDelay: delay }} />;
}
