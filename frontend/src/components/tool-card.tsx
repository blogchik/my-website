import Link from "next/link";
import type { Tool } from "@/lib/tools";

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block border border-navy/10 rounded-2xl overflow-hidden hover:border-orange/50 hover:shadow-lg hover:shadow-orange/5 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
    >
      {/* Banner / icon fallback */}
      <div className="relative aspect-[21/9] bg-navy/[0.03] flex items-center justify-center overflow-hidden">
        {tool.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.banner}
            alt={tool.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl md:text-6xl select-none group-hover:scale-110 transition-transform duration-300">
            {tool.icon}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-base text-navy group-hover:text-orange transition-colors duration-300">
            {tool.name}
          </h3>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-navy/30 group-hover:text-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0 mt-0.5"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
        <p className="text-sm text-navy/50 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}
