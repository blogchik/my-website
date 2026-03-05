"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- types ---------- */
type Direction = "json-to-yaml" | "yaml-to-json";
type Indent = 2 | 4;

/* ================================================================
   Pure-JS JSON ↔ YAML converter (no external dependencies)
   Handles: objects, arrays, strings, numbers, booleans, null
   ================================================================ */

// ── JSON → YAML ────────────────────────────────────────────────
function needsQuoting(s: string): boolean {
  if (s === "") return true;
  if (/^\s|\s$/.test(s)) return true;
  if (/^[-?:,[\]{}#&*!|>'"%@`~]/.test(s)) return true;
  if (/^(?:true|false|null|~|yes|no|on|off)$/i.test(s)) return true;
  if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(s)) return true;
  if (/: |^: $/.test(s)) return true;
  if (/ #/.test(s)) return true;
  if (/[\n\r]/.test(s)) return true;
  return false;
}

function escStr(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function serializeVal(
  val: unknown,
  indentSize: number,
  level: number,
  sortKeys: boolean
): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return isFinite(val) ? String(val) : "null";
  if (typeof val === "string") {
    return needsQuoting(val) ? `"${escStr(val)}"` : val;
  }

  const pad = " ".repeat(indentSize * level);
  const childPad = " ".repeat(indentSize * (level + 1));

  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    return val
      .map((item) => {
        const isComplex =
          typeof item === "object" && item !== null;
        if (isComplex) {
          const inner = serializeVal(item, indentSize, level + 1, sortKeys);
          const lines = inner.split("\n");
          // first key/item inline after "- "
          return `\n${pad}- ${lines[0]}\n${lines.slice(1).join("\n")}`;
        }
        return `\n${pad}- ${serializeVal(item, indentSize, level + 1, sortKeys)}`;
      })
      .join("");
  }

  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    let keys = Object.keys(obj);
    if (sortKeys) keys = keys.sort();
    if (keys.length === 0) return "{}";

    return keys
      .map((key) => {
        const yamlKey = needsQuoting(key) ? `"${escStr(key)}"` : key;
        const v = obj[key];

        if (v === null || typeof v !== "object") {
          return `\n${pad}${yamlKey}: ${serializeVal(v, indentSize, level + 1, sortKeys)}`;
        }
        if (Array.isArray(v)) {
          if (v.length === 0) return `\n${pad}${yamlKey}: []`;
          const items = serializeVal(v, indentSize, level, sortKeys);
          return `\n${pad}${yamlKey}:${items}`;
        }
        const nested = v as Record<string, unknown>;
        if (Object.keys(nested).length === 0) return `\n${pad}${yamlKey}: {}`;
        const items = serializeVal(v, indentSize, level + 1, sortKeys);
        return `\n${pad}${yamlKey}:\n${childPad}${items.trimStart()}`;
      })
      .join("");
  }
  return String(val);
}

function jsonToYaml(input: string, indent: Indent, sortKeys: boolean): string {
  const parsed = JSON.parse(input);
  let obj = parsed;
  if (sortKeys) obj = sortDeep(obj);
  const result = serializeVal(obj, indent, 0, false); // sortKeys already applied
  return (result.startsWith("\n") ? result.slice(1) : result).trimEnd() + "\n";
}

// ── YAML → JSON ────────────────────────────────────────────────
function parseScalar(s: string): unknown {
  const t = s.trim();
  if (t === "" || t === "null" || t === "~") return null;
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  if (/^-?\d+\.\d+(?:[eE][+-]?\d+)?$/.test(t) || /^-?\d+[eE][+-]?\d+$/.test(t))
    return parseFloat(t);
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  return t;
}

function getIndent(line: string): number {
  return line.length - line.trimStart().length;
}

function stripComment(line: string): string {
  // Remove inline comment (not inside quotes)
  let inSingle = false, inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    if (c === '"' && !inSingle) inDouble = !inDouble;
    if (c === "#" && !inSingle && !inDouble && (i === 0 || line[i - 1] === " "))
      return line.slice(0, i).trimEnd();
  }
  return line;
}

function parseYamlLines(
  lines: string[],
  start: number,
  minIndent: number
): [unknown, number] {
  // Skip blank / comment lines
  let i = start;
  while (
    i < lines.length &&
    (lines[i].trim() === "" || lines[i].trimStart().startsWith("#"))
  )
    i++;

  if (i >= lines.length) return [null, i];

  const firstLine = stripComment(lines[i]);
  const indent = getIndent(firstLine);
  if (indent < minIndent) return [null, i];

  const trimmed = firstLine.trimStart();

  // Sequence
  if (trimmed.startsWith("- ") || trimmed === "-") {
    return parseSequence(lines, i, indent);
  }

  // Mapping — key: value
  const colonIdx = findMappingColon(trimmed);
  if (colonIdx !== -1) {
    return parseMapping(lines, i, indent);
  }

  // Scalar
  return [parseScalar(trimmed), i + 1];
}

function findMappingColon(s: string): number {
  let inSingle = false, inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    if (c === '"' && !inSingle) inDouble = !inDouble;
    if (c === ":" && !inSingle && !inDouble) {
      if (i + 1 >= s.length || s[i + 1] === " " || s[i + 1] === "\t" || s[i + 1] === "\n") return i;
    }
  }
  return -1;
}

function parseMapping(
  lines: string[],
  start: number,
  baseIndent: number
): [Record<string, unknown>, number] {
  const obj: Record<string, unknown> = {};
  let i = start;

  while (i < lines.length) {
    const raw = lines[i];
    if (raw.trim() === "" || raw.trimStart().startsWith("#")) { i++; continue; }

    const cleaned = stripComment(raw);
    const indent = getIndent(cleaned);
    if (indent < baseIndent) break;
    if (indent > baseIndent) { i++; continue; }

    const trimmed = cleaned.trimStart();
    if (trimmed.startsWith("- ") || trimmed === "-") break; // switched to sequence

    const colonIdx = findMappingColon(trimmed);
    if (colonIdx === -1) { i++; continue; }

    const rawKey = trimmed.slice(0, colonIdx).trim();
    const key =
      (rawKey.startsWith('"') && rawKey.endsWith('"')) ||
      (rawKey.startsWith("'") && rawKey.endsWith("'"))
        ? rawKey.slice(1, -1)
        : rawKey;

    const rest = trimmed.slice(colonIdx + 1).trimStart();
    i++;

    if (rest === "" || rest.startsWith("#")) {
      // Value is on next indented lines
      let j = i;
      while (
        j < lines.length &&
        (lines[j].trim() === "" || lines[j].trimStart().startsWith("#"))
      )
        j++;

      if (j < lines.length && getIndent(stripComment(lines[j])) > baseIndent) {
        const [val, nextI] = parseYamlLines(lines, j, getIndent(stripComment(lines[j])));
        obj[key] = val;
        i = nextI;
      } else {
        obj[key] = null;
      }
    } else {
      // Inline value — peek if next lines are deeper (nested block)
      let j = i;
      while (j < lines.length && (lines[j].trim() === "" || lines[j].trimStart().startsWith("#"))) j++;
      if (j < lines.length && getIndent(stripComment(lines[j])) > baseIndent) {
        // Ignore inline hint, parse as block
        const [val, nextI] = parseYamlLines(lines, j, getIndent(stripComment(lines[j])));
        obj[key] = val;
        i = nextI;
      } else {
        obj[key] = parseScalar(rest);
      }
    }
  }

  return [obj, i];
}

function parseSequence(
  lines: string[],
  start: number,
  baseIndent: number
): [unknown[], number] {
  const arr: unknown[] = [];
  let i = start;

  while (i < lines.length) {
    const raw = lines[i];
    if (raw.trim() === "" || raw.trimStart().startsWith("#")) { i++; continue; }

    const cleaned = stripComment(raw);
    const indent = getIndent(cleaned);
    if (indent < baseIndent) break;
    if (indent > baseIndent) { i++; continue; }

    const trimmed = cleaned.trimStart();
    if (!trimmed.startsWith("-")) break;

    const rest = trimmed.slice(1).trimStart();
    i++;

    if (rest === "" || rest.startsWith("#")) {
      // Value on next lines
      let j = i;
      while (j < lines.length && (lines[j].trim() === "" || lines[j].trimStart().startsWith("#"))) j++;
      if (j < lines.length && getIndent(stripComment(lines[j])) > baseIndent) {
        const [val, nextI] = parseYamlLines(lines, j, getIndent(stripComment(lines[j])));
        arr.push(val);
        i = nextI;
      } else {
        arr.push(null);
      }
    } else {
      const colonIdx = findMappingColon(rest);
      if (colonIdx !== -1) {
        // Inline mapping item — synthesize a block starting at this indent+2
        const syntheticIndent = baseIndent + 2;
        const syntheticLines = [
          " ".repeat(syntheticIndent) + rest,
          ...lines.slice(i),
        ];
        const [val, nextI] = parseMapping(syntheticLines, 0, syntheticIndent);
        arr.push(val);
        i += nextI - 1;
      } else {
        arr.push(parseScalar(rest));
      }
    }
  }

  return [arr, i];
}

function yamlToJson(input: string, indent: Indent, sortKeys: boolean): string {
  const lines = input.split("\n");
  let firstContent = 0;
  while (
    firstContent < lines.length &&
    (lines[firstContent].trim() === "" || lines[firstContent].trimStart().startsWith("#"))
  )
    firstContent++;

  if (firstContent >= lines.length) throw new Error("Empty or invalid YAML input");

  const [result] = parseYamlLines(lines, 0, 0);
  if (result === null && firstContent < lines.length) {
    throw new Error("Could not parse YAML");
  }

  let obj = result;
  if (sortKeys) obj = sortDeep(obj);
  return JSON.stringify(obj, null, indent);
}

// ── Shared helpers ─────────────────────────────────────────────
function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortDeep((value as Record<string, unknown>)[k])])
    );
  }
  return value;
}

/* ---------- syntax highlight ---------- */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightYamlScalar(raw: string): string {
  if (raw === "") return "";
  const t = raw.trim();
  // quoted string
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return `<span class="text-green-700">${esc(raw)}</span>`;
  }
  // boolean / null
  if (/^(?:true|false|null|~)$/i.test(t)) {
    return `<span class="text-purple-600">${esc(raw)}</span>`;
  }
  // number
  if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(t)) {
    return `<span class="text-blue-600">${esc(raw)}</span>`;
  }
  return esc(raw);
}

function highlightYaml(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      // Handle key: value lines specially to avoid regex cross-contamination
      const commentMatch = line.match(/^(.*?)((?<![\\])#.*)$/);
      let comment = "";
      let rest = line;
      if (commentMatch) {
        rest = commentMatch[1];
        comment = `<span class="opacity-40 italic">${esc(commentMatch[2])}</span>`;
      }

      // Try to split into key and value parts
      const keyValueMatch = rest.match(/^(\s*)([\w][\w\-.]*)(\s*:\s*)(.*)$/);
      if (keyValueMatch) {
        const [, indent, key, sep, rawValue] = keyValueMatch;
        const colon = sep.replace(/\s/g, "").replace(":", '<span class="opacity-50">:</span>');
        const spaces = sep.replace(":", "");
        const value = highlightYamlScalar(rawValue);
        return `${esc(indent)}<span class="text-orange font-semibold">${esc(key)}</span>${colon}${spaces}${value}${comment}`;
      }

      // Sequence item: "- value"
      const seqMatch = rest.match(/^(\s*-\s+)(.*)$/);
      if (seqMatch) {
        const [, prefix, rawValue] = seqMatch;
        return `${esc(prefix)}${highlightYamlScalar(rawValue)}${comment}`;
      }

      return `${esc(rest)}${comment}`;
    })
    .join("\n");
}

function highlightJson(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-600";
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

/* ---------- component ---------- */
export default function YamlPlayground() {
  const [direction, setDirection] = useState<Direction>("json-to-yaml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<Indent>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-convert on any relevant change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      try {
        const result =
          direction === "json-to-yaml"
            ? jsonToYaml(input, indent, sortKeys)
            : yamlToJson(input, indent, sortKeys);
        setOutput(result);
        setError(null);
      } catch (err) {
        setOutput("");
        setError(err instanceof Error ? err.message : "Conversion failed");
      }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, direction, indent, sortKeys]);

  const handleSwitch = useCallback(() => {
    setDirection((d) => (d === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml"));
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

  const inputLang  = direction === "json-to-yaml" ? "JSON" : "YAML";
  const outputLang = direction === "json-to-yaml" ? "YAML" : "JSON";
  const placeholder =
    direction === "json-to-yaml"
      ? '{\n  "name": "Abu",\n  "role": "developer",\n  "active": true\n}'
      : "name: Abu\nrole: developer\nactive: true";

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Direction toggle */}
        <div className="flex rounded-xl border border-navy/10 overflow-hidden">
          {(["json-to-yaml", "yaml-to-json"] as Direction[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDirection(d); setInput(""); setOutput(""); setError(null); }}
              className={`px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                direction === d
                  ? "bg-navy text-white"
                  : "text-navy/40 hover:text-navy/70"
              }`}
            >
              {d === "json-to-yaml" ? "JSON → YAML" : "YAML → JSON"}
            </button>
          ))}
        </div>

        {/* Indent */}
        <div className="flex rounded-xl border border-navy/10 overflow-hidden">
          {([2, 4] as Indent[]).map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-3 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                indent === n
                  ? "bg-navy/10 text-navy"
                  : "text-navy/40 hover:text-navy/70"
              }`}
            >
              {n} spaces
            </button>
          ))}
        </div>

        {/* Sort keys toggle */}
        <button
          onClick={() => setSortKeys((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
            sortKeys
              ? "bg-orange/10 border-orange/40 text-navy"
              : "border-navy/10 text-navy/40 hover:border-navy/20 hover:text-navy/60"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
          </svg>
          Sort keys
        </button>

        {/* Switch */}
        <button
          onClick={handleSwitch}
          disabled={!output}
          title="Use output as input and flip direction"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-navy/10 text-xs
            text-navy/40 hover:border-orange/40 hover:text-orange transition-all duration-200
            cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
          </svg>
          Use as input
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

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              {inputLang} Input
            </h3>
            <span className="text-[10px] text-navy/30 tabular-nums font-mono">
              {new TextEncoder().encode(input).length} bytes
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={16}
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
              {outputLang} Output
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
          <div className="flex-1 min-h-[320px]">
            {output ? (
              <pre
                className="w-full h-full min-h-[320px] overflow-auto bg-navy/[0.03] border border-navy/10
                  rounded-lg px-4 py-3 text-sm font-mono text-navy leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    direction === "json-to-yaml"
                      ? highlightYaml(output)
                      : highlightJson(output),
                }}
              />
            ) : (
              <div className="w-full min-h-[320px] bg-navy/[0.03] border border-navy/10 rounded-lg
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
                { label: "Input", value: `${new TextEncoder().encode(input).length} B` },
                { label: "Output", value: `${new TextEncoder().encode(output).length} B` },
                { label: "Lines", value: `${output.split("\n").length}` },
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
