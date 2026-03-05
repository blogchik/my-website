"use client";

import { useMemo, useState } from "react";

/* ---------- component ---------- */
export default function RegexPlayground() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: null };
    try {
      const re = new RegExp(pattern, flags);
      const results: { match: string; index: number; groups: string[] }[] = [];
      let m: RegExpExecArray | null;
      const limit = 200;
      if (flags.includes("g")) {
        while ((m = re.exec(testText)) !== null && results.length < limit) {
          results.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        m = re.exec(testText);
        if (m) results.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }
      return { matches: results, error: null };
    } catch (e) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, testText]);

  // Build highlighted text
  const highlighted = useMemo(() => {
    if (!matches.length || !testText) return null;
    const parts: { text: string; isMatch: boolean; idx: number }[] = [];
    let last = 0;
    for (const m of matches) {
      if (m.index > last) parts.push({ text: testText.slice(last, m.index), isMatch: false, idx: last });
      parts.push({ text: m.match, isMatch: true, idx: m.index });
      last = m.index + m.match.length;
    }
    if (last < testText.length) parts.push({ text: testText.slice(last), isMatch: false, idx: last });
    return parts;
  }, [matches, testText]);

  const FLAG_OPTIONS = [
    { value: "g", label: "global" },
    { value: "i", label: "case-insensitive" },
    { value: "m", label: "multiline" },
    { value: "s", label: "dotAll" },
  ];

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
  };

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      {/* toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40 font-medium uppercase tracking-wider">Regex Tester</span>
        {(pattern || testText) && (
          <button
            onClick={() => { setPattern(""); setTestText(""); }}
            className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* pattern input */}
      <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40 mb-6">
        <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Pattern</label>
        <div className="flex items-center gap-2">
          <span className="text-navy/30 font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="[A-Za-z]+@[A-Za-z]+\\.com"
            className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors"
          />
          <span className="text-navy/30 font-mono">/{flags}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FLAG_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => toggleFlag(f.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all duration-200 cursor-pointer ${
                flags.includes(f.value)
                  ? "bg-orange/10 text-orange border border-orange/30"
                  : "bg-navy/[0.03] text-navy/40 border border-navy/10 hover:border-navy/20"
              }`}
            >
              {f.value} <span className="font-sans text-[10px] ml-0.5 opacity-60">{f.label}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* test string */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Test String</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Paste or type your test text here..."
            rows={10}
            className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none"
            spellCheck={false}
            suppressHydrationWarning
          />
        </div>

        {/* results */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">
            Matches {matches.length > 0 && <span className="text-orange font-mono ml-1">({matches.length})</span>}
          </span>

          {/* highlighted text */}
          {highlighted && (
            <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm font-mono overflow-auto max-h-40 whitespace-pre-wrap leading-relaxed">
              {highlighted.map((p) =>
                p.isMatch ? (
                  <mark key={p.idx} className="bg-orange/25 text-navy rounded px-0.5">
                    {p.text}
                  </mark>
                ) : (
                  <span key={p.idx} className="text-navy/60">{p.text}</span>
                )
              )}
            </div>
          )}

          {/* match list */}
          {matches.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {matches.slice(0, 50).map((m, i) => (
                <div key={i} className="text-xs flex items-start gap-2 py-1 border-b border-navy/5 last:border-0">
                  <span className="text-navy/30 w-6 shrink-0 text-right">{i + 1}.</span>
                  <span className="font-mono text-navy/70 break-all">{m.match || "(empty)"}</span>
                  <span className="text-navy/30 ml-auto shrink-0">@{m.index}</span>
                  {m.groups.length > 0 && (
                    <span className="text-purple-600 font-mono shrink-0">
                      [{m.groups.join(", ")}]
                    </span>
                  )}
                </div>
              ))}
              {matches.length > 50 && (
                <p className="text-xs text-navy/30 italic">Showing first 50 of {matches.length} matches.</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-navy/30 italic">
              {pattern && testText ? "No matches found." : "Enter a pattern and test text to find matches."}
            </p>
          )}
        </div>
      </div>

      {/* stats */}
      {matches.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Matches</div>
            <div className="text-sm font-mono text-navy/70 font-semibold">{matches.length}</div>
          </div>
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Groups (max)</div>
            <div className="text-sm font-mono text-navy/70 font-semibold">{Math.max(0, ...matches.map((m) => m.groups.length))}</div>
          </div>
          <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
            <div className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5">Flags</div>
            <div className="text-sm font-mono text-navy/70 font-semibold">/{flags || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
