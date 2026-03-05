"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface DiffLine {
  type: "same" | "added" | "removed";
  lineNum: [number | null, number | null];
  text: string;
}

function computeDiff(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const m = aLines.length;
  const n = bLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = aLines[i - 1] === bLines[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const result: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      result.unshift({ type: "same", lineNum: [i, j], text: aLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", lineNum: [null, j], text: bLines[j - 1] });
      j--;
    } else {
      result.unshift({ type: "removed", lineNum: [i, null], text: aLines[i - 1] });
      i--;
    }
  }
  return result;
}

export default function DiffPlayground() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [copied, setCopied] = useState(false);

  const handleDiff = useCallback(() => {
    setDiff(computeDiff(left, right));
  }, [left, right]);

  const diffText = diff.map((d) => {
    const prefix = d.type === "added" ? "+ " : d.type === "removed" ? "- " : "  ";
    return prefix + d.text;
  }).join("\n");

  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;
  const unchanged = diff.filter((d) => d.type === "same").length;

  const handleCopy = useCallback(async () => {
    await copyToClipboard(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [diffText]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={handleDiff} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Compare</button>
        <button onClick={() => { setLeft(right); setRight(left); }} className="px-3 py-1.5 rounded-xl border border-navy/10 text-xs text-navy/60 hover:border-orange/40 hover:text-orange transition-colors cursor-pointer">⇄ Swap</button>
        <button onClick={() => { setLeft(""); setRight(""); setDiff([]); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Original</label>
          <textarea value={left} onChange={(e) => setLeft(e.target.value)} placeholder="Paste original text…" rows={10} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Modified</label>
          <textarea value={right} onChange={(e) => setRight(e.target.value)} placeholder="Paste modified text…" rows={10} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>
      </div>

      {diff.length > 0 && (
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Diff Result</span>
            <button onClick={handleCopy} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div className="font-mono text-sm overflow-auto max-h-[28rem] rounded-lg border border-navy/10">
            {diff.map((d, i) => (
              <div key={i} className={`flex ${d.type === "added" ? "bg-green-50" : d.type === "removed" ? "bg-red-50" : ""}`}>
                <span className="w-10 shrink-0 text-right pr-2 py-0.5 text-[10px] text-navy/25 select-none border-r border-navy/10">{d.lineNum[0] ?? ""}</span>
                <span className="w-10 shrink-0 text-right pr-2 py-0.5 text-[10px] text-navy/25 select-none border-r border-navy/10">{d.lineNum[1] ?? ""}</span>
                <span className={`w-5 shrink-0 text-center py-0.5 text-xs select-none ${d.type === "added" ? "text-green-500" : d.type === "removed" ? "text-red-500" : "text-navy/20"}`}>{d.type === "added" ? "+" : d.type === "removed" ? "−" : " "}</span>
                <span className={`flex-1 px-2 py-0.5 whitespace-pre-wrap break-all ${d.type === "added" ? "text-green-700" : d.type === "removed" ? "text-red-700" : "text-navy"}`}>{d.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-navy/40 mt-2">
            <span className="text-green-600">+{added} added</span>
            <span className="text-red-600">−{removed} removed</span>
            <span>{unchanged} unchanged</span>
          </div>
        </div>
      )}
    </div>
  );
}
