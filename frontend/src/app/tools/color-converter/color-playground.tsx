"use client";

import { useCallback, useEffect, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function rgbToHex(r: number, g: number, b: number): string { return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""); }
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q-p)*6*t; if (t < 1/2) return q; if (t < 2/3) return p + (q-p)*(2/3-t)*6; return p; };
  const q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
  return [Math.round(hue2rgb(p,q,h+1/3)*255), Math.round(hue2rgb(p,q,h)*255), Math.round(hue2rgb(p,q,h-1/3)*255)];
}
function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
  return 0.2126*rs + 0.7152*gs + 0.0722*bs;
}
function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = luminance(...rgb1), l2 = luminance(...rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export default function ColorPlayground() {
  const [hex, setHex] = useState("#E28413");
  const [rgb, setRgb] = useState<[number, number, number]>([226, 132, 19]);
  const [hsl, setHsl] = useState<[number, number, number]>([33, 84, 48]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const parsed = hexToRgb(hex);
    if (parsed) { setRgb(parsed); setHsl(rgbToHsl(...parsed)); }
  }, [hex]);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb([r, g, b]);
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl([h, s, l]);
    const [r, g, b] = hslToRgb(h, s, l);
    setRgb([r, g, b]);
    setHex(rgbToHex(r, g, b));
  }, []);

  const handleCopy = useCallback(async (text: string, field: string) => {
    await copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }, []);

  const contrastWhite = contrastRatio(rgb, [255, 255, 255]);
  const contrastBlack = contrastRatio(rgb, [0, 0, 0]);
  const hexStr = hex.toUpperCase();
  const rgbStr = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  const hslStr = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-navy/40">Edit any format — all others update live</span>
        <button onClick={() => { setHex("#E28413"); updateFromRgb(226, 132, 19); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Reset</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color preview + picker */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-4 bg-white/40">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Preview</label>
          <div className="rounded-xl h-32 border border-navy/10 transition-colors" style={{ backgroundColor: hexStr }} />
          <div className="flex items-center gap-3">
            <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-navy/10" />
            <input type="text" value={hexStr} onChange={(e) => { const v = e.target.value; if (/^#?[0-9a-fA-F]{0,6}$/.test(v)) setHex(v.startsWith("#") ? v : "#" + v); }} className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm font-mono text-navy focus:outline-none focus:border-orange/50" />
          </div>

          {/* Contrast info */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-lg border border-navy/10 p-3 text-center" style={{ backgroundColor: hexStr, color: "#ffffff" }}>
              <div className="text-xs font-bold">White text</div>
              <div className="text-lg font-mono mt-1">{contrastWhite.toFixed(2)}:1</div>
              <div className="text-[10px] mt-0.5">{contrastWhite >= 4.5 ? "✓ AA" : contrastWhite >= 3 ? "~ AA Large" : "✗ Fail"}</div>
            </div>
            <div className="rounded-lg border border-navy/10 p-3 text-center" style={{ backgroundColor: hexStr, color: "#000000" }}>
              <div className="text-xs font-bold">Black text</div>
              <div className="text-lg font-mono mt-1">{contrastBlack.toFixed(2)}:1</div>
              <div className="text-[10px] mt-0.5">{contrastBlack >= 4.5 ? "✓ AA" : contrastBlack >= 3 ? "~ AA Large" : "✗ Fail"}</div>
            </div>
          </div>
        </div>

        {/* Format controls */}
        <div className="space-y-4">
          {/* HEX */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">HEX</span>
              <button onClick={() => handleCopy(hexStr, "hex")} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copiedField === "hex" ? "✓" : "Copy"}</button>
            </div>
            <div className="font-mono text-sm text-navy bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2">{hexStr}</div>
          </div>

          {/* RGB */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">RGB</span>
              <button onClick={() => handleCopy(rgbStr, "rgb")} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copiedField === "rgb" ? "✓" : "Copy"}</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["R", "G", "B"] as const).map((ch, i) => (
                <div key={ch}>
                  <label className="text-[10px] text-navy/40 uppercase">{ch}</label>
                  <input type="number" min={0} max={255} value={rgb[i]} onChange={(e) => { const v = Math.max(0, Math.min(255, Number(e.target.value))); const next: [number, number, number] = [...rgb]; next[i] = v; updateFromRgb(...next); }} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
                </div>
              ))}
            </div>
            <div className="font-mono text-xs text-navy/50">{rgbStr}</div>
          </div>

          {/* HSL */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">HSL</span>
              <button onClick={() => handleCopy(hslStr, "hsl")} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copiedField === "hsl" ? "✓" : "Copy"}</button>
            </div>
            <div className="space-y-2">
              {[{ label: "H", value: hsl[0], max: 360 }, { label: "S", value: hsl[1], max: 100 }, { label: "L", value: hsl[2], max: 100 }].map((item, i) => (
                <div key={item.label} className="flex items-center gap-2">
                  <label className="text-[10px] text-navy/40 uppercase w-3">{item.label}</label>
                  <input type="range" min={0} max={item.max} value={item.value} onChange={(e) => { const v = Number(e.target.value); const next: [number, number, number] = [...hsl]; next[i] = v; updateFromHsl(...next); }} className="flex-1 accent-orange" />
                  <span className="font-mono text-xs text-navy/50 w-10 text-right">{item.value}{i > 0 ? "%" : "°"}</span>
                </div>
              ))}
            </div>
            <div className="font-mono text-xs text-navy/50">{hslStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
