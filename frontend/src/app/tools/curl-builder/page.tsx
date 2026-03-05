import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import CurlPlayground from "./curl-playground";

const tool = tools.find((t) => t.slug === "curl-builder")!;

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
  { title: "-X METHOD", text: "Set HTTP method: GET, POST, PUT, PATCH, DELETE, HEAD." },
  { title: "-H 'Header: value'", text: "Add custom headers. Use multiple -H flags for multiple headers." },
  { title: "-d 'data'", text: "Send request body (POST/PUT)." },
  { title: "--json", text: "Shortcut: sets Content-Type and Accept to application/json." },
  { title: "-u user:pass", text: "HTTP Basic Authentication. Sends Base64-encoded credentials." },
  { title: "-o filename", text: "Save response to a file instead of stdout." },
  { title: "-v", text: "Verbose output — shows request/response headers for debugging." },
];

const INFO_RIGHT = [
  { title: "GET JSON API", text: "curl -s https://api.example.com/data | jq ." },
  { title: "POST JSON", text: "curl -X POST -H 'Content-Type: application/json' -d '{...}' URL" },
  { title: "Bearer token", text: "curl -H 'Authorization: Bearer TOKEN' URL" },
  { title: "Upload file", text: "curl -F 'file=@/path/to/file' URL" },
  { title: "Follow redirects", text: "curl -L URL follows 3xx redirects automatically." },
  { title: "Timeout", text: "curl --connect-timeout 5 --max-time 10 URL" },
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
        Build curl commands visually. Set HTTP method, URL, headers, authentication, and request body — get a ready-to-paste curl command.
      </p>
      <CurlPlayground />
      <div className="mt-20 grid md:grid-cols-2 gap-10 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Curl Options</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_LEFT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg text-navy mb-4">Common Curl Patterns</h2>
          <ul className="text-sm text-navy/60 leading-relaxed space-y-3">
            {INFO_RIGHT.map((i) => (<li key={i.title} className="flex items-start gap-2"><span className="text-orange mt-0.5 shrink-0">▸</span><span><strong className="text-navy/70">{i.title}</strong> — {i.text}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}
