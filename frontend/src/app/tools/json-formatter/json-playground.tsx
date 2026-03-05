"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- types ---------- */
type Indent = 2 | 4 | "tab";

interface HistoryEntry {
  id: string;
  raw: string;
  formatted: string;
  indent: Indent;
  sorted: boolean;
  createdAt: number;
}

interface JsonStats {
  topLevelKeys: number | null; // null for arrays
  topLevelItems: number | null; // null for objects
  maxDepth: number;
  rootType: "object" | "array" | "primitive";
  charCount: number;
}

/* ---------- constants ---------- */
const HISTORY_KEY = "json_fmt_history";
const MAX_HISTORY = 15;
const INDENT_LABELS: Record<Indent, string> = {
  2: "2 spaces",
  4: "4 spaces",
  tab: "Tab",
};

/* ---------- JSON utilities ---------- */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeysDeep((value as Record<string, unknown>)[k])])
    );
  }
  return value;
}

function getIndentStr(indent: Indent): string | number {
  return indent === "tab" ? "\t" : indent;
}

function getMaxDepth(value: unknown, depth = 0): number {
  if (Array.isArray(value)) {
    if (value.length === 0) return depth + 1;
    return Math.max(...value.map((v) => getMaxDepth(v, depth + 1)));
  }
  if (value !== null && typeof value === "object") {
    const vals = Object.values(value as Record<string, unknown>);
    if (vals.length === 0) return depth + 1;
    return Math.max(...vals.map((v) => getMaxDepth(v, depth + 1)));
  }
  return depth;
}

function getStats(parsed: unknown, formatted: string): JsonStats {
  const rootType = Array.isArray(parsed)
    ? "array"
    : parsed !== null && typeof parsed === "object"
    ? "object"
    : "primitive";

  return {
    topLevelKeys:
      rootType === "object"
        ? Object.keys(parsed as Record<string, unknown>).length
        : null,
    topLevelItems: rootType === "array" ? (parsed as unknown[]).length : null,
    maxDepth: getMaxDepth(parsed),
    rootType,
    charCount: formatted.length,
  };
}

/* ---------- syntax highlight ---------- */
function highlight(json: string): string {
  // Escape HTML first
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-600"; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-orange font-semibold" : "text-green-700";
      } else if (/true|false/.test(match)) {
        cls = "text-purple-600";
      } else if (/null/.test(match)) {
        cls = "text-red-500";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

/* ---------- clipboard ---------- */
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

/* ---------- cookie helpers ---------- */
function readHistory(): HistoryEntry[] {
  if (typeof document === "undefined") return [];
  try {
    const c = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${HISTORY_KEY}=`));
    if (!c) return [];
    return JSON.parse(decodeURIComponent(c.split("=")[1]));
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  const val = encodeURIComponent(JSON.stringify(entries.slice(0, MAX_HISTORY)));
  document.cookie = `${HISTORY_KEY}=${val};path=/;max-age=${60 * 60 * 24 * 400};SameSite=Lax`;
}

/* ---------- component ---------- */
export default function JsonPlayground() {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<Indent>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [stats, setStats] = useState<JsonStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history from cookie on client only
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHistory(readHistory()); }, []);

  // Auto-format on input / indent / sortKeys change (debounced 250ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!input.trim()) {
        setFormatted("");
        setError(null);
        setStats(null);
        return;
      }
      try {
        let parsed = JSON.parse(input);
        if (sortKeys) parsed = sortKeysDeep(parsed);
        const result = JSON.stringify(parsed, null, getIndentStr(indent));
        setFormatted(result);
        setError(null);
        setStats(getStats(parsed, result));
      } catch (err) {
        setFormatted("");
        setError(err instanceof Error ? err.message : "Invalid JSON");
        setStats(null);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, indent, sortKeys]);

  const handleCopy = useCallback(async () => {
    if (!formatted) return;
    await copyToClipboard(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formatted]);

  const handleSave = useCallback(() => {
    if (!formatted) return;
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      raw: input,
      formatted,
      indent,
      sorted: sortKeys,
      createdAt: Date.now(),
    };
    // Deduplicate by formatted output
    const updated = [
      entry,
      ...history.filter((h) => h.formatted !== formatted),
    ].slice(0, MAX_HISTORY);
    setHistory(updated);
    writeHistory(updated);
  }, [formatted, input, indent, sortKeys, history]);

  const handleLoad = useCallback(
    (entry: HistoryEntry) => {
      setInput(entry.raw);
      setIndent(entry.indent);
      setSortKeys(entry.sorted);
    },
    []
  );

  const handleClear = useCallback(() => {
    setInput("");
    setFormatted("");
    setError(null);
    setStats(null);
  }, []);

  const handleMinify = useCallback(() => {
    if (!formatted) return;
    try {
      const minified = JSON.stringify(JSON.parse(formatted));
      setInput(minified);
    } catch {
      /* noop */
    }
  }, [formatted]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Input panel ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-4 bg-white/40">
          <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
            Input
          </h3>

          {/* Raw JSON textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-navy/50 uppercase tracking-wider">
                Raw JSON
              </label>
              <span className="text-[10px] text-navy/30 tabular-nums">
                {new TextEncoder().encode(input).length} bytes
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'{\n  "name": "Abu",\n  "role": "developer"\n}'}
              rows={12}
              suppressHydrationWarning
              spellCheck={false}
              className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono
                focus:outline-none focus:border-orange/50 transition-colors resize-y placeholder:text-navy/20"
            />
          </div>

          {/* Indent size */}
          <div className="space-y-1.5">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Indentation
            </label>
            <div className="flex gap-2">
              {(Object.entries(INDENT_LABELS) as [string, string][]).map(
                ([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setIndent(k === "tab" ? "tab" : (Number(k) as 2 | 4))}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
                      indent === (k === "tab" ? "tab" : Number(k))
                        ? "bg-orange/10 border-orange/50 text-navy"
                        : "border-navy/10 text-navy/40 hover:border-navy/20 hover:text-navy/60"
                    }`}
                  >
                    {v}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sort keys toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-navy/70">Sort Keys</p>
              <p className="text-[10px] text-navy/40">
                Alphabetically sort all object keys
              </p>
            </div>
            <button
              onClick={() => setSortKeys((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                sortKeys ? "bg-orange" : "bg-navy/20"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  sortKeys ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleMinify}
              disabled={!formatted}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-navy/10
                text-navy/50 hover:border-navy/20 hover:text-navy/70 transition-all duration-200
                cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Minify
            </button>
            <button
              onClick={handleClear}
              disabled={!input}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-navy/10
                text-navy/50 hover:border-red-400/50 hover:text-red-500/70 transition-all duration-200
                cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              disabled={!formatted}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium border border-navy/10
                text-navy/50 hover:border-orange/40 hover:text-orange/70 transition-all duration-200
                cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>

        {/* ── Right: Output panel ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-4 bg-white/40 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              Formatted Output
            </h3>
            <button
              onClick={handleCopy}
              disabled={!formatted}
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

          {/* Error display */}
          {error && (
            <div className="rounded-lg border border-red-300/60 bg-red-50/60 p-3 space-y-1">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Invalid JSON
              </p>
              <p className="text-xs text-red-500 font-mono break-all">{error}</p>
            </div>
          )}

          {/* Output */}
          <div className="flex-1 relative min-h-[280px]">
            {formatted ? (
              <pre
                className="w-full h-full min-h-[280px] overflow-auto bg-navy/[0.03] border border-navy/10 rounded-lg
                  px-4 py-3 text-xs font-mono leading-relaxed text-navy"
                dangerouslySetInnerHTML={{ __html: highlight(formatted) }}
              />
            ) : (
              <div className="w-full min-h-[280px] bg-navy/[0.03] border border-navy/10 rounded-lg
                px-4 py-3 flex items-center justify-center">
                <p className="text-xs text-navy/25 font-mono">
                  {input.trim()
                    ? "Parsing…"
                    : "Formatted output will appear here"}
                </p>
              </div>
            )}
          </div>

          {/* Stats bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Type",
                  value:
                    stats.rootType.charAt(0).toUpperCase() +
                    stats.rootType.slice(1),
                },
                {
                  label:
                    stats.rootType === "array" ? "Items" : "Top-level Keys",
                  value:
                    stats.rootType === "array"
                      ? (stats.topLevelItems ?? 0).toString()
                      : (stats.topLevelKeys ?? 0).toString(),
                },
                { label: "Max Depth", value: stats.maxDepth.toString() },
                {
                  label: "Size",
                  value:
                    stats.charCount < 1024
                      ? `${stats.charCount} chars`
                      : `${(stats.charCount / 1024).toFixed(1)} KB`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center"
                >
                  <p className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-bold text-navy font-mono">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              History
            </h2>
            <button
              onClick={() => {
                setHistory([]);
                writeHistory([]);
              }}
              className="text-xs text-navy/30 hover:text-red-400/70 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {history.map((entry) => (
              <details
                key={entry.id}
                className="group border border-navy/10 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-navy/[0.02] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] text-white font-bold bg-navy/30 rounded px-1.5 py-0.5 flex-shrink-0">
                      {entry.indent === "tab" ? "TAB" : `${entry.indent}sp`}
                    </span>
                    {entry.sorted && (
                      <span className="text-[10px] text-orange/70 border border-orange/20 rounded px-1.5 py-0.5 flex-shrink-0">
                        sorted
                      </span>
                    )}
                    <span className="text-xs text-navy/50 font-mono truncate">
                      {entry.raw.slice(0, 60).replace(/\s+/g, " ")}…
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-[10px] text-navy/30 tabular-nums">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLoad(entry);
                      }}
                      className="text-[10px] text-orange/60 hover:text-orange transition-colors cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                </summary>
                <div className="px-4 pb-3">
                  <pre className="text-[11px] font-mono text-navy/60 bg-navy/[0.03] rounded-lg p-3 overflow-auto max-h-48"
                    dangerouslySetInnerHTML={{ __html: highlight(entry.formatted) }}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
