import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import JsonPlayground from "./json-playground";

const tool = tools.find((t) => t.slug === "json-formatter")!;

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

const SYNTAX_TYPES = [
  {
    name: "Object",
    example: '{ "key": "value" }',
    desc: "Unordered collection of key-value pairs. Keys must be double-quoted strings.",
  },
  {
    name: "Array",
    example: '[1, "two", true]',
    desc: "Ordered list of values separated by commas, enclosed in square brackets.",
  },
  {
    name: "String",
    example: '"hello world"',
    desc: 'Sequence of Unicode characters enclosed in double quotes. Special characters must be escaped with \\.',
  },
  {
    name: "Number",
    example: "42 | 3.14 | -7 | 1e10",
    desc: "Integer or floating-point. No leading zeros. Scientific notation allowed.",
  },
  {
    name: "Boolean",
    example: "true | false",
    desc: "Lowercase true or false. Not quoted — unlike many languages.",
  },
  {
    name: "Null",
    example: "null",
    desc: "Represents an empty or missing value. Must be lowercase.",
  },
];

const COMMON_ERRORS = [
  {
    error: "Unexpected token '",
    cause: "Single quotes used instead of double quotes",
    fix: 'Replace all single quotes with double quotes: \'key\' → "key"',
  },
  {
    error: "Trailing comma",
    cause: "Comma after the last element in an object or array",
    fix: 'Remove the comma before the closing } or ]: { "a": 1, } → { "a": 1 }',
  },
  {
    error: "Unexpected token //",
    cause: "JavaScript-style comment inside JSON",
    fix: "JSON does not support comments. Remove all // or /* */ comment blocks.",
  },
  {
    error: "Unexpected end of JSON input",
    cause: "Missing closing bracket, brace, or quote",
    fix: "Check that every { has a matching }, every [ has a ], and every string is closed.",
  },
  {
    error: "Unexpected token undefined",
    cause: "JavaScript undefined used as a value",
    fix: 'Replace undefined with null: { "val": undefined } → { "val": null }',
  },
  {
    error: "Keys without quotes",
    cause: "Object key not enclosed in double quotes",
    fix: '{ name: "Abu" } → { "name": "Abu" } — all keys must be double-quoted.',
  },
];

export default function JsonFormatterPage() {
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
        <span className="text-navy/70">JSON Formatter</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        JSON Formatter
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Validate, format and sort JSON instantly. Prettify with custom
        indentation, sort keys alphabetically, and copy with one click.
      </p>

      <JsonPlayground />

      {/* Info sections */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* JSON Syntax Guide */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">JSON Syntax Guide</h2>
          <div className="space-y-3">
            {SYNTAX_TYPES.map((t) => (
              <div
                key={t.name}
                className="flex items-start gap-3 text-sm border border-navy/8 rounded-xl px-4 py-3"
              >
                <span className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-navy">{t.name}</span>
                    <code className="text-xs text-navy/40 font-mono ml-auto">
                      {t.example}
                    </code>
                  </div>
                  <p className="text-navy/50 text-xs leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Errors */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Common JSON Errors</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {COMMON_ERRORS.map((e) => (
              <li key={e.error} className="flex items-start gap-2">
                <span className="text-orange mt-0.5 shrink-0">▸</span>
                <span>
                  <strong className="text-navy/70">{e.error}</strong> —{" "}
                  {e.cause}. <span className="text-navy/40">{e.fix}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
