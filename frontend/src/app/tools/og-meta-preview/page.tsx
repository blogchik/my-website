import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import OgPreviewPlayground from "./og-preview-playground";

const tool = tools.find((t) => t.slug === "og-meta-preview")!;

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
  { title: "og:title", text: "The title shown in the social card. Keep under 60 characters." },
  { title: "og:description", text: "Description text. Keep under 160 characters for best display." },
  { title: "og:image", text: "Preview image URL. Recommended size: 1200x630px (1.91:1 ratio)." },
  { title: "og:url", text: "Canonical URL of the page." },
  { title: "og:type", text: "Content type: website, article, product, etc." },
  { title: "twitter:card", text: "summary, summary_large_image, player, or app." },
];

const INFO_RIGHT = [
  { title: "Facebook", text: "Uses og: tags. Minimum image size 200x200px. Caches aggressively." },
  { title: "Twitter/X", text: "Prefers twitter: tags, falls back to og: tags. Cards must be enabled." },
  { title: "LinkedIn", text: "Uses og: tags. Image minimum 1200x627px for best results." },
  { title: "Slack", text: "Renders og: tags automatically in link previews." },
  { title: "Discord", text: "Renders og: tags with accent color from og:theme-color." },
  { title: "Debug tools", text: "Facebook Sharing Debugger and Twitter Card Validator test your tags." },
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
        Preview how your page will look when shared on Twitter, Facebook, LinkedIn, and Slack. Edit Open Graph meta tags and see the result instantly.
      </p>
      <OgPreviewPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Open Graph Tags</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Platform Tips</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
