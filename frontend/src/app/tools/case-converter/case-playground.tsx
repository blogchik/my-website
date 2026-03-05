"use client";

import { useCallback, useMemo, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

function toCamelCase(s: string): string { const words = extractWords(s); return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""); }
function toPascalCase(s: string): string { return extractWords(s).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(""); }
function toSnakeCase(s: string): string { return extractWords(s).map((w) => w.toLowerCase()).join("_"); }
function toKebabCase(s: string): string { return extractWords(s).map((w) => w.toLowerCase()).join("-"); }
function toUpperSnake(s: string): string { return extractWords(s).map((w) => w.toUpperCase()).join("_"); }
function toTitleCase(s: string): string { return extractWords(s).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "); }
function toSentenceCase(s: string): string { const words = extractWords(s); return words.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(" "); }
function toDotCase(s: string): string { return extractWords(s).map((w) => w.toLowerCase()).join("."); }
function toPathCase(s: string): string { return extractWords(s).map((w) => w.toLowerCase()).join("/"); }

function extractWords(s: string): string[] {
  return s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_\-./\\]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

const cases = [
  { label: "camelCase", fn: toCamelCase },
  { label: "PascalCase", fn: toPascalCase },
  { label: "snake_case", fn: toSnakeCase },
  { label: "kebab-case", fn: toKebabCase },
  { label: "UPPER_SNAKE", fn: toUpperSnake },
  { label: "Title Case", fn: toTitleCase },
  { label: "Sentence case", fn: toSentenceCase },
  { label: "dot.case", fn: toDotCase },
  { label: "path/case", fn: toPathCase },
] as const;

export default function CasePlayground() {
  const [input, setInput] = useState("");
  const results = useMemo(() => {
    if (!input.trim()) return [];
    return cases.map((c) => ({ label: c.label, value: c.fn(input) }));
  }, [input]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = useCallback(async (text: string, idx: number) => {
    await copyToClipboard(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-navy/40">Type or paste text below — all case formats update live</span>
        <button onClick={() => setInput("")} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 mb-6">
        <label className="font-bold text-sm text-navy/70 uppercase tracking-wider mb-2 block">Input Text</label>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="hello world, myVariableName, some-slug…" className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors" />
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((r, i) => (
            <div key={r.label} className="border border-navy/10 rounded-xl p-4 bg-white/40 hover:border-orange/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-navy/40 uppercase tracking-wider font-bold">{r.label}</span>
                <button onClick={() => handleCopy(r.value, i)} className="text-[10px] text-navy/20 group-hover:text-orange transition-colors cursor-pointer">{copiedIdx === i ? "✓" : "Copy"}</button>
              </div>
              <div className="font-mono text-sm text-navy break-all">{r.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
