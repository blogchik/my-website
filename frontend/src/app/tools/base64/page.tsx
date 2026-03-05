import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import Base64Playground from "./base64-playground";

const tool = tools.find((t) => t.slug === "base64")!;

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

const USE_CASES = [
  {
    title: "HTTP Basic Auth",
    text: 'Credentials are Base64-encoded in the Authorization header: "Basic dXNlcjpwYXNz".',
  },
  {
    title: "Data URIs",
    text: "Images and fonts can be embedded directly in HTML/CSS as Base64-encoded data URIs.",
  },
  {
    title: "JWT tokens",
    text: "JSON Web Tokens consist of three Base64URL-encoded segments separated by dots.",
  },
  {
    title: "Email attachments (MIME)",
    text: "Binary attachments in emails are Base64-encoded so they can pass through text-based protocols.",
  },
  {
    title: "API payloads",
    text: "Binary data (images, files) is often Base64-encoded when sent via JSON APIs.",
  },
  {
    title: "Environment variables",
    text: "Secrets and certificates are stored as Base64 strings in environment variables and Kubernetes secrets.",
  },
];

const VARIANTS = [
  {
    name: "Standard Base64",
    chars: "A–Z, a–z, 0–9, +, /",
    padding: "= padding",
    note: "RFC 4648 §4. Default for most use cases.",
  },
  {
    name: "Base64URL",
    chars: "A–Z, a–z, 0–9, -, _",
    padding: "no padding",
    note: "RFC 4648 §5. Safe in URLs and filenames. Used in JWT.",
  },
  {
    name: "MIME Base64",
    chars: "A–Z, a–z, 0–9, +, /",
    padding: "= padding",
    note: "76-char line limit with CRLF. Used in email (RFC 2045).",
  },
];

export default function Base64Page() {
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
        <span className="text-navy/70">Base64 Encoder / Decoder</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        Base64 Encoder / Decoder
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Encode plain text to Base64 or decode Base64 back to a string.
        Instantly, in your browser — no data sent anywhere.
      </p>

      <Base64Playground />

      {/* Info sections */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* Use cases */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Where Base64 Is Used</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {USE_CASES.map((item) => (
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

        {/* Variants */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Base64 Variants</h2>
          <div className="space-y-3">
            {VARIANTS.map((v) => (
              <div
                key={v.name}
                className="flex items-start gap-3 text-sm border border-navy/8 rounded-xl px-4 py-3"
              >
                <span className="w-2 h-2 rounded-full bg-orange mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-navy">{v.name}</span>
                    <code className="text-xs text-navy/40 font-mono ml-auto">
                      {v.padding}
                    </code>
                  </div>
                  <p className="text-navy/50 text-xs leading-relaxed">
                    <span className="text-navy/40 font-mono">{v.chars}</span>
                    {" — "}
                    {v.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
