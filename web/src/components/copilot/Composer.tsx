"use client";
import { FileDown, Loader2, Paperclip, SendHorizontal, X } from "lucide-react";
import { useRef, useState } from "react";
import { fileToAttachment, MAX_ATTACHMENT_BYTES } from "@/lib/copilot/attachments";
import { requestReport } from "@/lib/copilot/client";
import { generateReport } from "@/lib/copilot/report";
import type { Attachment, ReportFormat } from "@/lib/copilot/types";
import { cn } from "@/lib/utils";

export function Composer({
  busy,
  chatId,
  path,
  onSend,
}: {
  busy: boolean;
  chatId: string | null;
  path: string;
  onSend: (text: string, attachments: Attachment[] | undefined) => void;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reportMenu, setReportMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (f.size > MAX_ATTACHMENT_BYTES) continue;
      try {
        const a = await fileToAttachment(f);
        setAttachments((prev) => [...prev, a]);
      } catch {
        /* skip unreadable file */
      }
    }
  };

  const submit = () => {
    if (busy || (!text.trim() && attachments.length === 0)) return;
    onSend(text, attachments.length ? attachments : undefined);
    setText("");
    setAttachments([]);
  };

  const runReport = async (fmt: ReportFormat) => {
    setReportMenu(false);
    if (!chatId || reporting) return;
    setReporting(true);
    try {
      const content = await requestReport(chatId, path, fmt);
      await generateReport(content, fmt);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not build the report.");
    } finally {
      setReporting(false);
    }
  };

  const canSend = !busy && (text.trim().length > 0 || attachments.length > 0);

  return (
    <div className="border-t border-line bg-canvas/70 p-2.5">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5 px-1">
          {attachments.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-1 text-xs text-ink-soft">
              {a.name}
              <button aria-label={`Remove ${a.name}`} onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 rounded-2xl border border-line bg-surface p-1.5">
        <button
          aria-label="Attach a file"
          onClick={() => fileRef.current?.click()}
          className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-surface-2"
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/*,.pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json"
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask for your next step..."
          rows={1}
          className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-[14.5px] text-ink outline-none placeholder:text-ink-faint"
        />

        <div className="relative">
          <button
            aria-label="Make a report"
            onClick={() => setReportMenu((o) => !o)}
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-surface-2"
          >
            {reporting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <FileDown className="h-[18px] w-[18px]" />}
          </button>
          {reportMenu && (
            <div className="absolute bottom-11 right-0 z-10 w-36 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-[var(--shadow-lift)]">
              <p className="px-3 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">Report as</p>
              {(["pdf", "docx", "csv"] as ReportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => runReport(f)}
                  className="block w-full px-3 py-1.5 text-left text-sm text-ink-soft hover:bg-surface-2"
                >
                  {f === "pdf" ? "PDF" : f === "docx" ? "Word doc" : "CSV"}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          aria-label="Send"
          onClick={submit}
          disabled={!canSend}
          className={cn("beacon focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-white disabled:opacity-40")}
        >
          {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <SendHorizontal className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </div>
  );
}
