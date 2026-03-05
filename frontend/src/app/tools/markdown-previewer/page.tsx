import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import MarkdownPlayground from "./markdown-playground";

const tool = tools.find((t) => t.slug === "markdown-previewer")!;

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
  { title: "Headings", text: "# H1, ## H2, ### H3 — up to 6 levels." },
  { title: "Bold & Italic", text: "**bold**, *italic*, ***both***, ~~strikethrough~~." },
  { title: "Links & Images", text: "[text](url), ![alt](image-url)." },
  { title: "Code", text: "Inline `code` or fenced blocks with triple backticks." },
  { title: "Lists", text: "- unordered, 1. ordered, - [x] task lists." },
  { title: "Tables", text: "| col | col | with alignment :--: for center." },
  { title: "Blockquotes", text: "> Quoted text. Nest with >> for deeper levels." },
];

const INFO_RIGHT = [
  { title: "GitHub", text: "READMEs, issues, PRs, comments — all Markdown." },
  { title: "Documentation", text: "Docusaurus, MkDocs, Nextra all use Markdown files." },
  { title: "Chat apps", text: "Slack, Discord, and Teams support Markdown formatting." },
  { title: "Note-taking", text: "Obsidian, Notion, and Bear use Markdown as their core format." },
  { title: "Blogs", text: "Static site generators (Hugo, Jekyll, Astro) use Markdown for content." },
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
        Write Markdown on the left, see rendered HTML on the right in real time. Supports GitHub Flavored Markdown — tables, task lists, and code blocks.
      </p>
      <MarkdownPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Markdown Syntax</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Markdown Everywhere</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
