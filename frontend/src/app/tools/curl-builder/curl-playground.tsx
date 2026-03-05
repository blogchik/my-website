"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface Header { key: string; value: string; enabled: boolean }

function buildCurl(method: string, url: string, headers: Header[], body: string, auth: { type: string; token: string; user: string; pass: string }, followRedirects: boolean, insecure: boolean): string {
  const parts = ["curl"];
  if (method !== "GET") parts.push(`-X ${method}`);
  if (followRedirects) parts.push("-L");
  if (insecure) parts.push("-k");
  parts.push(`'${url}'`);
  for (const h of headers) {
    if (h.enabled && h.key.trim()) parts.push(`-H '${h.key}: ${h.value}'`);
  }
  if (auth.type === "bearer" && auth.token) parts.push(`-H 'Authorization: Bearer ${auth.token}'`);
  if (auth.type === "basic" && auth.user) parts.push(`-u '${auth.user}:${auth.pass}'`);
  if (body.trim() && ["POST", "PUT", "PATCH"].includes(method)) {
    parts.push(`-d '${body.replace(/'/g, "'\\''")}'`);
  }
  return parts.join(" \\\n  ");
}

export default function CurlPlayground() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/data");
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json", enabled: true }]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState({ type: "none", token: "", user: "", pass: "" });
  const [followRedirects, setFollowRedirects] = useState(true);
  const [insecure, setInsecure] = useState(false);
  const [copied, setCopied] = useState(false);

  const curlCmd = buildCurl(method, url, headers, body, auth, followRedirects, insecure);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [curlCmd]);

  const addHeader = () => setHeaders([...headers, { key: "", value: "", enabled: true }]);
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));
  const updateHeader = (i: number, field: keyof Header, value: string | boolean) => { const next = [...headers]; (next[i] as unknown as Record<string, unknown>)[field] = value; setHeaders(next); };

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Build a curl command visually</span>
        <button onClick={() => { setMethod("GET"); setUrl("https://api.example.com/data"); setHeaders([{ key: "Content-Type", value: "application/json", enabled: true }]); setBody(""); setAuth({ type: "none", token: "", user: "", pass: "" }); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Reset</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder */}
        <div className="space-y-4">
          {/* Method + URL */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Request</label>
            <div className="flex gap-2">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2 text-xs font-mono text-navy focus:outline-none cursor-pointer" suppressHydrationWarning>
                {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => <option key={m}>{m}</option>)}
              </select>
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm font-mono text-navy focus:outline-none focus:border-orange/50" />
            </div>
          </div>

          {/* Headers */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Headers</label>
              <button onClick={addHeader} className="text-xs text-orange hover:text-orange/70 cursor-pointer">+ Add</button>
            </div>
            {headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={h.enabled} onChange={(e) => updateHeader(i, "enabled", e.target.checked)} className="accent-orange" />
                <input type="text" value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} placeholder="Key" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
                <input type="text" value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} placeholder="Value" className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
                <button onClick={() => removeHeader(i)} className="text-xs text-navy/20 hover:text-red-400 cursor-pointer">×</button>
              </div>
            ))}
          </div>

          {/* Auth */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Auth</label>
            <select value={auth.type} onChange={(e) => setAuth({ ...auth, type: e.target.value })} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none cursor-pointer" suppressHydrationWarning>
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
            </select>
            {auth.type === "bearer" && <input type="text" value={auth.token} onChange={(e) => setAuth({ ...auth, token: e.target.value })} placeholder="Token" className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />}
            {auth.type === "basic" && (
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={auth.user} onChange={(e) => setAuth({ ...auth, user: e.target.value })} placeholder="Username" className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
                <input type="password" value={auth.pass} onChange={(e) => setAuth({ ...auth, pass: e.target.value })} placeholder="Password" className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              </div>
            )}
          </div>

          {/* Body */}
          {["POST", "PUT", "PATCH"].includes(method) && (
            <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
              <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"key": "value"}' rows={5} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 resize-none" spellCheck={false} suppressHydrationWarning />
            </div>
          )}

          {/* Options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-xs text-navy/50 cursor-pointer">
              <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} className="accent-orange" /> Follow redirects
            </label>
            <label className="flex items-center gap-1.5 text-xs text-navy/50 cursor-pointer">
              <input type="checkbox" checked={insecure} onChange={(e) => setInsecure(e.target.checked)} className="accent-orange" /> Insecure (-k)
            </label>
          </div>
        </div>

        {/* Output */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3 lg:sticky lg:top-28 self-start">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">curl command</span>
            <button onClick={handleCopy} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <pre className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-3 text-sm text-navy font-mono whitespace-pre-wrap break-all overflow-auto max-h-[32rem]">{curlCmd}</pre>
        </div>
      </div>
    </div>
  );
}
