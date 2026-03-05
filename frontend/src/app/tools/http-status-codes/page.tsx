import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import HttpStatusPlayground from "./http-status-playground";

const tool = tools.find((t) => t.slug === "http-status-codes")!;

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
  { title: "1xx Informational", text: "Request received, processing continues. Rarely seen in practice." },
  { title: "2xx Success", text: "Request was received, understood, and accepted. 200 OK is the most common." },
  { title: "3xx Redirection", text: "Further action is needed. 301 Moved Permanently, 302 Found, 304 Not Modified." },
  { title: "4xx Client Error", text: "Request has an error. 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found." },
  { title: "5xx Server Error", text: "Server failed to fulfill the request. 500 Internal, 502 Bad Gateway, 503 Service Unavailable." },
];

const INFO_RIGHT = [
  { title: "404 Not Found", text: "Check the URL for typos. Verify the resource exists on the server." },
  { title: "401 vs 403", text: "401 = not authenticated (need to log in). 403 = authenticated but not authorized." },
  { title: "500 Internal", text: "Check server logs. Usually a code bug, missing dependency, or configuration error." },
  { title: "502 Bad Gateway", text: "Upstream server is down or not responding to the reverse proxy." },
  { title: "429 Too Many Requests", text: "Rate limited. Back off and retry with exponential delay." },
  { title: "CORS errors", text: "Not a status code but common. Server must include Access-Control-Allow-Origin header." },
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
        Browse all HTTP status codes with descriptions, common causes, and troubleshooting tips. Searchable and filterable by category.
      </p>
      <HttpStatusPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Status Code Categories</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Troubleshooting</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
