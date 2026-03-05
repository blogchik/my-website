"use client";

import { useCallback, useRef, useState } from "react";

export default function ImageCompressorPlayground() {
  const [original, setOriginal] = useState<{ url: string; size: number; name: string; width: number; height: number } | null>(null);
  const [compressed, setCompressed] = useState<{ url: string; size: number } | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/webp");
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginal({ url: e.target?.result as string, size: file.size, name: file.name, width: img.width, height: img.height });
        setCompressed(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const compress = useCallback(() => {
    if (!original) return;
    setProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = Math.round(h * (maxWidth / w)); w = maxWidth; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setProcessing(false); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL(format, quality / 100);
      const byteString = atob(dataUrl.split(",")[1]);
      setCompressed({ url: dataUrl, size: byteString.length });
      setProcessing(false);
    };
    img.src = original.url;
  }, [original, quality, maxWidth, format]);

  const download = useCallback(() => {
    if (!compressed || !original) return;
    const a = document.createElement("a");
    a.href = compressed.url;
    const ext = format === "image/webp" ? ".webp" : format === "image/jpeg" ? ".jpg" : ".png";
    a.download = original.name.replace(/\.[^.]+$/, "") + "-compressed" + ext;
    a.click();
  }, [compressed, original, format]);

  const fmtSize = (b: number) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(2) + " MB";

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={() => inputRef.current?.click()} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Choose Image</button>
        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
        <button onClick={() => { setOriginal(null); setCompressed(null); }} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      {!original && (
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleFile(f); }}
          className="border-2 border-dashed border-navy/10 rounded-2xl p-12 text-center text-navy/30 text-sm hover:border-orange/30 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          Drop an image here or click to browse
        </div>
      )}

      {original && (
        <>
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 mb-6 space-y-4">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Settings</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-navy/40 mb-1 block">Quality ({quality}%)</label>
                <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-orange" />
              </div>
              <div>
                <label className="text-xs text-navy/40 mb-1 block">Max Width</label>
                <input type="number" min={100} max={4096} value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              </div>
              <div>
                <label className="text-xs text-navy/40 mb-1 block">Format</label>
                <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy focus:outline-none cursor-pointer" suppressHydrationWarning>
                  <option value="image/webp">WebP</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>
            </div>
            <button onClick={compress} disabled={processing} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer disabled:opacity-50">{processing ? "Compressing…" : "Compress"}</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Original</span>
              <img src={original.url} alt="Original" className="w-full rounded-lg border border-navy/10 object-contain max-h-64" />
              <div className="flex gap-4 text-xs text-navy/40">
                <span>{fmtSize(original.size)}</span>
                <span>{original.width}×{original.height}</span>
              </div>
            </div>

            <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Result</span>
                {compressed && <button onClick={download} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">↓ Download</button>}
              </div>
              {compressed ? (
                <>
                  <img src={compressed.url} alt="Compressed" className="w-full rounded-lg border border-navy/10 object-contain max-h-64" />
                  <div className="flex gap-4 text-xs text-navy/40">
                    <span>{fmtSize(compressed.size)}</span>
                    <span className={compressed.size < original.size ? "text-green-600" : "text-red-600"}>
                      {compressed.size < original.size ? "−" : "+"}{Math.abs(Math.round((1 - compressed.size / original.size) * 100))}%
                    </span>
                    <span>Saved {fmtSize(Math.max(0, original.size - compressed.size))}</span>
                  </div>
                </>
              ) : (
                <div className="min-h-[16rem] flex items-center justify-center text-sm text-navy/30">Click Compress to see result</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
