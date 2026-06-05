// Copilot domain types.
export type Role = "user" | "assistant";

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  /** How this file is handed to the model. image/pdf go as inline data; everything
   *  else is extracted to text (docx via mammoth, xlsx via SheetJS, csv/txt as-is). */
  kind: "image" | "pdf" | "text";
  /** base64 (image/pdf) or extracted text (text). */
  data: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  model?: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageContext {
  path: string;
  title: string;
  summary: string;
}

export interface DataSnapshot {
  profile: Record<string, unknown> | null;
  people: Record<string, unknown>[];
  facilities: Record<string, unknown>[];
  captures: Record<string, unknown>[];
  counts: { people: number; facilities: number; captures: number };
  generatedAt: string;
}

export type CopilotMode = "chat" | "report";
export type ReportFormat = "pdf" | "docx" | "csv";

export interface WireMessage {
  role: Role;
  content: string;
  attachments?: Attachment[];
}

export interface CopilotRequest {
  messages: WireMessage[];
  page: PageContext;
  data: DataSnapshot;
  mode: CopilotMode;
  reportFormat?: ReportFormat;
}

/** Structured report the model returns in report mode; the client renders it to PDF/Word/CSV. */
export interface ReportContent {
  title: string;
  subtitle?: string;
  sections: { heading?: string; body: string }[];
  table?: { columns: string[]; rows: string[][] };
}
