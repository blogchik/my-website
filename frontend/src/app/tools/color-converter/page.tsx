import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import ColorPlayground from "./color-playground";

const tool = tools.find((t) => t.slug === "color-converter")!;

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
  { title: "HEX", text: "#RRGGBB or #RGB shorthand. 24-bit color (16.7M colors). Most common in CSS." },
  { title: "RGB", text: "rgb(0-255, 0-255, 0-255). Red, Green, Blue additive color model." },
  { title: "HSL", text: "hsl(0-360, 0-100%, 0-100%). Hue, Saturation, Lightness — more intuitive." },
  { title: "RGBA / HSLA", text: "Same as above with alpha channel for transparency (0-1)." },
  { title: "Named colors", text: "CSS has 148 named colors: red, cornflowerblue, rebeccapurple, etc." },
];

const INFO_RIGHT = [
  { title: "WCAG AA", text: "Normal text needs 4.5:1 contrast ratio. Large text needs 3:1." },
  { title: "WCAG AAA", text: "Normal text needs 7:1 contrast ratio. Large text needs 4.5:1." },
  { title: "Color blindness", text: "~8% of men and ~0.5% of women have some form of color vision deficiency." },
  { title: "Don't rely on color alone", text: "Use icons, patterns, or labels alongside color to convey meaning." },
  { title: "Test contrast", text: "Use the contrast checker to verify your foreground/background combinations." },
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
        Convert colors between HEX, RGB, and HSL formats. Live preview, WCAG contrast check, and complementary palette generation.
      </p>
      <ColorPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Color Formats</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Color accessibility</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
