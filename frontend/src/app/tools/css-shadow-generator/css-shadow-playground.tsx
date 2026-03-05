"use client";

import { useCallback, useEffect, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface ShadowState {
  offsetX: number; offsetY: number; blur: number; spread: number;
  color: string; opacity: number; inset: boolean;
}

const defaultShadow: ShadowState = { offsetX: 4, offsetY: 4, blur: 16, spread: 0, color: "#000022", opacity: 15, inset: false };

function toShadowString(s: ShadowState): string {
  const r = parseInt(s.color.slice(1, 3), 16);
  const g = parseInt(s.color.slice(3, 5), 16);
  const b = parseInt(s.color.slice(5, 7), 16);
  const a = (s.opacity / 100).toFixed(2);
  return `${s.inset ? "inset " : ""}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function CssShadowPlayground() {
  const [shadow, setShadow] = useState<ShadowState>(defaultShadow);
  const [borderRadius, setBorderRadius] = useState(16);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [boxBg, setBoxBg] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const [cssOutput, setCssOutput] = useState("");

  useEffect(() => {
    const lines = [
      `box-shadow: ${toShadowString(shadow)};`,
      `border-radius: ${borderRadius}px;`,
    ];
    setCssOutput(lines.join("\n"));
  }, [shadow, borderRadius]);

  const update = useCallback(<K extends keyof ShadowState>(key: K, value: ShadowState[K]) => {
    setShadow((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [cssOutput]);

  const sliders: { label: string; key: keyof ShadowState; min: number; max: number; unit: string }[] = [
    { label: "Offset X", key: "offsetX", min: -50, max: 50, unit: "px" },
    { label: "Offset Y", key: "offsetY", min: -50, max: 50, unit: "px" },
    { label: "Blur", key: "blur", min: 0, max: 100, unit: "px" },
    { label: "Spread", key: "spread", min: -50, max: 50, unit: "px" },
    { label: "Opacity", key: "opacity", min: 0, max: 100, unit: "%" },
  ];

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Adjust sliders — preview updates live</span>
        <button onClick={() => { setShadow(defaultShadow); setBorderRadius(16); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Reset</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-4 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Controls</label>

          {sliders.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <span className="text-xs text-navy/50 w-20 shrink-0">{s.label}</span>
              <input type="range" min={s.min} max={s.max} value={shadow[s.key] as number} onChange={(e) => update(s.key, Number(e.target.value) as never)} className="flex-1 accent-orange" />
              <span className="text-xs font-mono text-navy/40 w-12 text-right">{shadow[s.key] as number}{s.unit}</span>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <span className="text-xs text-navy/50 w-20 shrink-0">Radius</span>
            <input type="range" min={0} max={100} value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="flex-1 accent-orange" />
            <span className="text-xs font-mono text-navy/40 w-12 text-right">{borderRadius}px</span>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy/50">Shadow color</label>
              <input type="color" value={shadow.color} onChange={(e) => update("color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-navy/10" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy/50">Box BG</label>
              <input type="color" value={boxBg} onChange={(e) => setBoxBg(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-navy/10" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-navy/50">Canvas</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-navy/10" />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-navy/50 cursor-pointer ml-auto">
              <input type="checkbox" checked={shadow.inset} onChange={(e) => update("inset", e.target.checked)} className="accent-orange" />
              Inset
            </label>
          </div>
        </div>

        {/* Preview + CSS */}
        <div className="space-y-4">
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider mb-4 block">Preview</label>
            <div className="rounded-xl p-8 flex items-center justify-center min-h-[16rem] transition-colors" style={{ backgroundColor: bgColor }}>
              <div className="w-40 h-40 transition-all duration-200" style={{ backgroundColor: boxBg, boxShadow: toShadowString(shadow), borderRadius: `${borderRadius}px` }} />
            </div>
          </div>

          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">CSS Output</span>
              <button onClick={handleCopy} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
            </div>
            <pre className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono whitespace-pre-wrap">{cssOutput}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
