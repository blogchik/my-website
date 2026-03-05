import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import CasePlayground from "./case-playground";

const tool = tools.find((t) => t.slug === "case-converter")!;

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
  { title: "camelCase", text: "thisIsCamelCase — used in JavaScript variables and JSON keys." },
  { title: "PascalCase", text: "ThisIsPascalCase — used in class names and React components." },
  { title: "snake_case", text: "this_is_snake_case — used in Python, Ruby, and database columns." },
  { title: "kebab-case", text: "this-is-kebab-case — used in CSS classes, URLs, and HTML attributes." },
  { title: "UPPER_SNAKE", text: "THIS_IS_UPPER_SNAKE — used for constants and environment variables." },
  { title: "Title Case", text: "This Is Title Case — used for headings and proper names." },
  { title: "Sentence case", text: "This is sentence case — used for body text and descriptions." },
];

const INFO_RIGHT = [
  { title: "API integration", text: "Convert between camelCase (frontend JS) and snake_case (backend Python/SQL)." },
  { title: "CSS classes", text: "HTML/CSS uses kebab-case while JavaScript uses camelCase." },
  { title: "Database schemas", text: "Column names are often snake_case; ORM models use PascalCase." },
  { title: "Environment vars", text: "Constants and env vars use UPPER_SNAKE_CASE by convention." },
  { title: "URL slugs", text: "Convert titles to kebab-case for SEO-friendly URLs." },
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
        Convert any text between camelCase, snake_case, PascalCase, kebab-case, UPPER CASE, lower case, Title Case, and more — instantly.
      </p>
      <CasePlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Case Formats</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">When to convert cases?</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
