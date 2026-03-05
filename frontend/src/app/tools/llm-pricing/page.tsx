import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import LlmPricingPlayground from "./llm-pricing-playground";

const tool = tools.find((t) => t.slug === "llm-pricing")!;

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
  { title: "Input tokens", text: "Tokens you send to the model (prompt, context, instructions). Cheaper than output." },
  { title: "Output tokens", text: "Tokens the model generates (response). Usually 2-5x more expensive than input." },
  { title: "Token ~ 4 chars", text: "One token is roughly 4 English characters or 0.75 words." },
  { title: "Context window", text: "Maximum tokens (input + output) per request. Larger windows cost more." },
  { title: "Batch pricing", text: "Some providers offer 50% discount for non-urgent batch requests." },
];

const INFO_RIGHT = [
  { title: "Cost vs quality", text: "Smaller models (GPT-4o-mini, Haiku) are 10-50x cheaper with decent quality." },
  { title: "Speed matters", text: "Streaming, TTFB, and tokens/second vary widely between models." },
  { title: "Context length", text: "Long docs? Claude (200K), Gemini (1M). Short tasks? Any model works." },
  { title: "Multimodal", text: "Need image/audio? GPT-4o, Claude, Gemini support multimodal input." },
  { title: "Fine-tuning", text: "GPT-4o-mini, Llama, Mistral offer fine-tuning for specialized tasks." },
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
        Compare AI model pricing side by side. Input and output costs per million tokens for GPT-4, Claude, Gemini, Llama, and more. Estimate your costs.
      </p>
      <LlmPricingPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Pricing Concepts</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Choosing a Model</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
