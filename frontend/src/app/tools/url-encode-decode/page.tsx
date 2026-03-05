import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import UrlEncodPlayground from "./url-encode-playground";

const tool = tools.find((t) => t.slug === "url-encode-decode")!;

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
  { title: "Unreserved chars", text: "A-Z, a-z, 0-9, -, _, ., ~ are never encoded." },
  { title: "Reserved chars", text: ": / ? # [ ] @ ! $ & ' ( ) * + , ; = have special URL meaning and must be encoded in data." },
  { title: "Percent-encoding", text: "Each byte is encoded as %HH (hex). Multi-byte UTF-8 chars produce multiple %HH sequences." },
  { title: "+ vs %20", text: "In query strings, spaces can be + (application/x-www-form-urlencoded) or %20 (RFC 3986)." },
  { title: "encodeURIComponent", text: "JavaScript function that encodes everything except unreserved characters." },
];

const INFO_RIGHT = [
  { title: "Query parameters", text: "Values in ?key=value must be encoded so & and = don't break parsing." },
  { title: "Path segments", text: "Spaces and special chars in /path/my file.txt become /path/my%20file.txt." },
  { title: "Form submissions", text: "HTML forms encode data as application/x-www-form-urlencoded by default." },
  { title: "API requests", text: "Tokens, filenames, and user input in URLs must be properly encoded." },
  { title: "Redirect URLs", text: "return_to URLs often contain encoded nested URLs." },
];

export default function UrlEncodeDecodePage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-navy/40 mb-8 flex items-center gap-1.5 animate-fade-up" aria-label="Breadcrumb">
        <a href="/tools" className="hover:text-orange transition-colors duration-200">Tools Hub</a>
        <span>/</span><span className="text-navy/70">{tool.name}</span>
      </nav>
      <h1 className="font-bold text-[2.25rem] md:text-[3.5rem] text-navy leading-[1.1] tracking-tight mb-4 animate-fade-up">{tool.name}</h1>
      <p className="text-navy/50 text-base md:text-lg max-w-2xl leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        Encode special characters for URLs or decode percent-encoded strings back to readable text. Handles Unicode and all reserved characters.
      </p>
      <UrlEncodPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">URL Encoding Rules</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Where is URL encoding used?</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
