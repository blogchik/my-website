import { Globe } from "@/components/globe";
import { PrimaryLink } from "@/components/primary-button";

export default function HomePage() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-6 lg:px-16 pb-12 pt-24">
      {/* Globe — background, fills viewport */}
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden pointer-events-none">
        <div className="w-[120vmin] h-[120vmin] md:w-[95vw] md:h-[95vw] md:translate-y-[45%] animate-fade-in opacity-40">
          <Globe />
        </div>
      </div>

      {/* Hero text */}
      <div className="relative z-10">
        <h1 className="font-bold text-[2.75rem] md:text-[4.5rem] lg:text-[5.5rem] text-navy leading-[1.05] tracking-tight animate-fade-up">
          Designing The Next
          <br />
          Internet.
        </h1>

        <PrimaryLink
          href="/contact"
          className="mt-8 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Let&apos;s Connect
        </PrimaryLink>
      </div>
    </section>
  );
}
