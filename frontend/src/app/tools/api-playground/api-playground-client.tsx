"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface Header { key: string; value: string }
interface Response { status: number; statusText: string; headers: Record<string, string>; body: string; time: number; size: number }

export default function ApiPlayground() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [headers, setHeaders] = useState<Header[]>([{ key: "Accept", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"body" | "headers">("body");
  const [copied, setCopied] = useState(false);

  const send = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true); setError(null); setResponse(null);
    const start = performance.now();
    try {
      const reqHeaders: Record<string, string> = {};
      for (const h of headers) { if (h.key.trim()) reqHeaders[h.key] = h.value; }
      const opts: RequestInit = { method, headers: reqHeaders };
      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) opts.body = body;
      const res = await fetch(url, opts);
      const time = Math.round(performance.now() - start);
      const text = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      setResponse({ status: res.status, statusText: res.statusText, headers: resHeaders, body: text, time, size: new Blob([text]).size });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
    setLoading(false);
  }, [method, url, headers, body]);

  const formatBody = (text: string): string => {
    try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
  };

  const handleCopy = useCallback(async () => {
    if (!response) return;
    await copyToClipboard(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [response]);

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));

  const statusColor = (s: number) => s < 300 ? "text-green-600 bg-green-50 border-green-200" : s < 400 ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-red-600 bg-red-50 border-red-200";
  const fmtSize = (b: number) => b < 1024 ? b + " B" : (b / 1024).toFixed(1) + " KB";

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Send HTTP requests directly from the browser</span>
        <button onClick={() => { setResponse(null); setError(null); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      {/* Request */}
      <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 mb-6 space-y-4">
        <div className="flex gap-2">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2.5 text-xs font-mono font-bold text-navy focus:outline-none cursor-pointer" suppressHydrationWarning>
            {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => <option key={m}>{m}</option>)}
          </select>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm font-mono text-navy focus:outline-none focus:border-orange/50" />
          <button onClick={send} disabled={loading} className="px-5 py-2.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer disabled:opacity-50">{loading ? "Sending…" : "Send"}</button>
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-navy/50 font-medium">Headers</span>
            <button onClick={addHeader} className="text-xs text-orange hover:text-orange/70 cursor-pointer">+ Add</button>
          </div>
          {headers.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={h.key} onChange={(e) => { const next = [...headers]; next[i] = { ...h, key: e.target.value }; setHeaders(next); }} placeholder="Key" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              <input type="text" value={h.value} onChange={(e) => { const next = [...headers]; next[i] = { ...h, value: e.target.value }; setHeaders(next); }} placeholder="Value" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              <button onClick={() => removeHeader(i)} className="text-xs text-navy/20 hover:text-red-400 cursor-pointer">×</button>
            </div>
          ))}
        </div>

        {/* Body */}
        {["POST", "PUT", "PATCH"].includes(method) && (
          <div>
            <span className="text-xs text-navy/50 font-medium block mb-1.5">Body</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}' rows={4} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm font-mono text-navy focus:outline-none focus:border-orange/50 resize-none" spellCheck={false} suppressHydrationWarning />
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 text-xs text-red-600">{error}</div>}

      {/* Response */}
      {response && (
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded border ${statusColor(response.status)}`}>{response.status} {response.statusText}</span>
            <span className="text-xs text-navy/40">{response.time}ms</span>
            <span className="text-xs text-navy/40">{fmtSize(response.size)}</span>
            <button onClick={handleCopy} className="ml-auto text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy body"}</button>
          </div>

          <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5 w-fit">
            <button onClick={() => setActiveTab("body")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${activeTab === "body" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Body</button>
            <button onClick={() => setActiveTab("headers")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${activeTab === "headers" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Headers ({Object.keys(response.headers).length})</button>
          </div>

          {activeTab === "body" ? (
            <pre className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-xs font-mono text-navy whitespace-pre-wrap break-all overflow-auto max-h-[24rem]">{formatBody(response.body)}</pre>
          ) : (
            <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-xs font-mono text-navy space-y-0.5 overflow-auto max-h-[24rem]">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k}><span className="text-orange">{k}</span>: {v}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50/60 px-3 py-2 text-[10px] text-yellow-700">
        <strong>Note:</strong> Browser-based requests are subject to CORS restrictions. The target server must allow cross-origin requests for this tool to work.
      </div>
    </div>
  );
}
