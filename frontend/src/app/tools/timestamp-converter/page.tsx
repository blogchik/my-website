import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import TimestampPlayground from "./timestamp-playground";

const tool = tools.find((t) => t.slug === "timestamp-converter")!;

export const metadata: Metadata = {
  title: tool.seo.title,
  description: tool.seo.description,
  keywords: tool.seo.keywords,
  alternates: { canonical: tool.seo.canonical ?? `/tools/${tool.slug}` },
  openGraph: { title: tool.seo.title, description: tool.seo.description, url: `/tools/${tool.slug}`, type: "website" },
  twitter: { card: "summary_large_image", title: tool.seo.title, description: tool.seo.description },
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
  author: { "@type": "Person", name: "Jabborov Abduroziq", url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://abduroziq.uz" },
};

const INFO_LEFT = [
  { title: "Unix seconds", text: "Seconds since Jan 1, 1970 00:00:00 UTC. Most common in APIs and databases." },
  { title: "Unix milliseconds", text: "Used by JavaScript Date.now(), Java System.currentTimeMillis(), and many frontend frameworks." },
  { title: "ISO 8601", text: "International standard format: 2024-01-15T10:30:00Z. Timezone-aware and unambiguous." },
  { title: "RFC 2822", text: "Email-style format: Mon, 15 Jan 2024 10:30:00 +0000. Used in HTTP headers." },
  { title: "Relative time", text: "'2 hours ago' or 'in 3 days' — useful for UI display and debugging." },
];

const INFO_RIGHT = [
  { title: "Unix/Linux", text: "File timestamps, cron jobs, and log entries all use epoch seconds." },
  { title: "Databases", text: "PostgreSQL, MySQL timestamp columns store epoch-based values internally." },
  { title: "APIs", text: "REST APIs commonly return timestamps in Unix seconds or ISO 8601 format." },
  { title: "JWT tokens", text: "The exp and iat claims are Unix timestamps in seconds." },
  { title: "Git", text: "Commit timestamps are stored as Unix seconds with timezone offset." },
  { title: "Log analysis", text: "Correlating events across systems requires timestamp conversion between formats." },
];

export default function TimestampConverterPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up" aria-label="Breadcrumb">
        <a href="/tools" className="hover:text-orange transition-colors duration-200">Tools Hub</a>
        <span>/</span>
        <span className="text-navy/70">{tool.name}</span>
      </nav>
      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">{tool.name}</h1>
      <p className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Convert between Unix epoch timestamps and human-readable dates. Supports seconds, milliseconds, and multiple timezones.
      </p>
      <TimestampPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Timestamp Formats</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((item) => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="text-orange mt-0.5 shrink-0">▸</span>
                <span><strong className="text-navy/70">{item.title}</strong> — {item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Where are timestamps used?</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((item) => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="text-orange mt-0.5 shrink-0">▸</span>
                <span><strong className="text-navy/70">{item.title}</strong> — {item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
