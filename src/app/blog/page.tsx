import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — J. Abduroziq",
  description: "Thoughts, articles and writing by Jabborov Abduroziq.",
};

export default function BlogPage() {
  return (
    <section className="min-h-screen px-6 lg:px-16 pt-32 pb-16 flex flex-col">
      <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] text-navy leading-[1.05] tracking-tight mb-12 animate-fade-up">
        Blog.
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center -mt-12">
        <span
          className="inline-block border border-orange/30 text-orange text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Coming Soon
        </span>
        <p
          className="text-navy/50 text-lg md:text-xl leading-relaxed animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Thoughts worth writing down are on their way.
          <br />
          Ideas, buildlogs, and honest takes — coming soon.
        </p>
        <div
          className="mt-8 flex items-center gap-2 text-navy/20 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <span className="w-8 h-px bg-navy/20" />
          <span className="text-xs tracking-widest uppercase">Stay tuned</span>
          <span className="w-8 h-px bg-navy/20" />
        </div>
      </div>
    </section>
  );
}
