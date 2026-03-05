import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import CssShadowPlayground from "./css-shadow-playground";

const tool = tools.find((t) => t.slug === "css-shadow-generator")!;

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
  { title: "x-offset", text: "Horizontal shadow offset. Positive = right, negative = left." },
  { title: "y-offset", text: "Vertical shadow offset. Positive = down, negative = up." },
  { title: "blur", text: "Shadow blur radius. Larger values = softer, more spread out shadow." },
  { title: "spread", text: "Expand or shrink the shadow. Positive = larger, negative = smaller than element." },
  { title: "color", text: "Shadow color with opacity. Use rgba() or hsla() for semi-transparent shadows." },
  { title: "inset", text: "Inner shadow instead of outer. Creates pressed/recessed effect." },
];

const INFO_RIGHT = [
  { title: "Uniform", text: "border-radius: 8px applies the same rounding to all corners." },
  { title: "Per-corner", text: "border-radius: 8px 0 8px 0 for individual corners (TL TR BR BL)." },
  { title: "Elliptical", text: "border-radius: 50% / 30% creates elliptical corners." },
  { title: "Pill shape", text: "border-radius: 9999px makes a full pill/capsule shape." },
  { title: "Circle", text: "border-radius: 50% on a square element creates a perfect circle." },
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
        Create CSS box-shadow and border-radius visually. Adjust offset, blur, spread, color, and corners — copy the CSS with one click.
      </p>
      <CssShadowPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Box Shadow Properties</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Border Radius</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
