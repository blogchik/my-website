"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface MetaTags {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  type: string;
  twitterCard: string;
  twitterSite: string;
}

const defaultTags: MetaTags = {
  title: "My Awesome Page",
  description: "A brief description of the page content that will appear in search results and social share cards.",
  image: "https://placehold.co/1200x630/000022/E28413?text=OG+Image",
  url: "https://example.com/page",
  siteName: "Example Site",
  type: "website",
  twitterCard: "summary_large_image",
  twitterSite: "@example",
};

function generateMetaTags(tags: MetaTags): string {
  return `<!-- Primary Meta Tags -->
<title>${tags.title}</title>
<meta name="title" content="${tags.title}">
<meta name="description" content="${tags.description}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${tags.type}">
<meta property="og:url" content="${tags.url}">
<meta property="og:title" content="${tags.title}">
<meta property="og:description" content="${tags.description}">
<meta property="og:image" content="${tags.image}">
<meta property="og:site_name" content="${tags.siteName}">

<!-- Twitter -->
<meta property="twitter:card" content="${tags.twitterCard}">
<meta property="twitter:url" content="${tags.url}">
<meta property="twitter:title" content="${tags.title}">
<meta property="twitter:description" content="${tags.description}">
<meta property="twitter:image" content="${tags.image}">
<meta property="twitter:site" content="${tags.twitterSite}">`;
}

export default function OgPreviewPlayground() {
  const [tags, setTags] = useState<MetaTags>(defaultTags);
  const [activePreview, setActivePreview] = useState<"google" | "twitter" | "facebook" | "linkedin">("google");
  const [copied, setCopied] = useState(false);

  const update = useCallback(<K extends keyof MetaTags>(key: K, value: string) => {
    setTags((prev) => ({ ...prev, [key]: value }));
  }, []);

  const metaHtml = generateMetaTags(tags);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(metaHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [metaHtml]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Edit meta tags — preview updates live</span>
        <button onClick={() => setTags(defaultTags)} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Reset</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Meta Tags</label>
          {[
            { key: "title" as const, label: "Title", maxLen: 60 },
            { key: "description" as const, label: "Description", maxLen: 160 },
            { key: "image" as const, label: "Image URL", maxLen: 0 },
            { key: "url" as const, label: "Page URL", maxLen: 0 },
            { key: "siteName" as const, label: "Site Name", maxLen: 0 },
          ].map((f) => (
            <div key={f.key}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-navy/50">{f.label}</label>
                {f.maxLen > 0 && <span className={`text-[10px] ${tags[f.key].length > f.maxLen ? "text-red-500" : "text-navy/30"}`}>{tags[f.key].length}/{f.maxLen}</span>}
              </div>
              {f.key === "description" ? (
                <textarea value={tags[f.key]} onChange={(e) => update(f.key, e.target.value)} rows={3} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50 resize-none" spellCheck={false} suppressHydrationWarning />
              ) : (
                <input type="text" value={tags[f.key]} onChange={(e) => update(f.key, e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-navy/50 block mb-1">Type</label>
              <select value={tags.type} onChange={(e) => update("type", e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2 text-xs font-mono text-navy focus:outline-none cursor-pointer" suppressHydrationWarning>
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
                <option value="profile">profile</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-navy/50 block mb-1">Twitter Card</label>
              <select value={tags.twitterCard} onChange={(e) => update("twitterCard", e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2 text-xs font-mono text-navy focus:outline-none cursor-pointer" suppressHydrationWarning>
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-navy/50 block mb-1">Twitter @handle</label>
            <input type="text" value={tags.twitterSite} onChange={(e) => update("twitterSite", e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
            {(["google", "twitter", "facebook", "linkedin"] as const).map((p) => (
              <button key={p} onClick={() => setActivePreview(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer capitalize ${activePreview === p ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>{p}</button>
            ))}
          </div>

          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40">
            {activePreview === "google" && (
              <div className="max-w-lg">
                <div className="text-xs text-green-700 font-mono mb-1 truncate">{tags.url || "https://example.com"}</div>
                <div className="text-[#1a0dab] text-lg leading-snug mb-1 truncate hover:underline cursor-pointer">{tags.title || "Page Title"}</div>
                <div className="text-xs text-[#545454] leading-relaxed line-clamp-2">{tags.description || "Page description"}</div>
              </div>
            )}

            {activePreview === "twitter" && (
              <div className="rounded-xl border border-gray-200 overflow-hidden max-w-md bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {tags.image && <div className="aspect-[2/1] bg-gray-100"><img src={tags.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
                <div className="p-3">
                  <div className="text-sm font-bold text-gray-900 truncate">{tags.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{tags.description}</div>
                  <div className="text-xs text-gray-400 mt-1.5">{new URL(tags.url || "https://example.com").hostname}</div>
                </div>
              </div>
            )}

            {activePreview === "facebook" && (
              <div className="border border-gray-200 overflow-hidden max-w-md bg-[#f0f2f5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {tags.image && <div className="aspect-[1.91/1] bg-gray-200"><img src={tags.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
                <div className="p-3 bg-[#f0f2f5]">
                  <div className="text-[10px] text-gray-500 uppercase">{new URL(tags.url || "https://example.com").hostname}</div>
                  <div className="text-sm font-bold text-[#1d2129] mt-0.5 truncate">{tags.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{tags.description}</div>
                </div>
              </div>
            )}

            {activePreview === "linkedin" && (
              <div className="border border-gray-200 rounded-lg overflow-hidden max-w-md bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {tags.image && <div className="aspect-[1.91/1] bg-gray-100"><img src={tags.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900 truncate">{tags.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{new URL(tags.url || "https://example.com").hostname}</div>
                </div>
              </div>
            )}
          </div>

          {/* HTML Output */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">HTML</span>
              <button onClick={handleCopy} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
            </div>
            <pre className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-[11px] font-mono text-navy whitespace-pre-wrap overflow-auto max-h-[16rem]">{metaHtml}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
