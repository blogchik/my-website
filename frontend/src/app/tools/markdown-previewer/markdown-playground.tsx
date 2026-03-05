"use client";

import { useCallback, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

// Minimal pure-JS markdown → HTML converter
function markdownToHtml(md: string): string {
  let html = md;
  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code class="lang-${lang || "text"}">${escapeHtml(code.trimEnd())}</code></pre>`);
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  // Horizontal rule
  html = html.replace(/^---+$/gm, "<hr>");
  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin:8px 0">');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#E28413;text-decoration:underline">$1</a>');
  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  // Unordered lists
  html = html.replace(/^[-*+]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  // Checkboxes
  html = html.replace(/<li>\[x\]\s*/gi, '<li style="list-style:none"><input type="checkbox" checked disabled> ');
  html = html.replace(/<li>\[\s\]\s*/gi, '<li style="list-style:none"><input type="checkbox" disabled> ');
  // Paragraphs
  html = html.replace(/\n\n+/g, "\n</p><p>\n");
  html = "<p>" + html + "</p>";
  html = html.replace(/<p>\s*(<h[1-6]|<pre|<ul|<ol|<hr|<blockquote)/g, "$1");
  html = html.replace(/(<\/h[1-6]>|<\/pre>|<\/ul>|<\/ol>|<hr>|<\/blockquote>)\s*<\/p>/g, "$1");
  // Line breaks
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/<br><br>/g, "");
  return html;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const SAMPLE_MD = `# Markdown Previewer

## Features
- **Bold text** and *italic text*
- ~~Strikethrough~~ and \`inline code\`
- [Links](https://example.com) work too

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote

---

1. Ordered lists
2. Work as well

- [x] Completed task
- [ ] Pending task
`;

export default function MarkdownPlayground() {
  const [markdown, setMarkdown] = useState(SAMPLE_MD);
  const [copied, setCopied] = useState<"md" | "html" | null>(null);

  const html = markdownToHtml(markdown);

  const handleCopy = useCallback(async (text: string, type: "md" | "html") => {
    await copyToClipboard(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Write markdown on the left — preview updates live</span>
        <button onClick={() => setMarkdown("")} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Markdown</span>
            <button onClick={() => handleCopy(markdown, "md")} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied === "md" ? "✓ Copied" : "Copy MD"}</button>
          </div>
          <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} rows={20} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors resize-none" spellCheck={false} suppressHydrationWarning />
        </div>

        <div className="border border-navy/10 rounded-2xl p-5 space-y-3 bg-white/40">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-navy/70 uppercase tracking-wider">Preview</span>
            <button onClick={() => handleCopy(html, "html")} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied === "html" ? "✓ Copied" : "Copy HTML"}</button>
          </div>
          <div
            className="bg-navy/[0.03] border border-navy/10 rounded-lg px-4 py-3 text-sm text-navy leading-relaxed overflow-auto max-h-[32rem] prose-sm"
            style={{ fontFamily: "inherit" }}
            dangerouslySetInnerHTML={{
              __html: `<style>
                .md-preview h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; }
                .md-preview h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0; }
                .md-preview h3 { font-size: 1.15em; font-weight: 700; margin: 0.4em 0; }
                .md-preview pre { background: rgba(0,0,34,0.04); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; }
                .md-preview code { font-family: monospace; background: rgba(0,0,34,0.06); padding: 1px 4px; border-radius: 4px; font-size: 0.9em; }
                .md-preview pre code { background: none; padding: 0; }
                .md-preview blockquote { border-left: 3px solid #E28413; padding-left: 12px; color: rgba(0,0,34,0.6); margin: 8px 0; }
                .md-preview ul, .md-preview ol { padding-left: 1.5em; margin: 4px 0; }
                .md-preview li { margin: 2px 0; }
                .md-preview hr { border: none; border-top: 1px solid rgba(0,0,34,0.1); margin: 12px 0; }
                .md-preview strong { font-weight: 700; }
                .md-preview del { opacity: 0.5; }
                .md-preview p { margin: 4px 0; }
              </style><div class="md-preview">${html}</div>`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-xs text-navy/40">
        <span>{markdown.split("\n").length} lines</span>
        <span>{markdown.length.toLocaleString()} characters</span>
        <span>{markdown.split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  );
}
