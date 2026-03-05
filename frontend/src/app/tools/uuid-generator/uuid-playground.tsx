"use client";

import { useCallback, useEffect, useState } from "react";

/* ---------- types ---------- */
type UuidFormat = "standard" | "uppercase" | "no-dashes" | "braces" | "urn";
type CaseFilter = "default" | "uppercase" | "lowercase";

interface HistoryEntry {
  id: string;
  uuids: string[];
  format: UuidFormat;
  count: number;
  createdAt: number; // epoch ms
}

const FORMAT_LABELS: Record<UuidFormat, string> = {
  standard: "Standard",
  uppercase: "UPPERCASE",
  "no-dashes": "No dashes",
  braces: "{Braces}",
  urn: "URN",
};

const CASE_LABELS: Record<CaseFilter, string> = {
  default: "Default",
  uppercase: "UPPER",
  lowercase: "lower",
};

const HISTORY_KEY = "uuid_gen_history";
const MAX_HISTORY = 20;

/* ---------- helpers ---------- */
function generateUuid(): string {
  // Modern browsers & Node 19+ support crypto.randomUUID()
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback (RFC 4122 v4 compliant)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatUuid(raw: string, fmt: UuidFormat, caseFilter: CaseFilter): string {
  let result = raw;

  switch (fmt) {
    case "standard":
      break;
    case "uppercase":
      result = result.toUpperCase();
      break;
    case "no-dashes":
      result = result.replace(/-/g, "");
      break;
    case "braces":
      result = `{${result}}`;
      break;
    case "urn":
      result = `urn:uuid:${result}`;
      break;
  }

  if (caseFilter === "uppercase") result = result.toUpperCase();
  else if (caseFilter === "lowercase") result = result.toLowerCase();

  return result;
}

function readHistory(): HistoryEntry[] {
  if (typeof document === "undefined") return [];
  try {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${HISTORY_KEY}=`));
    if (!cookie) return [];
    return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  const trimmed = entries.slice(0, MAX_HISTORY);
  const val = encodeURIComponent(JSON.stringify(trimmed));
  // 400-day max-age (max for cookies)
  document.cookie = `${HISTORY_KEY}=${val};path=/;max-age=${60 * 60 * 24 * 400};SameSite=Lax`;
}

/** Works in both HTTPS and plain HTTP (e.g. local network dev). */
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback: temporary textarea + execCommand
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

/* ---------- Copy icon ---------- */
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

/* ========== COMPONENT ========== */
export function UuidPlayground() {
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<UuidFormat>("standard");
  const [caseFilter, setCaseFilter] = useState<CaseFilter>("default");
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from cookie on mount
  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const generate = useCallback(() => {
    const uuids = Array.from({ length: count }, () =>
      formatUuid(generateUuid(), format, caseFilter)
    );
    setResults(uuids);
    setCopied(null);
    setCopiedAll(false);

    // Save to history
    const entry: HistoryEntry = {
      id: generateUuid(),
      uuids,
      format,
      count,
      createdAt: Date.now(),
    };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    writeHistory(updated);
  }, [count, format, caseFilter, history]);

  async function copyOne(uuid: string, index: number) {
    await copyToClipboard(uuid);
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }

  async function copyAll() {
    await copyToClipboard(results.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  function clearHistory() {
    setHistory([]);
    writeHistory([]);
  }

  return (
    <div
      className="animate-fade-up space-y-8"
      style={{ animationDelay: "0.2s" }}
    >
      {/* ── Two-column playground ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        {/* ── Left: Parameters ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-5 h-fit">
          <h3 className="text-xs font-medium text-navy/40 uppercase tracking-widest">
            Parameters
          </h3>

          {/* Count */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Count
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))
              }
              className="w-full bg-navy/[0.04] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors"
            />
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as UuidFormat)}
              className="w-full bg-navy/[0.04] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors cursor-pointer"
            >
              {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Case filter */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Case
            </label>
            <select
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value as CaseFilter)}
              className="w-full bg-navy/[0.04] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors cursor-pointer"
            >
              {Object.entries(CASE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            className="group/gen w-full bg-orange text-navy font-bold text-sm px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover/gen:rotate-180 transition-transform duration-500"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0115.3-6.4L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 01-15.3 6.4L3 16" />
            </svg>
            Generate
          </button>
        </div>

        {/* ── Right: Output ── */}
        <div className="min-h-[280px] flex flex-col">
          {results.length > 0 ? (
            <div className="border border-navy/10 rounded-2xl overflow-hidden flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-center justify-between bg-navy/[0.03] px-4 py-3 border-b border-navy/10">
                <span className="text-xs text-navy/50 uppercase tracking-wider">
                  {results.length} UUID{results.length > 1 ? "s" : ""} generated
                </span>
                <button
                  onClick={copyAll}
                  className="inline-flex items-center gap-1.5 text-xs text-navy/50 hover:text-orange transition-colors cursor-pointer"
                >
                  {copiedAll ? (
                    <>
                      <CheckIcon className="text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              {/* UUID list */}
              <ul className="divide-y divide-navy/5 max-h-[420px] overflow-y-auto flex-1">
                {results.map((uuid, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-navy/[0.02] transition-colors group"
                  >
                    <code className="text-sm font-mono text-navy/80 break-all pr-4 select-all">
                      {uuid}
                    </code>
                    <button
                      onClick={() => copyOne(uuid, i)}
                      className="shrink-0 p-1.5 rounded-md text-navy/30 hover:text-orange hover:bg-orange/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Copy UUID ${i + 1}`}
                    >
                      {copied === i ? (
                        <CheckIcon className="text-green-600" />
                      ) : (
                        <CopyIcon />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="border border-dashed border-navy/10 rounded-2xl flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-4 opacity-30">🆔</span>
              <p className="text-sm text-navy/40">
                Click <strong className="text-navy/60">Generate</strong> to
                create UUIDs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              Recent Results
            </h2>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-navy/40 hover:text-red-500 transition-colors cursor-pointer"
            >
              <TrashIcon />
              <span>Clear</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history.map((entry) => (
              <details
                key={entry.id}
                className="group border border-navy/10 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-navy/[0.02] transition-colors list-none">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-navy/70 font-mono">
                      {entry.uuids[0]?.slice(0, 18)}…
                    </span>
                    <span className="text-xs text-navy/30">
                      ×{entry.count} · {FORMAT_LABELS[entry.format]}
                    </span>
                  </div>
                  <span className="text-[10px] text-navy/30 tabular-nums">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>
                </summary>
                <div className="px-4 pb-3 border-t border-navy/5">
                  <ul className="divide-y divide-navy/5">
                    {entry.uuids.map((uuid, i) => (
                      <li
                        key={i}
                        className="py-1.5 flex items-center justify-between"
                      >
                        <code className="text-xs font-mono text-navy/60 break-all select-all">
                          {uuid}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
