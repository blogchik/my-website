import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import NanoidPlayground from "./nanoid-playground";

const tool = tools.find((t) => t.slug === "nanoid-generator")!;

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
  { title: "URL-safe", text: "Default alphabet: A-Za-z0-9_-. No encoding needed in URLs." },
  { title: "Compact", text: "21 chars (default) has more entropy than UUID's 36 chars." },
  { title: "Crypto-random", text: "Uses crypto.getRandomValues() for unpredictable output." },
  { title: "Custom alphabet", text: "Use only numbers, hex chars, or any custom character set." },
  { title: "Custom length", text: "Shorter = more collisions. 21 chars ≈ 1 billion IDs before 1% collision chance." },
];

const INFO_RIGHT = [
  { title: "Short links", text: "bit.ly-style short URLs need compact, unique IDs." },
  { title: "Referral codes", text: "Human-readable codes for sharing and tracking." },
  { title: "File names", text: "Collision-free temp file or upload names." },
  { title: "Database IDs", text: "When UUIDs are too long for your use case." },
  { title: "Session tokens", text: "Short-lived tokens where full UUID isn't needed." },
  { title: "URL slugs", text: "Auto-generated unique slugs when titles aren't available." },
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
        Generate compact, URL-safe unique IDs with custom length and alphabet. 21 characters by default — collision-resistant and fast.
      </p>
      <NanoidPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">NanoID Features</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">When to use NanoID?</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
