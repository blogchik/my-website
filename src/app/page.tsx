import Link from "next/link";
import { Globe } from "@/components/globe";
import { ArrowRightUpIcon } from "@/components/icons/arrow-right-up";

export default function HomePage() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end px-6 lg:px-16 pb-12 pt-24">
      {/* Globe — background, fills viewport */}
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden pointer-events-none">
        <div className="w-[120vmin] h-[120vmin] md:w-[95vw] md:h-[95vw] md:translate-y-[45%] animate-fade-in">
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

        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-3 bg-orange rounded-full pl-6 pr-2 py-2 font-medium text-navy group hover:shadow-lg hover:shadow-orange/25 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <span>Get Connect</span>
          <span className="bg-navy rounded-full p-2 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
            <ArrowRightUpIcon width={20} height={20} className="text-orange" />
          </span>
        </Link>
      </div>
    </section>
  );
}
