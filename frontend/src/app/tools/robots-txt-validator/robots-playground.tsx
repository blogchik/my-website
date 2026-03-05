"use client";

import { useCallback, useEffect, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface RobotRule { type: "user-agent" | "allow" | "disallow" | "sitemap" | "crawl-delay" | "comment" | "unknown"; value: string; line: number; error?: string }

function parseRobotsTxt(content: string): RobotRule[] {
  const lines = content.split("\n");
  const rules: RobotRule[] = [];
  let hasUserAgent = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw || raw.startsWith("#")) {
      if (raw.startsWith("#")) rules.push({ type: "comment", value: raw, line: i + 1 });
      continue;
    }
    const colonIdx = raw.indexOf(":");
    if (colonIdx === -1) { rules.push({ type: "unknown", value: raw, line: i + 1, error: "Invalid syntax: missing colon" }); continue; }
    const directive = raw.substring(0, colonIdx).trim().toLowerCase();
    const value = raw.substring(colonIdx + 1).trim();
    switch (directive) {
      case "user-agent": hasUserAgent = true; rules.push({ type: "user-agent", value, line: i + 1, error: !value ? "User-agent value is empty" : undefined }); break;
      case "allow": rules.push({ type: "allow", value, line: i + 1, error: !hasUserAgent ? "Allow without preceding User-agent" : undefined }); break;
      case "disallow": rules.push({ type: "disallow", value, line: i + 1, error: !hasUserAgent ? "Disallow without preceding User-agent" : undefined }); break;
      case "sitemap": rules.push({ type: "sitemap", value, line: i + 1, error: !value.startsWith("http") ? "Sitemap should be a full URL" : undefined }); break;
      case "crawl-delay": rules.push({ type: "crawl-delay", value, line: i + 1, error: isNaN(Number(value)) ? "Crawl-delay must be a number" : undefined }); break;
      default: rules.push({ type: "unknown", value: raw, line: i + 1, error: `Unknown directive: "${directive}"` });
    }
  }
  if (!hasUserAgent && content.trim()) rules.unshift({ type: "unknown", value: "", line: 0, error: "No User-agent directive found" });
  return rules;
}

function testUrl(content: string, testPath: string, userAgent: string): { allowed: boolean; matchedRule: string | null } {
  const lines = content.split("\n");
  let inBlock = false;
  let allowed = true;
  let matchedRule: string | null = null;
  let bestMatchLen = -1;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const directive = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();
    if (directive === "user-agent") {
      inBlock = value === "*" || value.toLowerCase() === userAgent.toLowerCase();
      continue;
    }
    if (!inBlock) continue;
    if (directive === "disallow" || directive === "allow") {
      if (!value && directive === "disallow") continue;
      const pattern = value.replace(/\*/g, ".*").replace(/\$/g, "$");
      try {
        if (new RegExp("^" + pattern).test(testPath) && value.length > bestMatchLen) {
          bestMatchLen = value.length;
          allowed = directive === "allow";
          matchedRule = line;
        }
      } catch { /* invalid regex */ }
    }
  }
  return { allowed, matchedRule };
}

const SAMPLE = `# Robots.txt for example.com
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Crawl-delay: 10

User-agent: Googlebot
Allow: /api/public/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml`;

export default function RobotsPlayground() {
  const [content, setContent] = useState(SAMPLE);
  const [rules, setRules] = useState<RobotRule[]>([]);
  const [testPath, setTestPath] = useState("/admin/dashboard");
  const [testAgent, setTestAgent] = useState("*");
  const [testResult, setTestResult] = useState<{ allowed: boolean; matchedRule: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setRules(parseRobotsTxt(content)); }, [content]);

  const handleTest = useCallback(() => {
    setTestResult(testUrl(content, testPath, testAgent));
  }, [content, testPath, testAgent]);

  const errors = rules.filter((r) => r.error);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Validate robots.txt syntax and test URL paths</span>
        <button onClick={() => setContent("")} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">robots.txt</span>
            <button onClick={async () => { await copyToClipboard(content); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          {/* URL Tester */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">URL Tester</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-navy/40 uppercase block mb-1">Path</label>
                <input type="text" value={testPath} onChange={(e) => setTestPath(e.target.value)} placeholder="/some/path" className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              </div>
              <div>
                <label className="text-[10px] text-navy/40 uppercase block mb-1">User-Agent</label>
                <input type="text" value={testAgent} onChange={(e) => setTestAgent(e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:border-orange/50" />
              </div>
            </div>
            <button onClick={handleTest} className="px-4 py-1.5 rounded-xl bg-orange text-white text-xs font-medium hover:bg-orange/90 transition-colors cursor-pointer">Test URL</button>
            {testResult && (
              <div className={`rounded-lg border px-3 py-2.5 text-xs ${testResult.allowed ? "border-green-200 bg-green-50/60 text-green-700" : "border-red-200 bg-red-50/60 text-red-700"}`}>
                <strong>{testResult.allowed ? "✓ Allowed" : "✗ Blocked"}</strong>
                {testResult.matchedRule && <span className="ml-2 font-mono opacity-70">→ {testResult.matchedRule}</span>}
              </div>
            )}
          </div>

          {/* Validation */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Validation ({errors.length} {errors.length === 1 ? "issue" : "issues"})</label>
            {errors.length > 0 ? (
              <div className="space-y-1.5 max-h-[12rem] overflow-auto">
                {errors.map((e, i) => (
                  <div key={i} className="rounded-lg border border-yellow-200 bg-yellow-50/60 px-3 py-2 text-xs text-yellow-700">
                    <span className="font-mono">Line {e.line}:</span> {e.error}
                  </div>
                ))}
              </div>
            ) : content.trim() ? (
              <div className="rounded-lg border border-green-200 bg-green-50/60 px-3 py-2 text-xs text-green-600">✓ No issues found</div>
            ) : null}
          </div>

          {/* Parsed rules */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Parsed Rules ({rules.filter((r) => r.type !== "comment").length})</label>
            <div className="space-y-1 max-h-[12rem] overflow-auto">
              {rules.filter((r) => r.type !== "comment").map((r, i) => (
                <div key={i} className="flex items-center gap-2 py-1 px-2 rounded text-xs font-mono">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.type === "user-agent" ? "bg-blue-100 text-blue-700" : r.type === "allow" ? "bg-green-100 text-green-700" : r.type === "disallow" ? "bg-red-100 text-red-700" : r.type === "sitemap" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{r.type}</span>
                  <span className="text-navy/60 truncate">{r.value}</span>
                  <span className="text-navy/20 ml-auto shrink-0">L{r.line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
