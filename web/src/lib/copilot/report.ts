"use client";
import type { ReportContent, ReportFormat } from "./types";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "report";

export async function generateReport(content: ReportContent, format: ReportFormat): Promise<void> {
  if (format === "csv") return downloadCsv(content);
  if (format === "docx") return downloadDocx(content);
  return downloadPdf(content);
}

function downloadCsv(content: ReportContent) {
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows: string[] = [];
  if (content.table) {
    rows.push(content.table.columns.map(esc).join(","));
    for (const r of content.table.rows) rows.push(r.map(esc).join(","));
  } else {
    rows.push([esc("Section"), esc("Content")].join(","));
    for (const s of content.sections) rows.push([esc(s.heading ?? ""), esc(s.body)].join(","));
  }
  download(new Blob([rows.join("\r\n")], { type: "text/csv;charset=utf-8" }), `${slug(content.title)}.csv`);
}

async function downloadPdf(content: ReportContent) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const width = pageW - margin * 2;
  let y = margin;
  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const lines = (text: string, size: number, lh: number, bold = false, color = 0) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    for (const line of doc.splitTextToSize(text, width)) {
      ensure(lh);
      doc.text(line, margin, y);
      y += lh;
    }
  };

  lines(content.title, 20, 26, true);
  if (content.subtitle) lines(content.subtitle, 11, 16, false, 120);
  y += 12;
  for (const s of content.sections) {
    if (s.heading) {
      y += 4;
      lines(s.heading, 13, 20, true);
    }
    lines(s.body, 11, 16);
    y += 8;
  }
  if (content.table) {
    y += 6;
    lines(content.table.columns.join("   |   "), 11, 16, true);
    for (const r of content.table.rows) lines(r.join("   |   "), 11, 15);
  }
  doc.save(`${slug(content.title)}.pdf`);
}

async function downloadDocx(content: ReportContent) {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType } = docx;
  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    new Paragraph({ text: content.title, heading: HeadingLevel.TITLE }),
  ];
  if (content.subtitle)
    children.push(new Paragraph({ children: [new TextRun({ text: content.subtitle, italics: true, color: "777777" })] }));
  for (const s of content.sections) {
    if (s.heading) children.push(new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_2 }));
    for (const para of s.body.split(/\n{2,}/)) children.push(new Paragraph({ children: [new TextRun(para)] }));
  }
  if (content.table) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: content.table.columns.map(
              (c) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c, bold: true })] })] }),
            ),
          }),
          ...content.table.rows.map(
            (r) => new TableRow({ children: r.map((c) => new TableCell({ children: [new Paragraph(c)] })) }),
          ),
        ],
      }),
    );
  }
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  download(blob, `${slug(content.title)}.docx`);
}
