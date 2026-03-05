"use client";

import { useState } from "react";

/* ---------- helpers ---------- */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  try {
    return decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return atob(base64);
  }
}

function decodeJwt(token: string): { header: string; payload: string; signature: string } | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    const payload = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
    return { header, payload, signature: parts[2] };
  } catch {
    return null;
  }
}

function formatTimestamp(ts: number): string {
  try {
    const d = new Date(ts * 1000);
    return d.toISOString().replace("T", " ").replace(".000Z", " UTC");
  } catch {
    return "Invalid date";
  }
}

function getExpInfo(payload: string): { exp: string; iat: string; isExpired: boolean | null } {
  try {
    const obj = JSON.parse(payload);
    const exp = obj.exp ? formatTimestamp(obj.exp) : "—";
    const iat = obj.iat ? formatTimestamp(obj.iat) : "—";
    const isExpired = obj.exp ? Date.now() / 1000 > obj.exp : null;
    return { exp, iat, isExpired };
  } catch {
    return { exp: "—", iat: "—", isExpired: null };
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

/* hl json */
function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*(:)?|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
    (m, str, colon, bool, num) => {
      if (str && colon) return `<span class="text-navy/80 font-semibold">${str}</span>:`;
      if (str) return `<span class="text-green-700">${str}</span>`;
      if (bool) return `<span class="text-purple-600">${bool}</span>`;
      if (num) return `<span class="text-orange">${num}</span>`;
      return m;
    }
  );
}

/* ---------- component ---------- */
export default function JwtPlayground() {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState<"header" | "payload" | null>(null);

  const decoded = token.trim() ? decodeJwt(token) : null;
  const expInfo = decoded ? getExpInfo(decoded.payload) : null;

  const handleCopy = async (text: string, which: "header" | "payload") => {
    await copyToClipboard(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-navy/40 font-medium uppercase tracking-wider">JWT Decoder</span>
        {token && (
          <button
            onClick={() => setToken("")}
            className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* input */}
      <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40 mb-6">
        <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Paste JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="header.payload.signature"
          rows={4}
          className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none"
          spellCheck={false}
          suppressHydrationWarning
        />
      </div>

      {/* error */}
      {token.trim() && !decoded && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-600">
          Invalid JWT — must be three Base64URL-encoded segments separated by dots.
        </div>
      )}

      {/* decoded output */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* header */}
          <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Header</span>
              <button
                onClick={() => handleCopy(decoded.header, "header")}
                className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer"
              >
                {copied === "header" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre
              className="text-xs leading-relaxed font-mono bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 overflow-auto max-h-60"
              dangerouslySetInnerHTML={{ __html: highlightJson(decoded.header) }}
            />
          </div>

          {/* payload */}
          <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Payload</span>
              <button
                onClick={() => handleCopy(decoded.payload, "payload")}
                className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer"
              >
                {copied === "payload" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre
              className="text-xs leading-relaxed font-mono bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 overflow-auto max-h-60"
              dangerouslySetInnerHTML={{ __html: highlightJson(decoded.payload) }}
            />
          </div>

          {/* expiration info */}
          {expInfo && (
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
                <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Issued At</div>
                <div className="text-xs font-mono text-navy/70">{expInfo.iat}</div>
              </div>
              <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
                <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Expires</div>
                <div className="text-xs font-mono text-navy/70">{expInfo.exp}</div>
              </div>
              <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
                <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Status</div>
                <div className={`text-xs font-mono font-semibold ${expInfo.isExpired === null ? "text-navy/40" : expInfo.isExpired ? "text-red-500" : "text-green-600"}`}>
                  {expInfo.isExpired === null ? "No exp claim" : expInfo.isExpired ? "Expired" : "Valid"}
                </div>
              </div>
            </div>
          )}

          {/* signature */}
          <div className="lg:col-span-2 rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Signature (encoded)</div>
            <div className="text-xs font-mono text-navy/50 break-all">{decoded.signature}</div>
          </div>
        </div>
      )}
    </div>
  );
}
