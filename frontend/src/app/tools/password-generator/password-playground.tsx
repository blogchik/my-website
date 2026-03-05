"use client";

import { useCallback, useEffect, useState } from "react";

/* ---------- types ---------- */
interface CharTypes {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface HistoryEntry {
  id: string;
  password: string;
  length: number;
  types: CharTypes;
  entropy: number;
  createdAt: number;
}

type StrengthLevel = "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";

/* ---------- constants ---------- */
const CHARSET = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

const STRENGTH_CONFIG: { level: StrengthLevel; min: number; color: string; bar: string }[] = [
  { level: "Weak",        min: 0,  color: "text-red-500",   bar: "bg-red-400"  },
  { level: "Fair",        min: 40, color: "text-orange",    bar: "bg-orange"   },
  { level: "Good",        min: 56, color: "text-yellow-500",bar: "bg-yellow-400"},
  { level: "Strong",      min: 68, color: "text-lime-500",  bar: "bg-lime-400" },
  { level: "Very Strong", min: 80, color: "text-green-500", bar: "bg-green-500"},
];

const HISTORY_KEY = "pwd_gen_history";
const MAX_HISTORY = 10;

/* ---------- helpers ---------- */
function buildCharset(types: CharTypes): string {
  return (
    (types.uppercase ? CHARSET.uppercase : "") +
    (types.lowercase ? CHARSET.lowercase : "") +
    (types.numbers   ? CHARSET.numbers   : "") +
    (types.symbols   ? CHARSET.symbols   : "")
  );
}

function generatePassword(length: number, types: CharTypes): string {
  const charset = buildCharset(types);
  if (!charset) return "";

  // Guarantee at least one character from each enabled type
  const required: string[] = [];
  if (types.uppercase) required.push(randomChar(CHARSET.uppercase));
  if (types.lowercase) required.push(randomChar(CHARSET.lowercase));
  if (types.numbers)   required.push(randomChar(CHARSET.numbers));
  if (types.symbols)   required.push(randomChar(CHARSET.symbols));

  // Fill the rest randomly
  const rest = Array.from({ length: length - required.length }, () =>
    randomChar(charset)
  );

  // Shuffle the combined array
  const combined = [...required, ...rest];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(cryptoRandom() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

function randomChar(str: string): string {
  return str[Math.floor(cryptoRandom() * str.length)];
}

function cryptoRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

function calcEntropy(length: number, types: CharTypes): number {
  const charsetSize = buildCharset(types).length;
  if (!charsetSize) return 0;
  return Math.floor(length * Math.log2(charsetSize));
}

function getStrength(entropy: number): (typeof STRENGTH_CONFIG)[number] {
  for (let i = STRENGTH_CONFIG.length - 1; i >= 0; i--) {
    if (entropy >= STRENGTH_CONFIG[i].min) return STRENGTH_CONFIG[i];
  }
  return STRENGTH_CONFIG[0];
}

function strengthIndex(entropy: number): number {
  let idx = 0;
  for (let i = STRENGTH_CONFIG.length - 1; i >= 0; i--) {
    if (entropy >= STRENGTH_CONFIG[i].min) { idx = i; break; }
  }
  return idx;
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

/* ---------- icons ---------- */
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

/* ========== COMPONENT ========== */
export function PasswordPlayground() {
  const [length, setLength] = useState(16);
  const [types, setTypes] = useState<CharTypes>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [spinning, setSpinning] = useState(false);

  // Load history from cookie only on client to avoid SSR/client mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHistory(readHistory()); }, []);

  const atLeastOne = Object.values(types).some(Boolean);
  const entropy = password ? calcEntropy(length, types) : 0;
  const strength = getStrength(entropy);
  const sIdx = strengthIndex(entropy);

  const generate = useCallback(() => {
    if (!atLeastOne) return;
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);

    const pwd = generatePassword(length, types);
    setPassword(pwd);
    setCopied(false);

    const entry: HistoryEntry = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      password: pwd,
      length,
      types,
      entropy: calcEntropy(length, types),
      createdAt: Date.now(),
    };
    const updated = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    writeHistory(updated);
  }, [length, types, atLeastOne, history]);

  function toggleType(key: keyof CharTypes) {
    setTypes((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Prevent unchecking the last active type
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  }

  async function copyPassword() {
    if (!password) return;
    await copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function clearHistory() {
    setHistory([]);
    writeHistory([]);
  }

  const charTypeButtons: { key: keyof CharTypes; label: string; sample: string }[] = [
    { key: "uppercase", label: "Uppercase", sample: "A–Z" },
    { key: "lowercase", label: "Lowercase", sample: "a–z" },
    { key: "numbers",   label: "Numbers",   sample: "0–9" },
    { key: "symbols",   label: "Symbols",   sample: "!@#…" },
  ];

  return (
    <div className="animate-fade-up space-y-8" style={{ animationDelay: "0.2s" }}>
      {/* ── Two-column playground ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">

        {/* ── Left: Parameters ── */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-6 h-fit">
          <h3 className="text-xs font-medium text-navy/40 uppercase tracking-widest">
            Parameters
          </h3>

          {/* Length */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-navy/50 uppercase tracking-wider">
                Length
              </label>
              <span className="font-bold text-navy text-lg tabular-nums w-10 text-right">
                {length}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full bg-navy/10 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-orange
                [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(226,132,19,0.2)]
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-orange
                [&::-moz-range-thumb]:border-0"
            />
            <div className="flex justify-between text-[10px] text-navy/30 tabular-nums">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          {/* Character types */}
          <div className="space-y-2">
            <label className="text-xs text-navy/50 uppercase tracking-wider">
              Character Types
            </label>
            <div className="space-y-2">
              {charTypeButtons.map(({ key, label, sample }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleType(key)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 cursor-pointer ${
                    types[key]
                      ? "border-orange/50 bg-orange/5 text-navy"
                      : "border-navy/10 bg-transparent text-navy/40 hover:border-navy/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                      types[key] ? "bg-orange border-orange" : "border-navy/20"
                    }`}>
                      {types[key] && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="font-medium">{label}</span>
                  </div>
                  <code className="text-xs opacity-50">{sample}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!atLeastOne}
            className="group/gen w-full bg-orange text-navy font-bold text-sm px-6 py-2.5 rounded-lg
              hover:shadow-lg hover:shadow-orange/25 hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
              transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <ShieldIcon className={`transition-transform duration-500 ${spinning ? "rotate-[360deg]" : ""}`} />
            Generate Password
          </button>
        </div>

        {/* ── Right: Output ── */}
        <div className="flex flex-col gap-4">
          {password ? (
            <>
              {/* Password display */}
              <div className="border border-navy/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between bg-navy/[0.03] px-4 py-3 border-b border-navy/10">
                  <span className="text-xs text-navy/50 uppercase tracking-wider">
                    Generated Password
                  </span>
                  <button
                    onClick={copyPassword}
                    className="inline-flex items-center gap-1.5 text-xs text-navy/50 hover:text-orange transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div
                  className="px-5 py-6 cursor-pointer group"
                  onClick={copyPassword}
                  title="Click to copy"
                >
                  <code className="block font-mono text-navy/90 break-all leading-relaxed text-sm md:text-base select-all group-hover:text-orange transition-colors duration-200">
                    {password}
                  </code>
                </div>
              </div>

              {/* Strength meter */}
              <div className="border border-navy/10 rounded-2xl px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-navy/50 uppercase tracking-wider">
                    Strength
                  </span>
                  <span className={`text-sm font-bold ${strength.color}`}>
                    {password ? strength.level : "—"}
                  </span>
                </div>

                {/* Bar segments */}
                <div className="flex gap-1.5">
                  {STRENGTH_CONFIG.map((s, i) => (
                    <div
                      key={s.level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        password && i <= sIdx ? s.bar : "bg-navy/10"
                      }`}
                    />
                  ))}
                </div>

                {/* Entropy info */}
                <div className="flex items-center justify-between text-xs text-navy/40">
                  <span>
                    {entropy} bits entropy
                  </span>
                  <span>
                    Charset: {buildCharset(types).length} chars
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-dashed border-navy/10 rounded-2xl flex-1 min-h-[280px] flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-4 opacity-30">🔒</span>
              <p className="text-sm text-navy/40">
                Click <strong className="text-navy/60">Generate Password</strong> to start
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
              Recent Passwords
            </h2>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-navy/40 hover:text-red-500 transition-colors cursor-pointer"
            >
              <TrashIcon />
              <span>Clear</span>
            </button>
          </div>

          <div className="space-y-2">
            {history.map((entry) => {
              const s = getStrength(entry.entropy);
              const sI = strengthIndex(entry.entropy);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between border border-navy/10 rounded-xl px-4 py-3 gap-4 hover:bg-navy/[0.02] transition-colors group"
                >
                  <code className="text-xs font-mono text-navy/60 break-all select-all flex-1">
                    {entry.password}
                  </code>
                  <div className="shrink-0 flex items-center gap-3">
                    {/* Mini strength bar */}
                    <div className="hidden sm:flex gap-0.5">
                      {STRENGTH_CONFIG.map((sc, i) => (
                        <div
                          key={sc.level}
                          className={`h-1 w-3 rounded-full ${
                            i <= sI ? sc.bar : "bg-navy/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${s.color}`}>
                      {s.level}
                    </span>
                    <span className="text-[10px] text-navy/30 tabular-nums">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
