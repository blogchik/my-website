"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- types ---------- */
type Mode = "encode" | "decode";

/* ---------- helpers ---------- */
function encodeBase64(text: string): string {
  try {
    // Handle Unicode correctly
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch {
    throw new Error("Failed to encode text");
  }
}

function decodeBase64(b64: string): string {
  try {
    const binary = atob(b64.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Invalid Base64 string");
  }
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

/* ---------- component ---------- */
export default function Base64Playground() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-convert on input/mode change (debounced 150ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      try {
        const result = mode === "encode" ? encodeBase64(input) : decodeBase64(input);
        setOutput(result);
        setError(null);
      } catch (err) {
        setOutput("");
        setError(err instanceof Error ? err.message : "Conversion failed");
      }
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, mode]);

  const handleSwitch = useCallback(() => {
    // Swap mode and move output → input
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
    setError(null);
  }, [output]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const inputLabel  = mode === "encode" ? "Plain Text" : "Base64 String";
  const outputLabel = mode === "encode" ? "Base64 Output" : "Decoded Text";

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* Mode toggle + Switch button */}
      <div className="flex items-center gap-3 mb-5">
        {/* Encode / Decode toggle */}
        <div className="flex rounded-xl border border-navy/10 overflow-hidden">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setInput(""); setOutput(""); setError(null); }}
              className={`px-5 py-2 text-xs font-medium transition-all duration-200 cursor-pointer capitalize ${
                mode === m
                  ? "bg-navy text-white"
                  : "text-navy/40 hover:text-navy/70"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Switch arrow button */}
        <button
          onClick={handleSwitch}
          disabled={!output}
          title="Use output as input and switch mode"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-navy/10 text-xs
            text-navy/40 hover:border-orange/40 hover:text-orange transition-all duration-200
            cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
          Switch
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          disabled={!input}
          className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40
            hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200
            cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {/* Input / Output panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              {inputLabel}
            </h3>
            <span className="text-[10px] text-navy/30 tabular-nums">
              {new TextEncoder().encode(input).length} bytes
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Type or paste plain text here…"
                : "Paste Base64 string here…"
            }
            rows={12}
            suppressHydrationWarning
            spellCheck={false}
            className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono
              focus:outline-none focus:border-orange/50 transition-colors resize-y placeholder:text-navy/20"
          />
        </div>

        {/* Output */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              {outputLabel}
            </h3>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed ${
                  copied
                    ? "bg-green-50 border-green-400/50 text-green-700"
                    : "border-navy/10 text-navy/50 hover:border-orange/40 hover:text-orange"
                }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-300/60 bg-red-50/60 p-3">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-0.5">
                Error
              </p>
              <p className="text-xs text-red-500 font-mono break-all">{error}</p>
            </div>
          )}

          {/* Output area */}
          <div className="flex-1 min-h-[280px]">
            {output ? (
              <pre
                className="w-full h-full min-h-[280px] overflow-auto bg-navy/[0.03] border border-navy/10
                  rounded-lg px-4 py-3 text-sm font-mono text-navy break-all whitespace-pre-wrap"
              >
                {output}
              </pre>
            ) : (
              <div className="w-full min-h-[280px] bg-navy/[0.03] border border-navy/10 rounded-lg
                flex items-center justify-center">
                <p className="text-xs text-navy/25 font-mono">
                  {input.trim() ? "Converting…" : "Output will appear here"}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          {output && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Input", value: `${new TextEncoder().encode(input).length} bytes` },
                { label: "Output", value: `${new TextEncoder().encode(output).length} bytes` },
                {
                  label: "Ratio",
                  value: input
                    ? `${((new TextEncoder().encode(output).length / new TextEncoder().encode(input).length) * 100).toFixed(0)}%`
                    : "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center"
                >
                  <p className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-navy font-mono">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
