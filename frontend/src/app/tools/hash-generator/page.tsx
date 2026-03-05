import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { HashPlayground } from "./hash-playground";

const tool = tools.find((t) => t.slug === "hash-generator")!;

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

export default function HashGeneratorPage() {
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
        <span className="text-navy/70">Hash Generator</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        Hash Generator
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Compute cryptographic hashes from any string — MD5, SHA-1, SHA-256,
        SHA-384, SHA-512. Multiple output formats, instant results.
      </p>

      <HashPlayground />

      {/* Info sections */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* Algorithm comparison */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Algorithm Overview</h2>
          <div className="space-y-3">
            {[
              {
                name: "MD5",
                bits: 128,
                status: "Broken",
                statusColor: "text-red-500",
                dotColor: "bg-red-400",
                note: "Fast but cryptographically broken. Use only for non-security checksums.",
              },
              {
                name: "SHA-1",
                bits: 160,
                status: "Deprecated",
                statusColor: "text-orange",
                dotColor: "bg-orange",
                note: "Deprecated for security use. Still common in git commit IDs.",
              },
              {
                name: "SHA-256",
                bits: 256,
                status: "Recommended",
                statusColor: "text-green-500",
                dotColor: "bg-green-500",
                note: "Part of SHA-2. Widely used in TLS, JWT signatures, and blockchains.",
              },
              {
                name: "SHA-384",
                bits: 384,
                status: "Strong",
                statusColor: "text-green-500",
                dotColor: "bg-green-500",
                note: "Truncated SHA-512. Used in TLS 1.2 cipher suites.",
              },
              {
                name: "SHA-512",
                bits: 512,
                status: "Strongest",
                statusColor: "text-green-500",
                dotColor: "bg-green-500",
                note: "Highest security margin. Preferred when speed is not a concern.",
              },
            ].map((algo) => (
              <div
                key={algo.name}
                className="flex items-start gap-3 text-sm border border-navy/8 rounded-xl px-4 py-3"
              >
                <span className={`w-2 h-2 rounded-full ${algo.dotColor} mt-1.5 shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-navy">{algo.name}</span>
                    <span className="text-navy/30 text-xs">{algo.bits} bits</span>
                    <span className={`text-xs ml-auto font-medium ${algo.statusColor}`}>
                      {algo.status}
                    </span>
                  </div>
                  <p className="text-navy/50 text-xs leading-relaxed">{algo.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Where useful */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Where Hashes Are Used</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {[
              {
                title: "Password storage",
                text: "Passwords are never stored in plain text — only their hash (ideally with bcrypt/argon2).",
              },
              {
                title: "File integrity checks",
                text: 'Download pages show SHA-256 checksums so you can verify the file wasn\'t tampered with.',
              },
              {
                title: "Digital signatures",
                text: "RSA and ECDSA sign the hash of a document, not the document itself — much more efficient.",
              },
              {
                title: "API request signing",
                text: "HMAC-SHA256 authenticates API requests (AWS SigV4, GitHub webhooks, Stripe events).",
              },
              {
                title: "Content addressing",
                text: "Git stores every file and commit by its SHA-1/SHA-256 hash — the hash IS the identifier.",
              },
              {
                title: "Deduplication",
                text: "Compare hashes instead of files to find duplicates at scale without reading full content.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-2">
                <span className="text-orange mt-0.5 shrink-0">▸</span>
                <span>
                  <strong className="text-navy/70">{item.title}</strong> — {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
