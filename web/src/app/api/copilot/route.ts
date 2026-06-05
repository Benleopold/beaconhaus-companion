import { GoogleGenAI } from "@google/genai";
import type { CopilotRequest, WireMessage } from "@/lib/copilot/types";
import { MODELS, NO_KEY_MESSAGE, REPORT_INSTRUCTION, buildSystemPrompt, routeModel } from "./prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

function toContents(messages: WireMessage[]) {
  return messages.map((m) => {
    const parts: Part[] = [];
    if (m.content) parts.push({ text: m.content });
    for (const a of m.attachments ?? []) {
      if (a.kind === "text") parts.push({ text: `\n\n[Attached file: ${a.name}]\n${a.data}` });
      else parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } });
    }
    if (parts.length === 0) parts.push({ text: "" });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });
}

const uniq = (xs: string[]) => Array.from(new Set(xs));

export async function POST(req: Request) {
  let body: CopilotRequest;
  try {
    body = (await req.json()) as CopilotRequest;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    if (body.mode === "report") return Response.json({ error: "no-key" }, { status: 503 });
    return new Response(NO_KEY_MESSAGE, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-model": "none" },
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const system = buildSystemPrompt(body);
  const contents = toContents(body.messages);

  try {
    // Report: non-streaming JSON. Prefer Pro, fall back to Flash if Pro is unavailable.
    if (body.mode === "report") {
      let lastErr: unknown;
      for (const model of uniq([MODELS.pro, MODELS.flash])) {
        try {
          const resp = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction: `${system}\n\n${REPORT_INSTRUCTION}`,
              responseMimeType: "application/json",
              temperature: 0.4,
            },
          });
          return new Response(resp.text ?? "{}", {
            headers: { "content-type": "application/json", "x-model": model },
          });
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr ?? new Error("No model available");
    }

    // Chat: try the routed model, falling back to cheaper tiers on quota/availability
    // errors. We pull the first chunk before committing so a 429 can fall through.
    const candidates = uniq([routeModel(body), MODELS.flash, MODELS.lite]);
    let chosen: string | null = null;
    let firstText = "";
    let iterator: AsyncIterator<{ text?: string | undefined }> | null = null;
    let lastErr: unknown;

    for (const model of candidates) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: { systemInstruction: system, temperature: 0.6 },
        });
        const it = stream[Symbol.asyncIterator]();
        const first = await it.next();
        chosen = model;
        firstText = first.done ? "" : first.value.text ?? "";
        iterator = first.done ? null : it;
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!chosen) throw lastErr ?? new Error("No model available");

    const encoder = new TextEncoder();
    const rs = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (firstText) controller.enqueue(encoder.encode(firstText));
          if (iterator) {
            for (;;) {
              const r = await iterator.next();
              if (r.done) break;
              const t = r.value?.text;
              if (t) controller.enqueue(encoder.encode(t));
            }
          }
        } catch {
          controller.enqueue(encoder.encode("\n\n(Something interrupted the reply. Please try again.)"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(rs, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-model": chosen, "cache-control": "no-store" },
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "unknown error";
    return new Response(`The copilot could not reach Gemini. ${raw.slice(0, 280)}`, {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
