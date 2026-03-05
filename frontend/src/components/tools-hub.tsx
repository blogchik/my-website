"use client";

import { useMemo, useState } from "react";
import { categories, toolsByCategory, type Category } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

export function ToolsHub() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const allGrouped = useMemo(() => toolsByCategory(), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return allGrouped
      .filter(
        (group) =>
          activeCategory === "all" || group.category === activeCategory,
      )
      .map((group) => ({
        ...group,
        items: group.items.filter((tool) => {
          if (!q) return true;
          return (
            tool.name.toLowerCase().includes(q) ||
            tool.description.toLowerCase().includes(q) ||
            tool.slug.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [allGrouped, search, activeCategory]);

  const totalCount = filtered.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      {/* Search */}
      <div className="relative mb-6 animate-fade-up" style={{ animationDelay: "0.08s" }}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools…"
          className="w-full bg-navy/[0.03] border border-navy/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-navy font-mono placeholder:text-navy/30 focus:outline-none focus:border-orange/50 focus:shadow-sm focus:shadow-orange/5 transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy/60 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filters */}
      <div
        className="flex flex-wrap gap-2 mb-10 animate-fade-up"
        style={{ animationDelay: "0.12s" }}
      >
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer border ${
            activeCategory === "all"
              ? "bg-navy text-white border-navy shadow-md shadow-navy/10"
              : "bg-navy/[0.03] text-navy/50 border-navy/10 hover:border-navy/25 hover:text-navy/70"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setActiveCategory(activeCategory === cat ? "all" : cat)
            }
            className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer border ${
              activeCategory === cat
                ? "bg-navy text-white border-navy shadow-md shadow-navy/10"
                : "bg-navy/[0.03] text-navy/50 border-navy/10 hover:border-navy/25 hover:text-navy/70"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count when searching */}
      {search && (
        <p className="text-xs text-navy/40 mb-6 animate-fade-in">
          {totalCount} tool{totalCount !== 1 ? "s" : ""} found
          {activeCategory !== "all" ? ` in ${activeCategory}` : ""}
        </p>
      )}

      {/* Grouped tool cards */}
      {filtered.length > 0 ? (
        filtered.map((group, gi) => (
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
        ))
      ) : (
        <div className="text-center py-20 animate-fade-in">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-sm text-navy/40">
            No tools found for &ldquo;{search}&rdquo;
            {activeCategory !== "all" ? ` in ${activeCategory}` : ""}
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs text-navy/40 border border-navy/10 hover:border-orange/40 hover:text-orange transition-all duration-200 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
