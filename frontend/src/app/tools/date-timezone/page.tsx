import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import DateTimePlayground from "./datetime-playground";

const tool = tools.find((t) => t.slug === "date-timezone")!;

export const metadata: Metadata = {
  title: tool.seo.title, description: tool.seo.description, keywords: tool.seo.keywords,
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
  { title: "ISO 8601", text: "2024-01-15T10:30:00Z — international standard, unambiguous." },
  { title: "RFC 2822", text: "Mon, 15 Jan 2024 10:30:00 +0000 — used in email headers." },
  { title: "Unix epoch", text: "1705312200 — seconds since Jan 1, 1970 UTC." },
  { title: "Locale format", text: "1/15/2024 (US) vs 15/1/2024 (EU) — varies by country." },
  { title: "Relative", text: "2 hours ago, in 3 days — human-friendly display." },
];

const INFO_RIGHT = [
  { title: "UTC first", text: "Always store and transmit dates in UTC. Convert to local only for display." },
  { title: "DST awareness", text: "Daylight Saving Time shifts can cause 1-hour jumps. Use IANA tz names." },
  { title: "IANA names", text: "America/New_York, Europe/London, Asia/Tashkent — preferred over abbreviations." },
  { title: "Offset vs timezone", text: "UTC+5 is an offset, not a timezone. Offsets don't handle DST changes." },
  { title: "JavaScript dates", text: "new Date() uses local timezone. Use .toISOString() for UTC strings." },
];

export default function Page() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up" aria-label="Breadcrumb">
        <a href="/tools" className="hover:text-orange transition-colors duration-200">Tools Hub</a>
        <span>/</span><span className="text-navy/70">{tool.name}</span>
      </nav>
      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">{tool.name}</h1>
      <p className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Convert dates between timezones, format to ISO-8601, and calculate time differences. Essential for working with international timestamps.
      </p>
      <DateTimePlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Date Formats</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Timezone Tips</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
