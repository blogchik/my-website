"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

const WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi","aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit","voluptate","velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum","ac","accumsan","adipisci","aliquam","ante","arcu","at","auctor","augue","bibendum","blandit","condimentum","congue","cras","curabitur","cursus","dapibus","diam","dictum","dignissim","donec","dui","efficitur","egestas","eget","eleifend","elementum","eros","eu","euismod","facilisi","facilisis","fames","faucibus","felis","fermentum","feugiat","finibus","fringilla","gravida","habitant","habitasse","hendrerit","iaculis","imperdiet","integer","interdum","justo","lacinia","lacus","laoreet","lectus","leo","libero","ligula","lobortis","luctus","maecenas","massa","mattis","mauris","maximus","metus","mi","morbi","nam","nec","neque","nibh","nisl","nunc","odio","orci","ornare","pellentesque","pharetra","phasellus","placerat","platea","porta","porttitor","posuere","praesent","pretium","proin","pulvinar","purus","rhoncus","risus","rutrum","sagittis","sapien","scelerisque","semper","sollicitudin","sodales","suscipit","suspendisse","tellus","tincidunt","tortor","tristique","turpis","ultrices","ultricies","urna","varius","vehicula","vel","vestibulum","vitae","vivamus","viverra","volutpat","vulputate"
];

function randomWord(): string { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

function generateSentence(minWords: number, maxWords: number): string {
  const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length: len }, () => randomWord());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(): string {
  const count = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, () => generateSentence(6, 15)).join(" ");
}

function generateWords(count: number): string {
  return Array.from({ length: count }, () => randomWord()).join(" ");
}

function generateSentences(count: number): string {
  return Array.from({ length: count }, () => generateSentence(6, 15)).join(" ");
}

function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => generateParagraph()).join("\n\n");
}

type Unit = "paragraphs" | "sentences" | "words";

export default function LoremPlayground() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let text = "";
    if (unit === "paragraphs") text = generateParagraphs(count);
    else if (unit === "sentences") text = generateSentences(count);
    else text = generateWords(count);
    if (startWithLorem) {
      text = "Lorem ipsum dolor sit amet, " + text.charAt(0).toLowerCase() + text.slice(1);
    }
    setOutput(text);
  }, [unit, count, startWithLorem]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
          {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
            <button key={u} onClick={() => setUnit(u)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer capitalize ${unit === u ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>{u}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-navy/40">Count:</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="w-16 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-navy/50 cursor-pointer">
          <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="rounded accent-orange" />
          Start with &ldquo;Lorem ipsum&rdquo;
        </label>
        <button onClick={generate} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Generate</button>
        <button onClick={() => setOutput("")} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="border border-navy/10 rounded-2xl p-5 bg-white/40">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Output</span>
          <button onClick={handleCopy} disabled={!output} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer disabled:opacity-30">{copied ? "✓ Copied" : "Copy"}</button>
        </div>
        {output ? (
          <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-4 py-3 text-sm text-navy leading-relaxed whitespace-pre-wrap max-h-[28rem] overflow-auto">{output}</div>
        ) : (
          <div className="bg-navy/[0.03] border border-navy/10 rounded-lg px-4 py-3 text-sm text-navy/30 min-h-[8rem] flex items-center justify-center">Click Generate to create placeholder text…</div>
        )}
      </div>

      {output && (
        <div className="mt-3 flex gap-4 text-xs text-navy/40">
          <span>{output.split(/\s+/).filter(Boolean).length} words</span>
          <span>{output.length.toLocaleString()} characters</span>
          <span>{output.split(/\n\n+/).filter(Boolean).length} paragraphs</span>
        </div>
      )}
    </div>
  );
}
