"use client";
import type { Attachment } from "./types";

const rid = () => `att_${crypto.randomUUID()}`;
export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15 MB

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Turn a picked file into a model-ready attachment.
 * - images + PDFs: sent as inline data (Gemini reads them natively)
 * - Word (.docx): text extracted via mammoth
 * - spreadsheets (.xlsx/.xls): each sheet flattened to CSV via SheetJS
 * - csv/txt/md/json/etc: read as text
 * (Google Docs/Sheets live in Drive and arrive once Drive is connected.)
 */
export async function fileToAttachment(file: File): Promise<Attachment> {
  const name = file.name;
  const lower = name.toLowerCase();
  const mime = file.type || "application/octet-stream";
  const base = { id: rid(), name, mimeType: mime, size: file.size };

  if (mime.startsWith("image/")) {
    return { ...base, kind: "image", data: await fileToBase64(file) };
  }
  if (mime === "application/pdf" || lower.endsWith(".pdf")) {
    return { ...base, kind: "pdf", mimeType: "application/pdf", data: await fileToBase64(file) };
  }
  if (mime.includes("word") || lower.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { ...base, kind: "text", mimeType: "text/plain", data: value };
  }
  if (mime.includes("sheet") || /\.(xlsx|xls)$/i.test(lower)) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: "array" });
    const parts = wb.SheetNames.map((n) => `# ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`);
    return { ...base, kind: "text", mimeType: "text/plain", data: parts.join("\n\n") };
  }
  return { ...base, kind: "text", mimeType: "text/plain", data: await file.text() };
}
