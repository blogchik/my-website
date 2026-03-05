"use client";

import { useCallback, useMemo, useState } from "react";

/* ---------- analysis ---------- */
interface Stats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytes: number;
  readingTime: string;
}

function analyze(text: string): Stats {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const sentences = (text.match(/[^.!?\n]+[.!?]+/g) ?? []).length;
  const paragraphs =
    text.trim() === ""
      ? 0
      : text.split(/\n\s*\n/).filter((p) => p.trim() !== "").length || 1;
  const lines = text === "" ? 0 : text.split("\n").length;
  const bytes = new TextEncoder().encode(text).length;
  const minutes = words / 200;
  const readingTime =
    words === 0 ? "0s" : minutes < 1 ? "< 1 min" : `${Math.ceil(minutes)} min`;

  return { chars, charsNoSpaces, words, sentences, paragraphs, lines, bytes, readingTime };
}

function topWords(text: string, n = 10): { label: string; count: number }[] {
  if (!text.trim()) return [];
  const words = text.toLowerCase().match(/[a-zA-Z']+/g) ?? [];
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

function topChars(text: string, n = 10): { label: string; count: number }[] {
  if (!text.trim()) return [];
  const freq: Record<string, number> = {};
  for (const c of text) {
    if (/\s/.test(c)) continue;
    freq[c] = (freq[c] ?? 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

type FreqTab = "words" | "chars";

/* ---------- component ---------- */
export default function CharacterCounterPlayground() {
  const [text, setText] = useState("");
  const [freqTab, setFreqTab] = useState<FreqTab>("words");

  const stats = useMemo(() => analyze(text), [text]);

  const freqItems = useMemo(
    () => (freqTab === "words" ? topWords(text) : topChars(text)),
    [text, freqTab]
  );
  const freqMax = freqItems[0]?.count ?? 1;

  const uniqueWords = useMemo(
    () => (text.trim() ? new Set(text.toLowerCase().match(/[a-zA-Z']+/g) ?? []).size : 0),
    [text]
  );

  const avgWordLen =
    stats.words > 0 ? (stats.charsNoSpaces / stats.words).toFixed(1) : "—";

  const handleClear = useCallback(() => setText(""), []);

  const STAT_ROWS = [
    { label: "Characters",   value: stats.chars.toLocaleString() },
    { label: "No Spaces",    value: stats.charsNoSpaces.toLocaleString() },
    { label: "Words",        value: stats.words.toLocaleString() },
    { label: "Unique Words", value: uniqueWords.toLocaleString() },
    { label: "Sentences",    value: stats.sentences.toLocaleString() },
    { label: "Paragraphs",   value: stats.paragraphs.toLocaleString() },
    { label: "Lines",        value: stats.lines.toLocaleString() },
    { label: "UTF-8 Bytes",  value: stats.bytes.toLocaleString() },
    { label: "Avg Word Len", value: avgWordLen },
    { label: "Reading Time", value: stats.readingTime },
  ];

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs text-navy/30 font-mono">
          {stats.chars.toLocaleString()} chars · {stats.words.toLocaleString()} words
        </span>
        <button
          onClick={handleClear}
          disabled={!text}
          className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40
            hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200
            cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Input ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
              Input Text
            </h3>
            <span className="text-[10px] text-navy/30 tabular-nums font-mono">
              {stats.bytes.toLocaleString()} bytes
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            rows={22}
            suppressHydrationWarning
            spellCheck={false}
            className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm
              text-navy font-mono leading-relaxed focus:outline-none focus:border-orange/50
              transition-colors resize-y placeholder:text-navy/20"
          />
        </div>

        {/* ── Stats + Frequency ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-5 bg-white/40 flex flex-col">

          {/* Stats grid */}
          <div>
            <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider mb-3">
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {STAT_ROWS.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2.5"
                >
                  <p className="text-[10px] text-navy/40 uppercase tracking-wider mb-0.5 font-mono">
                    {label}
                  </p>
                  <p className="text-lg font-bold text-navy font-mono leading-tight">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="flex-1 border border-navy/10 rounded-xl p-4 bg-navy/[0.02] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-navy/70 uppercase tracking-wider">
                Frequency
              </h3>
              <div className="flex rounded-lg border border-navy/10 overflow-hidden">
                {(["words", "chars"] as FreqTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFreqTab(t)}
                    className={`px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer capitalize ${
                      freqTab === t
                        ? "bg-navy text-white"
                        : "text-navy/40 hover:text-navy/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {freqItems.length > 0 ? (
              <div className="space-y-2">
                {freqItems.map(({ label, count }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span
                      className="w-14 shrink-0 text-right text-xs text-navy/60 font-mono truncate"
                      title={label}
                    >
                      {label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-navy/[0.07] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange/60 transition-all duration-300"
                        style={{ width: `${(count / freqMax) * 100}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[11px] text-navy/40 font-mono">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-xs text-navy/25 font-mono">
                  {text.trim() ? "No data" : "Type some text to see frequency"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
