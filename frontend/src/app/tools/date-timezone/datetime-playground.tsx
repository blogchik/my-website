"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai", "Asia/Tashkent",
  "Australia/Sydney", "Pacific/Auckland",
];

function formatInTz(date: Date, tz: string, fmt: string): string {
  try {
    if (fmt === "iso") return date.toLocaleString("sv-SE", { timeZone: tz }).replace(" ", "T");
    if (fmt === "full") return date.toLocaleString("en-US", { timeZone: tz, weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZoneName: "short" });
    if (fmt === "short") return date.toLocaleString("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
    if (fmt === "time") return date.toLocaleString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    return date.toLocaleString("en-US", { timeZone: tz });
  } catch { return "Invalid timezone"; }
}

function getOffset(tz: string, date: Date): string {
  try {
    const str = date.toLocaleString("en-US", { timeZone: tz, timeZoneName: "shortOffset" });
    const match = str.match(/GMT([+-]\d{1,2}(:\d{2})?)/);
    return match ? "UTC" + match[1] : "UTC";
  } catch { return ""; }
}

function parseDuration(ms: number): string {
  const abs = Math.abs(ms);
  const d = Math.floor(abs / 86400000);
  const h = Math.floor((abs % 86400000) / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.length ? parts.join(" ") : "0s";
}

export default function DateTimePlayground() {
  const [selectedTzs, setSelectedTzs] = useState(["UTC", "America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Tashkent"]);
  const [inputDate, setInputDate] = useState("");
  const [now, setNow] = useState(new Date());
  const [useCustom, setUseCustom] = useState(false);
  const [format, setFormat] = useState("full");
  const [durationFrom, setDurationFrom] = useState("");
  const [durationTo, setDurationTo] = useState("");
  const durationResult = useMemo(() => {
    if (!durationFrom || !durationTo) return "";
    const from = new Date(durationFrom);
    const to = new Date(durationTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return "Invalid date";
    const diff = to.getTime() - from.getTime();
    return `${parseDuration(diff)} (${Math.abs(diff).toLocaleString()} ms)`;
  }, [durationFrom, durationTo]);
  const [copiedTz, setCopiedTz] = useState<string | null>(null);

  const currentDate = useCustom && inputDate ? new Date(inputDate) : now;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleTz = useCallback((tz: string) => {
    setSelectedTzs((prev) => prev.includes(tz) ? prev.filter((t) => t !== tz) : [...prev, tz]);
  }, []);

  const handleCopy = useCallback(async (text: string, tz: string) => {
    await copyToClipboard(text);
    setCopiedTz(tz);
    setTimeout(() => setCopiedTz(null), 1500);
  }, []);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
          <button onClick={() => setUseCustom(false)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${!useCustom ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Live Clock</button>
          <button onClick={() => setUseCustom(true)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${useCustom ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Custom Date</button>
        </div>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          <option value="full">Full</option>
          <option value="iso">ISO 8601</option>
          <option value="short">Short</option>
          <option value="time">Time only</option>
        </select>
        {useCustom && <input type="datetime-local" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />}
        <button onClick={() => setSelectedTzs(["UTC"])} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Reset</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timezone picker */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Timezones</label>
          <div className="space-y-1 max-h-[24rem] overflow-auto">
            {TIMEZONES.map((tz) => (
              <label key={tz} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-navy/[0.03] cursor-pointer transition-colors">
                <input type="checkbox" checked={selectedTzs.includes(tz)} onChange={() => toggleTz(tz)} className="accent-orange" />
                <span className="text-xs font-mono text-navy/60">{tz}</span>
                <span className="text-[10px] text-navy/30 ml-auto">{getOffset(tz, currentDate)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timezone grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-2">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Time Across Zones</label>
            <div className="space-y-2">
              {selectedTzs.map((tz) => {
                const formatted = formatInTz(currentDate, tz, format);
                return (
                  <div key={tz} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-navy/[0.02] hover:bg-navy/[0.04] transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-navy/40 font-mono">{tz} ({getOffset(tz, currentDate)})</div>
                      <div className="font-mono text-sm text-navy mt-0.5">{formatted}</div>
                    </div>
                    <button onClick={() => handleCopy(formatted, tz)} className="text-[10px] text-navy/20 group-hover:text-orange transition-colors cursor-pointer shrink-0">{copiedTz === tz ? "✓" : "Copy"}</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration calculator */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Duration Calculator</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-navy/40 uppercase block mb-1">From</label>
                <input type="datetime-local" value={durationFrom} onChange={(e) => setDurationFrom(e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              </div>
              <div>
                <label className="text-[10px] text-navy/40 uppercase block mb-1">To</label>
                <input type="datetime-local" value={durationTo} onChange={(e) => setDurationTo(e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              </div>
            </div>
            {durationResult && <div className="font-mono text-sm text-navy bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2">{durationResult}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
