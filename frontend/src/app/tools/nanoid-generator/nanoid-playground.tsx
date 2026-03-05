"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

const DEFAULT_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
const PRESET_ALPHABETS: { label: string; value: string }[] = [
  { label: "Default (A-Za-z0-9_-)", value: DEFAULT_ALPHABET },
  { label: "Alphanumeric only", value: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" },
  { label: "Lowercase + digits", value: "0123456789abcdefghijklmnopqrstuvwxyz" },
  { label: "Hex", value: "0123456789abcdef" },
  { label: "Numbers only", value: "0123456789" },
  { label: "URL-safe (no look-alike)", value: "2346789ABCDEFGHJKLMNPQRTUVWXYZabcdefghjkmnpqrtvwxyz" },
];

function generateNanoid(size: number, alphabet: string): string {
  const values = new Uint8Array(size);
  crypto.getRandomValues(values);
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  let id = "";
  let i = 0;
  while (id.length < size) {
    id += alphabet[values[i % values.length] & mask] || "";
    i++;
    if (i >= values.length) { crypto.getRandomValues(values); i = 0; }
  }
  return id.slice(0, size);
}

export default function NanoidPlayground() {
  const [length, setLength] = useState(21);
  const [alphabet, setAlphabet] = useState(DEFAULT_ALPHABET);
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = useCallback(() => {
    const newIds = Array.from({ length: count }, () => generateNanoid(length, alphabet));
    setIds(newIds);
  }, [length, alphabet, count]);

  const handleCopyOne = useCallback(async (text: string, idx: number) => {
    await copyToClipboard(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);

  const handleCopyAll = useCallback(async () => {
    await copyToClipboard(ids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }, [ids]);

  // Collision probability estimate
  const totalCombinations = Math.pow(alphabet.length, length);
  const bitsOfEntropy = Math.log2(totalCombinations);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={generate} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Generate</button>
        <button onClick={() => setIds([])} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-4">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Settings</label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-navy/50 w-20 shrink-0">Length</span>
            <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="flex-1 accent-orange" />
            <input type="number" min={4} max={128} value={length} onChange={(e) => setLength(Math.max(4, Math.min(128, Number(e.target.value))))} className="w-14 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-navy/50 w-20 shrink-0">Count</span>
            <input type="range" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} className="flex-1 accent-orange" />
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="w-14 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
          </div>

          <div>
            <label className="text-xs text-navy/50 block mb-1.5">Alphabet preset</label>
            <select value={PRESET_ALPHABETS.find((p) => p.value === alphabet) ? alphabet : "custom"} onChange={(e) => { if (e.target.value !== "custom") setAlphabet(e.target.value); }} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
              {PRESET_ALPHABETS.map((p) => <option key={p.label} value={p.value}>{p.label}</option>)}
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-navy/50 block mb-1.5">Alphabet ({alphabet.length} chars)</label>
            <input type="text" value={alphabet} onChange={(e) => e.target.value.length >= 2 && setAlphabet(e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50 break-all" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
              <div className="text-[10px] text-navy/40 uppercase">Entropy</div>
              <div className="font-mono text-sm text-navy">{bitsOfEntropy.toFixed(1)} bits</div>
            </div>
            <div className="rounded-lg bg-navy/[0.03] border border-navy/10 px-3 py-2 text-center">
              <div className="text-[10px] text-navy/40 uppercase">Alphabet</div>
              <div className="font-mono text-sm text-navy">{alphabet.length} chars</div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Generated IDs</span>
            {ids.length > 0 && <button onClick={handleCopyAll} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copiedAll ? "✓ All copied" : "Copy all"}</button>}
          </div>
          {ids.length > 0 ? (
            <div className="space-y-1.5 max-h-[28rem] overflow-auto">
              {ids.map((id, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-navy/[0.02] hover:bg-navy/[0.04] transition-colors group">
                  <span className="text-[10px] text-navy/25 w-5 shrink-0">{i + 1}</span>
                  <span className="font-mono text-sm text-navy break-all flex-1">{id}</span>
                  <button onClick={() => handleCopyOne(id, i)} className="text-[10px] text-navy/20 group-hover:text-orange transition-colors cursor-pointer shrink-0">{copiedIdx === i ? "✓" : "Copy"}</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[16rem] flex items-center justify-center text-sm text-navy/30">Click Generate to create IDs</div>
          )}
        </div>
      </div>
    </div>
  );
}
