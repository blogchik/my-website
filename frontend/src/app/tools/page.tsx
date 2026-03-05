import type { Metadata } from "next";
import { toolsByCategory } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

export const metadata: Metadata = {
  title: "Tools Hub — J. Abduroziq",
  description:
    "Free online developer tools — UUID Generator, JWT Decoder, Password Generator, and more. No sign-up, no limits.",
};

export default function ToolsPage() {
  const grouped = toolsByCategory();

  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        Tools Hub.
      </h1>

      {grouped.map((group, gi) => (
        <div key={group.category} className="mb-14 last:mb-0">
          <h2
            className="text-xs font-medium tracking-widest uppercase text-navy/40 mb-6 animate-fade-up"
            style={{ animationDelay: `${0.15 + gi * 0.05}s` }}
          >
            {group.category}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {group.items.map((tool, ti) => (
              <ToolCard key={tool.slug} tool={tool} index={gi * 3 + ti} />
            ))}
          </div>
        </div>
      ))}


    </section>
  );
}
