import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import YamlPlayground from "./yaml-playground";

const tool = tools.find((t) => t.slug === "json-yaml")!;

export const metadata: Metadata = {
  title: tool.seo.title,
  description: tool.seo.description,
  keywords: tool.seo.keywords,
  alternates: {
    canonical: tool.seo.canonical ?? `/tools/${tool.slug}`,
  },
  openGraph: {
    title: tool.seo.title,
    description: tool.seo.description,
    url: `/tools/${tool.slug}`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: tool.seo.title,
    description: tool.seo.description,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: tool.name,
  description: tool.seo.description,
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://abduroziq.uz"}/tools/${tool.slug}`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: {
    "@type": "Person",
    name: "Jabborov Abduroziq",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://abduroziq.uz",
  },
};

const YAML_TIPS = [
  {
    title: "Indentation matters",
    text: "YAML uses spaces (never tabs) for indentation. Mixing indent sizes will cause parse errors.",
  },
  {
    title: "Strings don't need quotes",
    text: 'Unquoted strings are valid: name: Abu. Use quotes only when the value contains special characters like : { } [ ].',
  },
  {
    title: "Multiline strings",
    text: "Use | for literal block (preserves newlines) or > for folded block (newlines become spaces).",
  },
  {
    title: "Comments",
    text: "YAML supports # comments on any line. JSON does not — they are stripped during JSON → YAML conversion.",
  },
  {
    title: "Null values",
    text: "null, ~, or an empty value are all valid YAML nulls. JSON null converts to null in YAML.",
  },
  {
    title: "Booleans",
    text: "YAML 1.1 treated yes/no/on/off as booleans. YAML 1.2 (used here) only recognises true/false.",
  },
];

const DIFFERENCES = [
  { feature: "Comments", json: "Not supported", yaml: "# inline comments" },
  { feature: "Syntax", json: "Braces & brackets", yaml: "Indentation-based" },
  { feature: "Data types", json: "6 types", yaml: "Richer (dates, binary…)" },
  { feature: "Readability", json: "Verbose for deep trees", yaml: "Human-friendly" },
  { feature: "Interoperability", json: "Universal", yaml: "DevOps / config focused" },
  { feature: "Superset", json: "—", yaml: "JSON is valid YAML 1.2" },
];

export default function JsonYamlPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav
        className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up"
        aria-label="Breadcrumb"
      >
        <a href="/tools" className="hover:text-orange transition-colors duration-200">
          Tools Hub
        </a>
        <span>/</span>
        <span className="text-navy/70">JSON ↔ YAML Converter</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        JSON ↔ YAML Converter
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Convert between JSON and YAML instantly in your browser. Adjust
        indentation, sort keys alphabetically, and copy the result with one
        click.
      </p>

      <YamlPlayground />

      {/* Info sections */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* YAML tips */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">YAML Tips</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {YAML_TIPS.map((item) => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="text-orange mt-0.5 shrink-0">▸</span>
                <span>
                  <strong className="text-navy/70">{item.title}</strong> —{" "}
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* JSON vs YAML */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">JSON vs YAML</h2>
          <div className="border border-navy/8 rounded-xl overflow-hidden text-xs font-mono">
            {/* Header */}
            <div className="grid grid-cols-3 bg-navy/[0.04] px-4 py-2 text-[10px] uppercase tracking-wider text-navy/40 font-sans">
              <span>Feature</span>
              <span>JSON</span>
              <span>YAML</span>
            </div>
            {DIFFERENCES.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 px-4 py-2.5 text-xs border-t border-navy/5 ${
                  i % 2 === 0 ? "bg-white/30" : ""
                }`}
              >
                <span className="font-sans font-medium text-navy/70">{row.feature}</span>
                <span className="text-navy/50">{row.json}</span>
                <span className="text-navy/50">{row.yaml}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
