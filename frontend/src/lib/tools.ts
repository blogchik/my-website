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
  "Web & API",
  "CSS & Design",
  "DevOps",
  "Media",
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
    category: "Converters",
    banner: null,
    seo: {
      title: "JSON ↔ YAML Converter — Convert JSON to YAML Online Free",
      description:
        "Free online JSON to YAML and YAML to JSON converter. Paste your data, choose direction, adjust indentation and sort keys alphabetically. Instant browser-side conversion — no data sent to servers.",
      keywords: ["json to yaml","yaml to json","json yaml converter","convert json to yaml online","convert yaml to json online","json yaml online tool","yaml formatter","json formatter","yaml converter free","json to yaml online free"],
    },
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode JWT tokens to inspect header and payload. No verification needed — works fully offline.",
    icon: "🔓",
    category: "Encoders / Decoders",
    banner: null,
    seo: {
      title: "JWT Decoder — Decode JSON Web Tokens Online Free",
      description: "Free online JWT decoder. Paste any JWT to instantly inspect header, payload, and expiration. No signing or verification — fully client-side.",
      keywords: ["jwt decoder","decode jwt online","json web token decoder","jwt parser","jwt payload viewer","jwt header decoder","jwt token inspector","jwt debugger online"],
    },
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa. Supports multiple timezones.",
    icon: "🕐",
    category: "Converters",
    banner: null,
    seo: {
      title: "Unix Timestamp Converter — Epoch to Date Online Free",
      description: "Free online Unix timestamp converter. Convert epoch time to human-readable dates and back. Supports multiple timezones and formats.",
      keywords: ["unix timestamp converter","epoch converter","timestamp to date","date to timestamp","epoch time converter","unix time converter online","timestamp converter online"],
    },
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with real-time matching, capture groups, and match highlighting.",
    icon: "🔍",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "Regex Tester — Test Regular Expressions Online Free",
      description: "Free online regex tester. Write regular expressions and test against sample text with real-time match highlighting and capture group display.",
      keywords: ["regex tester","regex tester online","regular expression tester","regex debugger","regex match","test regex online","regex validator","javascript regex tester"],
    },
  },
  {
    slug: "url-encode-decode",
    name: "URL Encoder / Decoder",
    description: "Encode or decode URL components. Handles special characters, query strings, and Unicode.",
    icon: "🔗",
    category: "Encoders / Decoders",
    banner: null,
    seo: {
      title: "URL Encoder / Decoder — Encode & Decode URLs Online Free",
      description: "Free online URL encoder and decoder. Encode special characters for URLs or decode percent-encoded strings instantly in your browser.",
      keywords: ["url encoder","url decoder","url encode online","url decode online","percent encoding","urlencode","urldecode","encode url characters"],
    },
  },
  {
    slug: "query-string-parser",
    name: "Query String Parser",
    description: "Parse URL query strings into key-value pairs or build query strings from parameters.",
    icon: "❓",
    category: "Web & API",
    banner: null,
    seo: {
      title: "Query String Parser — Parse & Build URL Parameters Online",
      description: "Free online query string parser and builder. Parse ?a=1&b=2 into key-value pairs or build query strings from parameters. Instant, browser-side.",
      keywords: ["query string parser","url parameter parser","query string builder","parse query string online","url params parser","query string to json","build query string"],
    },
  },
  {
    slug: "json-csv",
    name: "JSON ↔ CSV Converter",
    description: "Convert JSON arrays to CSV or CSV to JSON instantly. Handles nested objects and custom delimiters.",
    icon: "📊",
    category: "Converters",
    banner: null,
    seo: {
      title: "JSON ↔ CSV Converter — Convert JSON to CSV Online Free",
      description: "Free online JSON to CSV and CSV to JSON converter. Convert datasets between JSON arrays and CSV format instantly in your browser.",
      keywords: ["json to csv","csv to json","json csv converter","convert json to csv online","csv to json online","json to csv online free","json csv tool"],
    },
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    description: "Format and validate XML with custom indentation. Syntax highlighting and error detection.",
    icon: "📄",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "XML Formatter & Validator — Prettify XML Online Free",
      description: "Free online XML formatter and validator. Paste raw XML to instantly format with custom indentation, validate syntax, and copy with one click.",
      keywords: ["xml formatter","xml validator","format xml online","xml beautifier","xml pretty print","xml lint","xml formatter online free","xml indent"],
    },
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts side by side and highlight differences. Find additions, deletions, and changes.",
    icon: "📝",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "Diff Checker — Compare Text Online Free",
      description: "Free online diff checker. Compare two texts or code snippets side by side with highlighted additions, deletions, and changes.",
      keywords: ["diff checker","text diff","compare text online","diff tool online","code diff","text comparison","online diff","difference checker"],
    },
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text between camelCase, snake_case, PascalCase, kebab-case, and more formats.",
    icon: "🔠",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "Case Converter — camelCase, snake_case & More Online Free",
      description: "Free online case converter. Transform text between camelCase, snake_case, PascalCase, kebab-case, UPPER_CASE, and more. Instant, browser-side.",
      keywords: ["case converter","camelcase converter","snake case converter","pascal case","kebab case","text case converter online","case converter online free"],
    },
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text, fake names, emails, addresses, and phone numbers for UI prototyping.",
    icon: "📋",
    category: "Generators",
    banner: null,
    seo: {
      title: "Lorem Ipsum & Dummy Data Generator — Free Online Tool",
      description: "Free online Lorem Ipsum and dummy data generator. Generate placeholder paragraphs, fake users, emails, addresses, and phone numbers for UI mockups.",
      keywords: ["lorem ipsum generator","dummy data generator","fake text generator","placeholder text","lorem ipsum online","dummy text generator","fake name generator","mock data generator"],
    },
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    description: "Convert any title or text into an SEO-friendly URL slug. Handles Unicode, accents, and special characters.",
    icon: "🔖",
    category: "Generators",
    banner: null,
    seo: {
      title: "Slug Generator — Create SEO-Friendly URL Slugs Online",
      description: "Free online slug generator. Convert titles and text into clean, SEO-friendly URL slugs. Handles Unicode, accents, and special characters.",
      keywords: ["slug generator","url slug generator","seo slug generator","slug creator online","text to slug","title to slug","url slug maker"],
    },
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB, and HSL. Live preview, contrast checker, and palette generation.",
    icon: "🎨",
    category: "CSS & Design",
    banner: null,
    seo: {
      title: "Color Converter — HEX, RGB, HSL Online Free",
      description: "Free online color converter. Convert between HEX, RGB, and HSL formats with live preview, contrast checker, and copy-ready values.",
      keywords: ["color converter","hex to rgb","rgb to hex","hsl converter","color picker online","hex to hsl","color code converter","css color converter"],
    },
  },
  {
    slug: "css-shadow-generator",
    name: "CSS Shadow Generator",
    description: "Generate CSS box-shadow and border-radius with visual controls. Copy-paste ready CSS snippets.",
    icon: "🖼️",
    category: "CSS & Design",
    banner: null,
    seo: {
      title: "CSS Shadow & Border-Radius Generator — Free Online Tool",
      description: "Free online CSS box-shadow and border-radius generator. Adjust shadow offset, blur, spread, and color visually. Copy-paste ready CSS.",
      keywords: ["css shadow generator","box shadow generator","border radius generator","css box shadow","css generator online","shadow css tool","css shadow maker"],
    },
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress images client-side. Reduce file size with quality control — supports JPEG, PNG, and WebP.",
    icon: "🖼️",
    category: "Media",
    banner: null,
    seo: {
      title: "Image Compressor — Compress Images Online Free",
      description: "Free online image compressor. Reduce JPEG, PNG, and WebP file sizes directly in your browser. No upload to servers — fully client-side.",
      keywords: ["image compressor","compress image online","image optimizer","reduce image size","jpeg compressor","png compressor","webp converter","image compression tool"],
    },
  },
  {
    slug: "http-status-codes",
    name: "HTTP Status Codes",
    description: "Browse all HTTP status codes with descriptions, use cases, and troubleshooting tips.",
    icon: "📡",
    category: "Web & API",
    banner: null,
    seo: {
      title: "HTTP Status Codes — Complete Reference & Lookup",
      description: "Complete HTTP status code reference. Browse 1xx–5xx codes with descriptions, common causes, and troubleshooting tips. Searchable and instant.",
      keywords: ["http status codes","http status code list","http 404","http 500","http status reference","http response codes","status code meanings","http error codes"],
    },
  },
  {
    slug: "curl-builder",
    name: "Curl Builder",
    description: "Build curl commands visually. Set method, headers, auth, and body — get a ready-to-paste command.",
    icon: "⌨️",
    category: "Web & API",
    banner: null,
    seo: {
      title: "Curl Builder — Generate Curl Commands Online Free",
      description: "Free online curl command builder. Set HTTP method, headers, auth, and request body visually — get a ready-to-paste curl command.",
      keywords: ["curl builder","curl command generator","curl generator online","build curl command","curl maker","curl request builder","http curl generator"],
    },
  },
  {
    slug: "cron-parser",
    name: "Cron Expression Helper",
    description: "Parse and build cron expressions with a visual editor. Preview next scheduled run times.",
    icon: "⏰",
    category: "DevOps",
    banner: null,
    seo: {
      title: "Cron Expression Helper — Parse & Build Cron Online Free",
      description: "Free online cron expression parser and builder. Create cron schedules with a visual editor and preview the next 10 scheduled run times.",
      keywords: ["cron expression helper","cron parser","cron builder","crontab generator","cron schedule","cron expression tester","cron job helper","crontab helper"],
    },
  },
  {
    slug: "date-timezone",
    name: "Date & Timezone Helper",
    description: "Convert dates between timezones, format ISO-8601 dates, and calculate time differences.",
    icon: "🌍",
    category: "DevOps",
    banner: null,
    seo: {
      title: "Date & Timezone Helper — Convert Timezones Online Free",
      description: "Free online timezone converter and date helper. Convert dates between timezones, format ISO-8601, and calculate durations.",
      keywords: ["timezone converter","date converter","timezone helper","convert timezone online","iso 8601 format","date timezone tool","time zone calculator"],
    },
  },
  {
    slug: "nanoid-generator",
    name: "NanoID Generator",
    description: "Generate compact, URL-safe unique IDs. Custom length and alphabet. Perfect for links and referral codes.",
    icon: "🔑",
    category: "Generators",
    banner: null,
    seo: {
      title: "NanoID Generator — Create Short Unique IDs Online Free",
      description: "Free online NanoID generator. Create compact, URL-safe unique IDs with custom length and alphabet. Perfect for short links, referral codes, and more.",
      keywords: ["nanoid generator","short id generator","unique id generator","nanoid online","short unique id","url safe id","compact id generator","random id generator"],
    },
  },
  {
    slug: "markdown-previewer",
    name: "Markdown Previewer",
    description: "Write Markdown and see the rendered HTML in real time. Supports GFM tables, code blocks, and task lists.",
    icon: "📑",
    category: "Text Processing",
    banner: null,
    seo: {
      title: "Markdown Previewer — Live Preview Online Free",
      description: "Free online Markdown previewer. Write Markdown on the left, see rendered HTML on the right in real time. Supports GFM, tables, code blocks.",
      keywords: ["markdown previewer","markdown editor online","markdown preview","markdown to html","markdown live preview","markdown renderer","gfm preview","markdown editor free"],
    },
  },
  {
    slug: "webhook-tester",
    name: "Webhook Tester",
    description: "Inspect webhook payloads visually. Parse and format JSON bodies, headers, and metadata.",
    icon: "🪝",
    category: "Web & API",
    banner: null,
    seo: {
      title: "Webhook Payload Inspector — Test Webhooks Online Free",
      description: "Free online webhook payload inspector. Paste webhook payloads to parse, format, and inspect JSON bodies, headers, and metadata.",
      keywords: ["webhook tester","webhook inspector","webhook payload viewer","test webhook","webhook debugger","request bin","webhook tool online"],
    },
  },
  {
    slug: "api-playground",
    name: "API Playground",
    description: "Make HTTP requests from your browser. Set method, URL, headers, and body — see response instantly.",
    icon: "🚀",
    category: "Web & API",
    banner: null,
    seo: {
      title: "API Playground — Test HTTP Requests Online Free",
      description: "Free online API playground. Make GET, POST, PUT, DELETE requests directly from your browser. Inspect response body, headers, and status.",
      keywords: ["api playground","http client online","api tester","rest api tester","test api online","http request tool","api testing tool","postman alternative online"],
    },
  },
  {
    slug: "og-meta-preview",
    name: "Open Graph Preview",
    description: "Preview how your page looks when shared on social media. Edit title, description, and image.",
    icon: "👁️",
    category: "Web & API",
    banner: null,
    seo: {
      title: "Open Graph Preview — Preview Social Media Cards Online Free",
      description: "Free online Open Graph meta tag previewer. See how your link appears on Twitter, Facebook, and LinkedIn. Edit title, description, and image.",
      keywords: ["open graph preview","og meta preview","social media preview","twitter card preview","facebook share preview","meta tag preview","og image preview"],
    },
  },
  {
    slug: "robots-txt-validator",
    name: "Robots.txt Validator",
    description: "Validate robots.txt syntax. Check rules, detect errors, and test URL matching against directives.",
    icon: "🤖",
    category: "Web & API",
    banner: null,
    seo: {
      title: "Robots.txt Validator — Validate & Test Online Free",
      description: "Free online robots.txt validator. Check syntax, detect errors, and test URL matching against your robots.txt directives.",
      keywords: ["robots txt validator","robots.txt tester","validate robots txt","robots txt checker","seo robots validator","robots txt syntax check"],
    },
  },
  {
    slug: "snippet-vault",
    name: "Tech Stack Snippets",
    description: "Copy-paste recipes for Docker, Nginx, Git, and more. Searchable collection of common dev commands.",
    icon: "📚",
    category: "DevOps",
    banner: null,
    seo: {
      title: "Tech Stack Snippets — Copy-Paste Dev Recipes Online",
      description: "Searchable collection of copy-paste dev recipes. Docker, Nginx, Git, systemd, and more — find the command you need instantly.",
      keywords: ["code snippets","dev recipes","docker commands","nginx config","git commands","dev cheat sheet","tech stack snippets","copy paste commands"],
    },
  },
  {
    slug: "llm-pricing",
    name: "LLM Pricing Compare",
    description: "Compare AI model pricing side by side. Input/output costs per token for GPT-4, Claude, Gemini, and more.",
    icon: "🤖",
    category: "DevOps",
    banner: null,
    seo: {
      title: "LLM Pricing Compare — AI Model Costs Side by Side",
      description: "Compare AI model pricing. See input/output costs per token for GPT-4, Claude, Gemini, Llama, and more. Calculate estimated costs for your usage.",
      keywords: ["llm pricing","ai model pricing","gpt 4 pricing","claude pricing","gemini pricing","llm cost comparison","ai api pricing","openai pricing compare"],
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
