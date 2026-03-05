import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import JwtPlayground from "./jwt-playground";

const tool = tools.find((t) => t.slug === "jwt-decoder")!;

export const metadata: Metadata = {
  title: tool.seo.title,
  description: tool.seo.description,
  keywords: tool.seo.keywords,
  alternates: { canonical: tool.seo.canonical ?? `/tools/${tool.slug}` },
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

const INFO_LEFT = [
  { title: "Header", text: "Contains the signing algorithm (e.g. HS256, RS256) and token type (JWT)." },
  { title: "Payload", text: "JSON object with claims — iss, sub, aud, exp, iat, and custom fields." },
  { title: "Signature", text: "Created by signing header + payload with a secret. Not decoded here — verify server-side." },
  { title: "Base64URL", text: "JWT segments use Base64URL encoding (no padding, URL-safe alphabet)." },
  { title: "Expiration (exp)", text: "Unix timestamp when the token expires. Displayed as a human date." },
  { title: "Issued At (iat)", text: "Unix timestamp when the token was created." },
];

const INFO_RIGHT = [
  { title: "API Authentication", text: "Bearer tokens in Authorization headers for stateless REST APIs." },
  { title: "Single Sign-On (SSO)", text: "Share auth state across multiple services and domains." },
  { title: "OAuth 2.0", text: "ID tokens and access tokens issued by identity providers." },
  { title: "Session Replacement", text: "Stateless alternative to server-side sessions." },
  { title: "Microservices", text: "Pass user identity between services without shared session storage." },
  { title: "Webhooks", text: "Signed payloads to verify the sender's identity." },
];

export default function JwtDecoderPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up" aria-label="Breadcrumb">
        <a href="/tools" className="hover:text-orange transition-colors duration-200">Tools Hub</a>
        <span>/</span>
        <span className="text-navy/70">{tool.name}</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        {tool.name}
      </h1>
      <p className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Paste a JSON Web Token to instantly decode and inspect its header and payload. No verification or signing — everything runs locally in your browser.
      </p>

      <JwtPlayground />

      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">JWT Structure</h2>
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
          <h2 className="font-bold text-lg text-navy mb-4">Common JWT Use Cases</h2>
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
