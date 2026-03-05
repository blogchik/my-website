"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

function formatXml(xml: string, indent: number): string {
  let formatted = "";
  let pad = 0;
  const lines = xml.replace(/(>)\s*(<)/g, "$1\n$2").split("\n");
  const indentStr = " ".repeat(indent);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("</")) pad--;
    formatted += indentStr.repeat(Math.max(0, pad)) + line + "\n";
    if (line.match(/^<[^/?!][^>]*[^/]>$/) && !line.startsWith("<!")) pad++;
    if (line.match(/^<[^/?!][^>]*[^/]>.*<\/[^>]+>$/)) pad--;
  }
  return formatted.trimEnd();
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
}

function validateXml(xml: string): string | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return err.textContent || "Invalid XML";
    return null;
  } catch {
    return "Failed to parse XML";
  }
}

function highlightXml(xml: string): string {
  return xml
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(&lt;\/?)([\w:.-]+)/g, '$1<span style="color:#E28413">$2</span>')
    .replace(/([\w:.-]+)(=)(&quot;|")/g, '<span style="color:#6B7280">$1</span>$2$3')
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#9CA3AF">$1</span>')
    .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span style="color:#9CA3AF">$1</span>');
}

export default function XmlPlayground() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  const handleFormat = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    const err = validateXml(input);
    if (err) { setError(err); setOutput(""); return; }
    setOutput(formatXml(input, indent));
    setError(null);
  }, [input, indent]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(null); return; }
    const err = validateXml(input);
    if (err) { setError(err); setOutput(""); return; }
    setOutput(minifyXml(input));
    setError(null);
  }, [input]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) { setError(null); return; }
    const err = validateXml(input);
    setError(err);
    if (!err) setOutput(input);
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={handleFormat} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Format</button>
        <button onClick={handleMinify} className="px-4 py-1.5 rounded-xl border border-navy/10 text-xs text-navy/60 hover:border-orange/40 hover:text-orange transition-colors cursor-pointer">Minify</button>
        <button onClick={handleValidate} className="px-4 py-1.5 rounded-xl border border-navy/10 text-xs text-navy/60 hover:border-orange/40 hover:text-orange transition-colors cursor-pointer">Validate</button>
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={1}>1 space</option>
        </select>
        <button onClick={() => { setInput(""); setOutput(""); setError(null); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 text-xs text-red-600">{error}</div>}
      {!error && output && <div className="mb-4 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2.5 text-xs text-green-600">✓ Valid XML</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Input XML</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={'<?xml version="1.0"?>\n<root><item id="1">Hello</item></root>'} rows={14} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>

        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Output</span>
            <button onClick={handleCopy} disabled={!output} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer disabled:opacity-30">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          {output ? (
            <pre className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono overflow-auto max-h-[24rem]" dangerouslySetInnerHTML={{ __html: highlightXml(output) }} />
          ) : (
            <div className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy/30 font-mono min-h-[24rem] flex items-center justify-center">Output will appear here…</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-navy/40">
        <span>Lines: {(output || input).split("\n").length}</span>
        <span>Characters: {(output || input).length.toLocaleString()}</span>
      </div>
    </div>
  );
}
