/**
 * Tools Hub — shared data & types
 *
 * Every tool has common fields used on the listing page (card) and on
 * the tool's own page (banner, description, etc.).
 *
 * Common fields per tool:
 *  - slug        unique URL segment (/tools/[slug])
 *  - name        display name
 *  - description short one-liner shown on the card
 *  - icon        emoji or SVG identifier used as visual shorthand
 *  - category    grouping key (e.g. "Generators", "Encoders / Decoders")
 *  - banner      path to a 21 : 9 banner image in /public/tools/<slug>/
 *
 * SEO fields (used in <head> metadata & JSON-LD structured data):
 *  - seo.title       custom <title> — optimised for search (60 chars)
 *  - seo.description meta description — optimised for CTR (150-160 chars)
 *  - seo.keywords    relevant search terms for the tool
 *  - seo.canonical   canonical URL path (defaults to /tools/<slug>)
 *
 * Additional playground-specific UI lives inside each tool's page component.
 */

export interface ToolSeo {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string; // defaults to /tools/<slug>
}

export interface Tool {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  banner: string | null; // path relative to /public — null until an image is added
  seo: ToolSeo;
}

export const categories = [
  "Generators",
  "Encoders / Decoders",
  "Formatters",
  "Converters",
  "Security",
  "Text",
] as const;

export type Category = (typeof categories)[number];

export const tools: Tool[] = [
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description:
      "Generate unique UUIDs (v4) instantly. Bulk generation, multiple formats, and one-click copy.",
    icon: "🆔",
    category: "Generators",
    banner: null,
    seo: {
      title: "UUID Generator — Generate v4 UUIDs Online Free",
      description:
        "Free online UUID v4 generator. Create 1–100 unique UUIDs instantly with multiple formats (standard, uppercase, no-dashes, braces, URN). No sign-up required.",
      keywords: [
        "uuid generator",
        "uuid v4 generator",
        "generate uuid online",
        "random uuid",
        "bulk uuid generator",
        "unique identifier generator",
        "guid generator",
        "uuid generator online free",
        "rfc 4122 uuid",
        "crypto random uuid",
      ],
    },
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description:
      "Generate strong, random passwords with custom length and character sets. Includes strength checker.",
    icon: "🔒",
    category: "Generators",
    banner: null,
    seo: {
      title: "Password Generator — Create Strong Passwords Online Free",
      description:
        "Free online password generator. Create strong, random passwords with custom length (4–128), uppercase, lowercase, numbers and symbols. Includes real-time strength checker.",
      keywords: [
        "password generator",
        "strong password generator",
        "random password generator",
        "secure password generator",
        "password generator online",
        "password generator free",
        "complex password generator",
        "password strength checker",
        "create strong password",
        "password maker online",
      ],
    },
  },
];

/** Return tools grouped by category (preserves category declaration order). */
export function toolsByCategory(): { category: string; items: Tool[] }[] {
  const map = new Map<string, Tool[]>();

  for (const tool of tools) {
    const arr = map.get(tool.category) ?? [];
    arr.push(tool);
    map.set(tool.category, arr);
  }

  return categories
    .filter((c) => map.has(c))
    .map((c) => ({ category: c, items: map.get(c)! }));
}
