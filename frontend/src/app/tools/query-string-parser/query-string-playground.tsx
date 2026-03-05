"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

function parseQueryString(qs: string): { key: string; value: string }[] {
  const cleaned = qs.replace(/^[?#]/, "").trim();
  if (!cleaned) return [];
  return cleaned.split("&").map((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return { key: decodeURIComponent(pair), value: "" };
    return {
      key: decodeURIComponent(pair.slice(0, idx)),
      value: decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, " ")),
    };
  });
}

function buildQueryString(params: { key: string; value: string }[]): string {
  return params
    .filter((p) => p.key)
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
}

export default function QueryStringPlayground() {
  const [mode, setMode] = useState<"parse" | "build">("parse");
  const [input, setInput] = useState("");
  const [params, setParams] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [copied, setCopied] = useState(false);

  const parsed = mode === "parse" ? parseQueryString(input) : [];
  const built = mode === "build" ? buildQueryString(params) : "";

  const handleCopy = useCallback(async (text: string) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const addParam = () => setParams([...params, { key: "", value: "" }]);
  const removeParam = (i: number) => setParams(params.filter((_, idx) => idx !== i));
  const updateParam = (i: number, field: "key" | "value", val: string) => {
    const next = [...params];
    next[i] = { ...next[i], [field]: val };
    setParams(next);
  };

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
          <button onClick={() => setMode("parse")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "parse" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Parse</button>
          <button onClick={() => setMode("build")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "build" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Build</button>
        </div>
        <button onClick={() => { setInput(""); setParams([{ key: "", value: "" }]); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* input */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">
            {mode === "parse" ? "Query String" : "Parameters"}
          </label>
          {mode === "parse" ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="?utm_source=google&utm_medium=cpc&q=hello+world"
              rows={6}
              className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none"
              spellCheck={false}
            />
          ) : (
            <div className="space-y-2">
              {params.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={p.key} onChange={(e) => updateParam(i, "key", e.target.value)} placeholder="key" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors" />
                  <input type="text" value={p.value} onChange={(e) => updateParam(i, "value", e.target.value)} placeholder="value" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors" />
                  <button onClick={() => removeParam(i)} className="text-navy/30 hover:text-red-400 transition-colors cursor-pointer px-2">✕</button>
                </div>
              ))}
              <button onClick={addParam} className="text-xs text-orange hover:text-orange/70 transition-colors cursor-pointer">+ Add parameter</button>
            </div>
          )}
        </div>

        {/* output */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              {mode === "parse" ? "Parsed Parameters" : "Query String"}
            </span>
            <button onClick={() => handleCopy(mode === "parse" ? JSON.stringify(Object.fromEntries(parsed.map((p) => [p.key, p.value])), null, 2) : `?${built}`)} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
          </div>

          {mode === "parse" ? (
            parsed.length > 0 ? (
              <div className="border border-navy/8 rounded-xl overflow-hidden text-xs font-mono">
                <div className="grid grid-cols-2 bg-navy/[0.04] px-4 py-2 text-[10px] uppercase tracking-wider text-navy/40 font-sans"><span>Key</span><span>Value</span></div>
                {parsed.map((p, i) => (
                  <div key={i} className={`grid grid-cols-2 px-4 py-2 text-xs border-t border-navy/5 ${i % 2 === 0 ? "bg-white/30" : ""}`}>
                    <span className="text-navy/70 font-medium break-all">{p.key}</span>
                    <span className="text-navy/50 break-all">{p.value || <em className="text-navy/30">(empty)</em>}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-navy/30 italic">Enter a query string to parse.</p>
            )
          ) : (
            <div className="space-y-3">
              <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm font-mono text-navy/70 break-all min-h-[80px]">
                {built ? `?${built}` : <span className="text-navy/30 italic">Add parameters to build a query string.</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {mode === "parse" && parsed.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Parameters</div>
            <div className="text-sm font-mono text-navy/70">{parsed.length}</div>
          </div>
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Unique Keys</div>
            <div className="text-sm font-mono text-navy/70">{new Set(parsed.map((p) => p.key)).size}</div>
          </div>
        </div>
      )}
    </div>
  );
}
