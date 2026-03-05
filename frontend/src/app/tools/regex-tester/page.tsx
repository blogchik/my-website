import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import RegexPlayground from "./regex-playground";

const tool = tools.find((t) => t.slug === "regex-tester")!;

export const metadata: Metadata = {
  title: tool.seo.title,
  description: tool.seo.description,
  keywords: tool.seo.keywords,
  alternates: { canonical: tool.seo.canonical ?? `/tools/${tool.slug}` },
  openGraph: { title: tool.seo.title, description: tool.seo.description, url: `/tools/${tool.slug}`, type: "website" },
  twitter: { card: "summary_large_image", title: tool.seo.title, description: tool.seo.description },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "WebApplication", name: tool.name, description: tool.seo.description,
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://abduroziq.uz"}/tools/${tool.slug}`,
  applicationCategory: "DeveloperApplication", operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Jabborov Abduroziq", url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://abduroziq.uz" },
};

const INFO_LEFT = [
  { title: ". (dot)", text: "Matches any single character except newline." },
  { title: "\\d, \\w, \\s", text: "Digit [0-9], word char [a-zA-Z0-9_], whitespace." },
  { title: "*, +, ?", text: "Zero+, one+, zero-or-one (quantifiers). Add ? for lazy." },
  { title: "{n,m}", text: "Match between n and m times." },
  { title: "^, $", text: "Start/end of line (with multiline flag) or string." },
  { title: "(group)", text: "Capture group. Use (?:...) for non-capturing." },
  { title: "[abc], [^abc]", text: "Character class. [^...] negates the set." },
  { title: "a|b", text: "Alternation — matches a or b." },
];

const INFO_RIGHT = [
  { title: "Email", text: "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$" },
  { title: "URL", text: "https?://[\\w.-]+(?:/[\\w./-]*)?" },
  { title: "IPv4", text: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}" },
  { title: "Date (YYYY-MM-DD)", text: "\\d{4}-\\d{2}-\\d{2}" },
  { title: "Hex color", text: "#[0-9a-fA-F]{3,8}" },
  { title: "Phone (US)", text: "+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}" },
];

export default function RegexTesterPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up" aria-label="Breadcrumb">
        <a href="/tools" className="hover:text-orange transition-colors duration-200">Tools Hub</a>
        <span>/</span><span className="text-navy/70">{tool.name}</span>
      </nav>
      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">{tool.name}</h1>
      <p className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Write a regular expression and test it against sample text in real time. See matches, capture groups, and match positions highlighted instantly.
      </p>
      <RegexPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Regex Quick Reference</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Common Patterns</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — <code className="text-xs bg-navy/[0.05] px-1 rounded">{i.text}</code></span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
