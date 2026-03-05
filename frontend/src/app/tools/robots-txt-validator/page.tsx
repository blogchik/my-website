import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import RobotsPlayground from "./robots-playground";

const tool = tools.find((t) => t.slug === "robots-txt-validator")!;

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
  { title: "User-agent", text: "Specifies which crawler the rules apply to. * means all crawlers." },
  { title: "Disallow", text: "Blocks the crawler from the specified path." },
  { title: "Allow", text: "Overrides Disallow for a more specific path." },
  { title: "Sitemap", text: "Points crawlers to your XML sitemap." },
  { title: "Crawl-delay", text: "Seconds between requests (not supported by all crawlers)." },
  { title: "# Comments", text: "Lines starting with # are comments and ignored by crawlers." },
];

const INFO_RIGHT = [
  { title: "Blocking CSS/JS", text: "Disallow: /assets/ can prevent Google from rendering your pages properly." },
  { title: "Blocking entire site", text: "Disallow: / blocks everything. Usually not what you want." },
  { title: "Case sensitivity", text: "Paths are case-sensitive. /Admin/ != /admin/." },
  { title: "No trailing slash", text: "/path blocks /path, /pathfoo, /path/bar. Use /path/ for directories." },
  { title: "Ignoring wildcards", text: "Google supports * and $ in paths. Other crawlers may not." },
  { title: "Forgetting Sitemap", text: "Always include Sitemap: directive so crawlers find your pages." },
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
        Validate your robots.txt syntax, check for common errors, and test if specific URLs are blocked or allowed by your rules.
      </p>
      <RobotsPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Robots.txt Syntax</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Common Mistakes</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
