import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import CharacterCounterPlayground from "./character-counter-playground";

const tool = tools.find((t) => t.slug === "character-counter")!;

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

const METRICS = [
  {
    label: "Characters",
    note: "Every single character including spaces, punctuation, and newlines.",
  },
  {
    label: "Characters (no spaces)",
    note: "All characters except whitespace — useful for SEO limits.",
  },
  {
    label: "Words",
    note: "Sequences of non-whitespace characters separated by spaces.",
  },
  {
    label: "Sentences",
    note: "Segments ending with ., !, or ?.",
  },
  {
    label: "Paragraphs",
    note: "Non-empty blocks of text separated by blank lines.",
  },
  {
    label: "Lines",
    note: "Total newline-separated lines, including blank ones.",
  },
  {
    label: "UTF-8 Bytes",
    note: "Actual byte size when encoded in UTF-8 — ASCII chars are 1 byte, emoji can be 4 bytes.",
  },
  {
    label: "Reading time",
    note: "Estimated at 200 words per minute (average adult silent reading speed).",
  },
];

const USECASES = [
  {
    title: "SEO meta descriptions",
    text: "Google truncates descriptions at ~160 characters. Use the no-spaces count to stay within search snippet limits.",
  },
  {
    title: "Twitter / X posts",
    text: "Each post is capped at 280 characters. Emojis and CJK characters can count for 2.",
  },
  {
    title: "SMS messages",
    text: "A standard SMS is 160 characters over GSM-7. Anything longer splits into multiple messages and costs more.",
  },
  {
    title: "Database column limits",
    text: "Validate that input won't exceed VARCHAR(255) or similar column constraints before writing to a DB.",
  },
  {
    title: "Academic word counts",
    text: "Essays and assignments often have strict word limits — get an accurate count before submitting.",
  },
  {
    title: "Content readability",
    text: "Sentence and paragraph counts help gauge readability. Short sentences and paragraphs improve comprehension.",
  },
];

export default function CharacterCounterPage() {
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
        <span className="text-navy/70">{tool.name}</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        {tool.name}
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Paste any text to get an instant breakdown — characters, words, sentences,
        paragraphs, bytes, reading time, and frequency analysis. Everything runs
        locally in your browser; no data is ever sent to a server.
      </p>

      <CharacterCounterPlayground />

      {/* Info section */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* Metrics explained */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">What each metric measures</h2>
          <ul className="space-y-3">
            {METRICS.map(({ label, note }) => (
              <li key={label} className="flex gap-3">
                <span className="mt-1 text-orange shrink-0">▸</span>
                <span className="text-sm text-navy/70 leading-relaxed">
                  <strong className="text-navy">{label}</strong> — {note}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Use cases */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Where is this useful?</h2>
          <ul className="space-y-3">
            {USECASES.map(({ title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-1 text-orange shrink-0">▸</span>
                <span className="text-sm text-navy/70 leading-relaxed">
                  <strong className="text-navy">{title}</strong> — {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
