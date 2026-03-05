"use client";

import { useCallback, useEffect, useState } from "react";

/* ---------- helpers ---------- */
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

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = date.getTime() - now;
  const abs = Math.abs(diff);
  const seconds = Math.floor(abs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let label: string;
  if (years > 0) label = `${years} year${years > 1 ? "s" : ""}`;
  else if (months > 0) label = `${months} month${months > 1 ? "s" : ""}`;
  else if (days > 0) label = `${days} day${days > 1 ? "s" : ""}`;
  else if (hours > 0) label = `${hours} hour${hours > 1 ? "s" : ""}`;
  else if (minutes > 0) label = `${minutes} minute${minutes > 1 ? "s" : ""}`;
  else label = `${seconds} second${seconds !== 1 ? "s" : ""}`;

  return diff < 0 ? `${label} ago` : `in ${label}`;
}

/* ---------- component ---------- */
export default function TimestampPlayground() {
  const [mode, setMode] = useState<"toDate" | "toTimestamp">("toDate");
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [tz, setTz] = useState("UTC");
  const [copied, setCopied] = useState<string | null>(null);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  // live clock
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  // Timestamp → Date
  const parsedDate = (() => {
    if (mode !== "toDate" || !tsInput.trim()) return null;
    const n = Number(tsInput.trim());
    if (isNaN(n)) return null;
    // auto-detect seconds vs milliseconds
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return d;
  })();

  // Date → Timestamp
  const parsedTimestamp = (() => {
    if (mode !== "toTimestamp" || !dateInput.trim()) return null;
    const d = new Date(dateInput.trim());
    if (isNaN(d.getTime())) return null;
    return d;
  })();

  const formatInTz = (d: Date, timezone: string) => {
    try {
      return d.toLocaleString("en-US", { timeZone: timezone, dateStyle: "full", timeStyle: "long" });
    } catch {
      return d.toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" });
    }
  };

  const TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Moscow",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Tashkent",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland",
  ];

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40 font-medium uppercase tracking-wider">Mode</span>
        <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
          <button
            onClick={() => setMode("toDate")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "toDate" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}
          >
            Timestamp → Date
          </button>
          <button
            onClick={() => setMode("toTimestamp")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${mode === "toTimestamp" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}
          >
            Date → Timestamp
          </button>
        </div>
        <button
          onClick={() => { setTsInput(""); setDateInput(""); }}
          className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* live clock */}
      <div className="mb-6 rounded-lg bg-navy/[0.03] border border-navy/10 px-4 py-2.5 flex items-center gap-4 text-xs font-mono">
        <span className="text-navy/40">Now:</span>
        <span className="text-navy/70">{now}</span>
        <span className="text-navy/30">|</span>
        <span className="text-navy/50">{new Date(now * 1000).toISOString()}</span>
        <button
          onClick={() => {
            if (mode === "toDate") setTsInput(String(now));
            else setDateInput(new Date(now * 1000).toISOString());
          }}
          className="ml-auto text-orange hover:text-orange/80 transition-colors cursor-pointer"
        >
          Use now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* input */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">
            {mode === "toDate" ? "Unix Timestamp" : "Date String"}
          </label>
          {mode === "toDate" ? (
            <input
              type="text"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              placeholder="1705312200 or 1705312200000"
              className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors"
            />
          ) : (
            <input
              type="text"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="2024-01-15T10:30:00Z"
              className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors"
            />
          )}
          <div className="pt-2">
            <label className="text-[10px] text-navy/40 uppercase tracking-wider block mb-1">Timezone</label>
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors cursor-pointer"
              suppressHydrationWarning
            >
              {TIMEZONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* output */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Result</span>

          {mode === "toDate" && parsedDate && (
            <div className="space-y-2.5">
              {[
                { label: "Local (TZ)", value: formatInTz(parsedDate, tz) },
                { label: "ISO 8601", value: parsedDate.toISOString() },
                { label: "UTC string", value: parsedDate.toUTCString() },
                { label: "Seconds", value: String(Math.floor(parsedDate.getTime() / 1000)) },
                { label: "Milliseconds", value: String(parsedDate.getTime()) },
                { label: "Relative", value: relativeTime(parsedDate) },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span className="text-navy/40 w-24 shrink-0">{row.label}</span>
                  <span className="font-mono text-navy/70 flex-1 truncate">{row.value}</span>
                  <button
                    onClick={() => handleCopy(row.value, row.label)}
                    className="text-navy/30 hover:text-orange transition-colors cursor-pointer shrink-0"
                  >
                    {copied === row.label ? "✓" : "⎘"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {mode === "toTimestamp" && parsedTimestamp && (
            <div className="space-y-2.5">
              {[
                { label: "Seconds", value: String(Math.floor(parsedTimestamp.getTime() / 1000)) },
                { label: "Milliseconds", value: String(parsedTimestamp.getTime()) },
                { label: "ISO 8601", value: parsedTimestamp.toISOString() },
                { label: "UTC string", value: parsedTimestamp.toUTCString() },
                { label: "Local (TZ)", value: formatInTz(parsedTimestamp, tz) },
                { label: "Relative", value: relativeTime(parsedTimestamp) },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-xs">
                  <span className="text-navy/40 w-24 shrink-0">{row.label}</span>
                  <span className="font-mono text-navy/70 flex-1 truncate">{row.value}</span>
                  <button
                    onClick={() => handleCopy(row.value, row.label)}
                    className="text-navy/30 hover:text-orange transition-colors cursor-pointer shrink-0"
                  >
                    {copied === row.label ? "✓" : "⎘"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {((mode === "toDate" && !parsedDate) || (mode === "toTimestamp" && !parsedTimestamp)) && (
            <p className="text-xs text-navy/30 italic">Enter a value to see results.</p>
          )}
        </div>
      </div>
    </div>
  );
}
