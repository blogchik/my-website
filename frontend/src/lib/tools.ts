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
  "Text Processing",
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
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description:
      "Hash any string with MD5, SHA-1, SHA-256, SHA-384, or SHA-512. Multiple output formats, instant results.",
    icon: "#️⃣",
    category: "Generators",
    banner: null,
    seo: {
      title: "Hash Generator — MD5, SHA-256, SHA-512 Online Free",
      description:
        "Free online hash generator. Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes instantly. Supports hex (lower/upper) and Base64 output. No sign-up required.",
      keywords: [
        "hash generator",
        "sha256 generator",
        "md5 hash generator",
        "sha512 hash online",
        "sha1 generator",
        "string hash online",
        "hash calculator",
        "sha256 online",
        "md5 checksum generator",
        "cryptographic hash online",
      ],
    },
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description:
      "Validate, format and sort JSON instantly. Prettify with custom indentation, sort keys, and copy with one click.",
    icon: "{}",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "JSON Formatter & Validator — Prettify JSON Online Free",
      description:
        "Free online JSON formatter and validator. Paste raw JSON to instantly format, validate, sort keys, and adjust indentation. Works fully in your browser — no data sent to servers.",
      keywords: [
        "json formatter",
        "json validator",
        "json prettifier",
        "format json online",
        "json beautifier",
        "json lint",
        "pretty print json",
        "json sort keys",
        "json online tool",
        "json parser online",
      ],
    },
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    description:
      "Encode plain text to Base64 or decode Base64 back to a string. Instant, browser-side, no data sent to servers.",
    icon: "🔤",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "Base64 Encoder / Decoder — Encode & Decode Online Free",
      description:
        "Free online Base64 encoder and decoder. Encode plain text to Base64 or decode Base64 strings back to text instantly in your browser. No sign-up, no data sent to servers.",
      keywords: [
        "base64 encoder",
        "base64 decoder",
        "base64 encode online",
        "base64 decode online",
        "base64 converter",
        "encode text to base64",
        "decode base64 to text",
        "base64 online tool",
        "base64 string converter",
        "base64 free tool",
      ],
    },
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    description:
      "Count characters, words, sentences, lines, and bytes. Reading time, frequency analysis — all in real time.",
    icon: "🔢",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "Character Counter — Count Words, Characters & More Online",
      description:
        "Free online character and word counter. Get instant counts of characters, words, sentences, paragraphs, lines, and UTF-8 byte size. Includes reading time estimate and top word frequency analysis.",
      keywords: [
        "character counter",
        "word counter",
        "character count online",
        "word count tool",
        "letter counter",
        "text stats",
        "count words online",
        "reading time calculator",
        "sentence counter",
        "paragraph counter",
        "text analyzer",
        "byte counter",
      ],
    },
  },
  {
    slug: "json-yaml",
    name: "JSON ↔ YAML Converter",
    description:
      "Convert JSON to YAML or YAML to JSON instantly. Custom indentation, sort keys, and one-click copy.",
    icon: "⇄",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "JSON ↔ YAML Converter — Convert JSON to YAML Online Free",
      description:
        "Free online JSON to YAML and YAML to JSON converter. Paste your data, choose direction, adjust indentation and sort keys alphabetically. Instant browser-side conversion — no data sent to servers.",
      keywords: [
        "json to yaml",
        "yaml to json",
        "json yaml converter",
        "convert json to yaml online",
        "convert yaml to json online",
        "json yaml online tool",
        "yaml formatter",
        "json formatter",
        "yaml converter free",
        "json to yaml online free",
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
