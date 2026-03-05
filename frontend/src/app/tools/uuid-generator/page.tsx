import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { UuidPlayground } from "./uuid-playground";

const tool = tools.find((t) => t.slug === "uuid-generator")!;

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
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Jabborov Abduroziq",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://abduroziq.uz",
  },
};

export default function UuidGeneratorPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav
        className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up"
        aria-label="Breadcrumb"
      >
        <a
          href="/tools"
          className="hover:text-orange transition-colors duration-200"
        >
          Tools Hub
        </a>
        <span>/</span>
        <span className="text-navy/70">UUID Generator</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        UUID Generator
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Generate cryptographically random v4 UUIDs instantly. Bulk up to 100,
        pick your format, and copy with one click.
      </p>

      <UuidPlayground />

      {/* Info sections */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* Structure info */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">
            UUID v4 Structure
          </h2>
          <div className="text-sm text-navy/60 leading-relaxed space-y-3">
            <p>
              A UUID (Universally Unique Identifier) v4 is a 128-bit value
              represented as 32 hexadecimal digits, displayed in five groups
              separated by hyphens:
            </p>
            <code className="block bg-navy/[0.04] rounded-lg px-4 py-3 text-navy/80 font-mono text-xs break-all">
              xxxxxxxx-xxxx-<span className="text-orange font-bold">4</span>
              xxx-
              <span className="text-orange font-bold">[89ab]</span>
              xxx-xxxxxxxxxxxx
            </code>
            <ul className="list-disc list-inside space-y-1 text-navy/50">
              <li>
                The <strong className="text-navy/70">4</strong> in the third
                group indicates version 4 (random).
              </li>
              <li>
                The first hex digit of the fourth group is{" "}
                <strong className="text-navy/70">8, 9, a, or b</strong>,
                indicating the variant (RFC 4122).
              </li>
              <li>
                All other digits are cryptographically random (
                <code className="text-navy/70">crypto.randomUUID()</code>).
              </li>
              <li>
                Collision probability ≈ 1 in 2<sup>122</sup> — practically
                impossible.
              </li>
            </ul>
          </div>
        </div>

        {/* Where useful */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">
            Where UUIDs Are Useful
          </h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5">▸</span>
              <span>
                <strong className="text-navy/70">Database primary keys</strong>{" "}
                — avoid sequential IDs and prevent enumeration attacks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5">▸</span>
              <span>
                <strong className="text-navy/70">Distributed systems</strong> —
                generate IDs across microservices without coordination.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5">▸</span>
              <span>
                <strong className="text-navy/70">Session & token IDs</strong> —
                unique, unguessable identifiers for auth tokens and sessions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5">▸</span>
              <span>
                <strong className="text-navy/70">File naming</strong> — prevent
                collisions in uploads and storage systems.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5">▸</span>
              <span>
                <strong className="text-navy/70">Idempotency keys</strong> —
                safely retry API requests without duplicating side effects.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5">▸</span>
              <span>
                <strong className="text-navy/70">Tracing & logging</strong> —
                correlate logs across services with unique request IDs.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
