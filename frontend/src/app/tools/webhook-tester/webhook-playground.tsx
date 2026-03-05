"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface WebhookEntry {
  id: number;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
}

const SAMPLE_PAYLOADS: { label: string; body: string; contentType: string }[] = [
  {
    label: "GitHub Push",
    contentType: "application/json",
    body: JSON.stringify({
      ref: "refs/heads/main",
      repository: { full_name: "user/repo", html_url: "https://github.com/user/repo" },
      pusher: { name: "octocat", email: "octocat@github.com" },
      commits: [{ id: "abc123", message: "Fix bug in auth module", timestamp: new Date().toISOString() }],
    }, null, 2),
  },
  {
    label: "Stripe Payment",
    contentType: "application/json",
    body: JSON.stringify({
      id: "evt_1234567890",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_123", amount: 2000, currency: "usd", status: "succeeded", receipt_email: "customer@example.com" } },
      created: Math.floor(Date.now() / 1000),
    }, null, 2),
  },
  {
    label: "Slack Event",
    contentType: "application/json",
    body: JSON.stringify({
      token: "verification_token",
      team_id: "T0001",
      event: { type: "message", channel: "C2147483705", user: "U2147483697", text: "Hello, World!", ts: "1355517523.000005" },
      type: "event_callback",
    }, null, 2),
  },
  {
    label: "Form Data",
    contentType: "application/x-www-form-urlencoded",
    body: "name=John+Doe&email=john%40example.com&message=Hello+from+the+contact+form&timestamp=" + Date.now(),
  },
];

export default function WebhookPlayground() {
  const [entries, setEntries] = useState<WebhookEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WebhookEntry | null>(null);
  const [customBody, setCustomBody] = useState("");
  const [customContentType, setCustomContentType] = useState("application/json");
  const [copied, setCopied] = useState<string | null>(null);
  let nextId = entries.length;

  const addEntry = useCallback((body: string, contentType: string) => {
    const entry: WebhookEntry = {
      id: ++nextId,
      timestamp: new Date().toISOString(),
      method: "POST",
      headers: { "Content-Type": contentType, "User-Agent": "WebhookTester/1.0", "X-Request-Id": crypto.randomUUID?.() || Math.random().toString(36).slice(2) },
      body,
      contentType,
    };
    setEntries((prev) => [entry, ...prev]);
    setSelectedEntry(entry);
  }, []);

  const formatBody = (body: string, contentType: string): string => {
    if (contentType.includes("json")) {
      try { return JSON.stringify(JSON.parse(body), null, 2); } catch { return body; }
    }
    return body;
  };

  const handleCopy = useCallback(async (text: string, field: string) => {
    await copyToClipboard(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Inspect webhook payloads — use sample templates or paste your own</span>
        <button onClick={() => { setEntries([]); setSelectedEntry(null); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear all</button>
      </div>

      {/* Presets */}
      <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 mb-6 space-y-3">
        <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Sample Payloads</label>
        <div className="flex gap-2 flex-wrap">
          {SAMPLE_PAYLOADS.map((p) => (
            <button key={p.label} onClick={() => addEntry(p.body, p.contentType)} className="px-3 py-1.5 rounded-xl border border-navy/10 text-xs text-navy/60 hover:border-orange/40 hover:text-orange transition-colors cursor-pointer">{p.label}</button>
          ))}
        </div>
        <div className="space-y-2 pt-2 border-t border-navy/10">
          <label className="text-xs text-navy/40">Custom payload</label>
          <div className="flex gap-2 items-end">
            <select value={customContentType} onChange={(e) => setCustomContentType(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
              <option value="application/json">JSON</option>
              <option value="application/x-www-form-urlencoded">Form</option>
              <option value="text/plain">Text</option>
              <option value="application/xml">XML</option>
            </select>
            <textarea value={customBody} onChange={(e) => setCustomBody(e.target.value)} placeholder='{"key": "value"}' rows={2} className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50 resize-none" spellCheck={false} suppressHydrationWarning />
            <button onClick={() => { if (customBody.trim()) { addEntry(customBody, customContentType); setCustomBody(""); } }} className="px-4 py-2 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer shrink-0">Send</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry list */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Requests ({entries.length})</label>
          {entries.length > 0 ? (
            <div className="space-y-1.5 max-h-[24rem] overflow-auto">
              {entries.map((e) => (
                <button key={e.id} onClick={() => setSelectedEntry(e)} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${selectedEntry?.id === e.id ? "bg-orange/10 border-orange/30 border" : "bg-navy/[0.02] hover:bg-navy/[0.04] border border-transparent"}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-green-600">{e.method}</span>
                    <span className="text-navy/40 truncate">{e.contentType}</span>
                  </div>
                  <div className="text-[10px] text-navy/30 mt-0.5">{new Date(e.timestamp).toLocaleTimeString()}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-navy/30 min-h-[8rem] flex items-center justify-center">No requests yet</div>
          )}
        </div>

        {/* Entry detail */}
        <div className="lg:col-span-2 border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-4">
          {selectedEntry ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Request Detail</span>
                <button onClick={() => handleCopy(formatBody(selectedEntry.body, selectedEntry.contentType), "body")} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied === "body" ? "✓ Copied" : "Copy body"}</button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-navy/40 uppercase block mb-1">Headers</span>
                  <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy space-y-0.5">
                    {Object.entries(selectedEntry.headers).map(([k, v]) => (
                      <div key={k}><span className="text-orange">{k}</span>: {v}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-navy/40 uppercase block mb-1">Body</span>
                  <pre className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-xs font-mono text-navy whitespace-pre-wrap break-all overflow-auto max-h-[20rem]">{formatBody(selectedEntry.body, selectedEntry.contentType)}</pre>
                </div>
                <div className="flex gap-4 text-[10px] text-navy/30">
                  <span>Received: {new Date(selectedEntry.timestamp).toLocaleString()}</span>
                  <span>Size: {new Blob([selectedEntry.body]).size} bytes</span>
                </div>
              </div>
            </>
          ) : (
            <div className="min-h-[16rem] flex items-center justify-center text-sm text-navy/30">Select a request to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
