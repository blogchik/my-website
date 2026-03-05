"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "encode" | "decode";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

export default function UrlEncodPlayground() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) { setOutput(""); setError(null); return; }
    debounceRef.current = setTimeout(() => {
      try {
        const result = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
        setOutput(result); setError(null);
      } catch (e) {
        setOutput(""); setError(e instanceof Error ? e.message : "Conversion failed");
      }
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, mode]);

  const handleSwitch = useCallback(() => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
  }, [output]);

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
          <button onClick={() => setMode("encode")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "encode" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Encode</button>
          <button onClick={() => setMode("decode")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "decode" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Decode</button>
        </div>
        <button onClick={handleSwitch} disabled={!output} className="px-3 py-1.5 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-orange/40 hover:text-orange transition-all duration-200 cursor-pointer disabled:opacity-30">⇄ Switch</button>
        {input && (
          <button onClick={() => { setInput(""); setOutput(""); setError(null); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">{mode === "encode" ? "Plain Text" : "Encoded URL"}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === "encode" ? "hello world & foo=bar" : "hello%20world%20%26%20foo%3Dbar"} rows={8} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>

        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">{mode === "encode" ? "Encoded" : "Decoded"}</span>
            <button onClick={handleCopy} disabled={!output} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer disabled:opacity-30">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 text-xs text-red-600">{error}</div>
          ) : (
            <textarea readOnly value={output} rows={8} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none resize-none" />
          )}
        </div>
      </div>

      {output && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Input Length</div>
            <div className="text-sm font-mono text-navy/70">{input.length}</div>
          </div>
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Output Length</div>
            <div className="text-sm font-mono text-navy/70">{output.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
