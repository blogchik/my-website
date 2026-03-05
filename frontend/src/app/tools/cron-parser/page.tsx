import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import CronPlayground from "./cron-playground";

const tool = tools.find((t) => t.slug === "cron-parser")!;

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
  { title: "5 fields", text: "minute hour day-of-month month day-of-week (standard cron)." },
  { title: "* (asterisk)", text: "Matches every value for that field." },
  { title: ", (comma)", text: "List of values: 1,15 means 1st and 15th." },
  { title: "- (dash)", text: "Range: 1-5 means 1 through 5." },
  { title: "/ (slash)", text: "Step: */5 means every 5 units." },
  { title: "Special strings", text: "@yearly, @monthly, @weekly, @daily, @hourly — common shortcuts." },
];

const INFO_RIGHT = [
  { title: "Every minute", text: "* * * * *" },
  { title: "Every hour", text: "0 * * * *" },
  { title: "Every day at midnight", text: "0 0 * * *" },
  { title: "Every Monday 9 AM", text: "0 9 * * 1" },
  { title: "Every 15 minutes", text: "*/15 * * * *" },
  { title: "1st of month at noon", text: "0 12 1 * *" },
  { title: "Weekdays at 6 PM", text: "0 18 * * 1-5" },
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
        Parse, build, and validate cron expressions with a visual editor. Preview the next scheduled run times and understand cron syntax.
      </p>
      <CronPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Cron Format</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Common Cron Schedules</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
