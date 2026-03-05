import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import XmlPlayground from "./xml-playground";

const tool = tools.find((t) => t.slug === "xml-formatter")!;

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
  { title: "Indentation", text: "Nested elements are indented to show hierarchy clearly." },
  { title: "Self-closing tags", text: "Elements like <br/> are valid self-closing tags." },
  { title: "Attributes", text: "Preserved in their original order; values must be quoted." },
  { title: "CDATA sections", text: "CDATA blocks preserve raw text without entity encoding." },
  { title: "Namespaces", text: "xmlns declarations are preserved and properly indented." },
  { title: "Declarations", text: "Processing instructions stay on their own line." },
];

const INFO_RIGHT = [
  { title: "SOAP APIs", text: "Enterprise web services use XML for request/response bodies." },
  { title: "RSS & Atom", text: "Blog feeds and podcast directories use XML formats." },
  { title: "SVG", text: "Scalable Vector Graphics are XML-based image format." },
  { title: "Android layouts", text: "Android UI layouts are defined in XML files." },
  { title: "Configuration", text: "Maven (pom.xml), Spring, and many enterprise tools use XML config." },
  { title: ".NET / C#", text: ".csproj, web.config, and app.config are all XML." },
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
        Paste raw XML to instantly format with proper indentation, validate syntax, and detect errors. Copy the beautified result with one click.
      </p>
      <XmlPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">XML Formatting Rules</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Where is XML used?</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
