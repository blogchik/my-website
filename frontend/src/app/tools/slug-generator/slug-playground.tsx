"use client";

import { useCallback, useMemo, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

const TRANSLITERATION: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae", ç: "c", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i", ð: "d", ñ: "n", ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
  ù: "u", ú: "u", û: "u", ü: "u", ý: "y", þ: "th", ÿ: "y", ß: "ss",
  ş: "sh", ğ: "g", ı: "i", ч: "ch", ш: "sh", щ: "shch", ъ: "", ь: "", а: "a", б: "b", в: "v",
  г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", э: "e",
  ю: "yu", я: "ya", ў: "o'", қ: "q", ҳ: "h", ғ: "g'"
};

function toSlug(input: string, separator: string, lowercase: boolean, maxLength: number): string {
  let slug = input.normalize("NFKD");
  slug = slug.replace(/./g, (ch) => TRANSLITERATION[ch.toLowerCase()] || ch);
  if (lowercase) slug = slug.toLowerCase();
  slug = slug.replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, separator).replace(new RegExp(`[${separator}]+`, "g"), separator).replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  if (maxLength > 0 && slug.length > maxLength) slug = slug.substring(0, maxLength).replace(new RegExp(`${separator}$`), "");
  return slug;
}

export default function SlugPlayground() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const slug = useMemo(() => {
    if (!input.trim()) return "";
    return toSlug(input, separator, lowercase, maxLength);
  }, [input, separator, lowercase, maxLength]);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!slug) return;
    await copyToClipboard(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [slug]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          <option value="-">- (hyphen)</option>
          <option value="_">_ (underscore)</option>
          <option value=".">. (dot)</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-navy/50 cursor-pointer">
          <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="rounded accent-orange" />
          Lowercase
        </label>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-navy/40">Max length:</label>
          <input type="number" min={0} max={200} value={maxLength} onChange={(e) => setMaxLength(Math.max(0, Number(e.target.value)))} placeholder="0 = no limit" className="w-20 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
        </div>
        <button onClick={() => { setInput(""); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Title / Text</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="My Amazing Blog Post Title! (ñ, ü, ö supported)" rows={4} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>

        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Slug</span>
            <button onClick={handleCopy} disabled={!slug} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer disabled:opacity-30">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono min-h-[6rem] break-all">{slug || <span className="text-navy/30">Slug will appear here…</span>}</div>
          {slug && (
            <div className="flex gap-4 text-xs text-navy/40">
              <span>{slug.length} characters</span>
              <span>{slug.split(separator).filter(Boolean).length} segments</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
