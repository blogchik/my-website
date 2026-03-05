import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { PasswordPlayground } from "./password-playground";

const tool = tools.find((t) => t.slug === "password-generator")!;

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
  applicationCategory: "SecurityApplication",
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

export default function PasswordGeneratorPage() {
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
        <span className="text-navy/70">Password Generator</span>
      </nav>

      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">
        Password Generator
      </h1>
      <p
        className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up"
        style={{ animationDelay: "0.1s" }}
      >
        Generate strong, random passwords with your chosen length and character
        set. Instantly see strength and copy with one click.
      </p>

      <PasswordPlayground />

      {/* Info sections */}
      <div
        className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {/* Security tips */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">
            Password Security Tips
          </h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5 shrink-0">▸</span>
              <span>
                <strong className="text-navy/70">Use at least 16 characters.</strong>{" "}
                Each extra character multiplies the combinations an attacker must
                try exponentially.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5 shrink-0">▸</span>
              <span>
                <strong className="text-navy/70">Mix all character types.</strong>{" "}
                Combining uppercase, lowercase, numbers and symbols expands the
                character pool from 26 to 94+.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5 shrink-0">▸</span>
              <span>
                <strong className="text-navy/70">Never reuse passwords.</strong>{" "}
                A breach on one site exposes all accounts sharing the same
                password (credential stuffing).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5 shrink-0">▸</span>
              <span>
                <strong className="text-navy/70">Use a password manager.</strong>{" "}
                Tools like Bitwarden or 1Password store unique passwords for
                every site so you only remember one master password.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange mt-0.5 shrink-0">▸</span>
              <span>
                <strong className="text-navy/70">Enable 2FA everywhere.</strong>{" "}
                A strong password + TOTP or hardware key makes account takeover
                virtually impossible.
              </span>
            </li>
          </ul>
        </div>

        {/* Where useful */}
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">
            How Entropy Is Calculated
          </h2>
          <div className="text-sm text-navy/60 leading-relaxed space-y-3">
            <p>
              Password strength is measured in{" "}
              <strong className="text-navy/70">bits of entropy</strong>:
            </p>
            <code className="block bg-navy/[0.04] rounded-lg px-4 py-3 text-navy/80 font-mono text-xs">
              entropy = length × log<sub>2</sub>(charset size)
            </code>
            <ul className="space-y-1.5 text-navy/50">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span>
                  <strong className="text-navy/60">&lt; 40 bits</strong> — Weak
                  (crackable in seconds)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange shrink-0" />
                <span>
                  <strong className="text-navy/60">40–55 bits</strong> — Fair
                  (minutes to hours)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                <span>
                  <strong className="text-navy/60">56–67 bits</strong> — Good
                  (days to months)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 shrink-0" />
                <span>
                  <strong className="text-navy/60">68–80 bits</strong> — Strong
                  (years)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span>
                  <strong className="text-navy/60">&gt; 80 bits</strong> — Very
                  Strong (centuries+)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
