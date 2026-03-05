"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

function jsonToCsv(jsonStr: string, delimiter: string): string {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data) || data.length === 0) throw new Error("Input must be a non-empty JSON array of objects");
  const headers = [...new Set(data.flatMap((row: Record<string, unknown>) => Object.keys(row)))];
  const escapeField = (val: unknown): string => {
    const s = val === null || val === undefined ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
    if (s.includes(delimiter) || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = data.map((row: Record<string, unknown>) => headers.map((h) => escapeField(row[h])).join(delimiter));
  return [headers.map((h) => escapeField(h)).join(delimiter), ...rows].join("\n");
}

function csvToJson(csv: string, delimiter: string): string {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === delimiter) { fields.push(current); current = ""; }
        else current += ch;
      }
    }
    fields.push(current);
    return fields;
  };
  const headers = parseRow(lines[0]);
  const data = lines.slice(1).filter((l) => l.trim()).map((line) => {
    const vals = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return JSON.stringify(data, null, 2);
}

export default function JsonCsvPlayground() {
  const [mode, setMode] = useState<"jsonToCsv" | "csvToJson">("jsonToCsv");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState(",");
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    try {
      const result = mode === "jsonToCsv" ? jsonToCsv(input, delimiter) : csvToJson(input, delimiter);
      setOutput(result);
      setError(null);
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Conversion failed");
    }
  }, [input, mode, delimiter]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
          <button onClick={() => { setMode("jsonToCsv"); setOutput(""); setError(null); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "jsonToCsv" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>JSON → CSV</button>
          <button onClick={() => { setMode("csvToJson"); setOutput(""); setError(null); }} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "csvToJson" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>CSV → JSON</button>
        </div>
        <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          <option value=",">, (comma)</option>
          <option value=";">; (semicolon)</option>
          <option value={"\t"}>Tab</option>
          <option value="|">| (pipe)</option>
        </select>
        <button onClick={convert} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Convert</button>
        <button onClick={() => { setInput(""); setOutput(""); setError(null); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">{mode === "jsonToCsv" ? "JSON" : "CSV"}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "jsonToCsv" ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]' : "name,age\nAlice,30\nBob,25"} rows={12} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>

        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">{mode === "jsonToCsv" ? "CSV" : "JSON"}</span>
            <button onClick={handleCopy} disabled={!output} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer disabled:opacity-30">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 text-xs text-red-600">{error}</div>
          ) : (
            <textarea readOnly value={output} rows={12} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none resize-none" />
          )}
        </div>
      </div>
    </div>
  );
}
