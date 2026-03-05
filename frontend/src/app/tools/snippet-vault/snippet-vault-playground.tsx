"use client";

import { useCallback, useMemo, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface Snippet { id: string; title: string; code: string; category: string; tags: string[] }

const SNIPPETS: Snippet[] = [
  // Docker
  { id: "docker-compose", title: "Docker Compose – Node + Postgres", category: "Docker", tags: ["docker", "compose", "node", "postgres"], code: `version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      DATABASE_URL: postgresql://user:pass@db:5432/mydb\n    depends_on:\n      - db\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: pass\n      POSTGRES_DB: mydb\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:` },
  { id: "dockerfile-node", title: "Multi-stage Dockerfile (Node)", category: "Docker", tags: ["docker", "node", "multi-stage"], code: `FROM node:22-alpine AS deps\nWORKDIR /app\nCOPY package.json pnpm-lock.yaml ./\nRUN corepack enable && pnpm install --frozen-lockfile\n\nFROM node:22-alpine AS builder\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nRUN pnpm build\n\nFROM node:22-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/.next/standalone ./\nCOPY --from=builder /app/public ./public\nCOPY --from=builder /app/.next/static ./.next/static\nEXPOSE 3000\nCMD ["node", "server.js"]` },
  { id: "dockerfile-python", title: "Multi-stage Dockerfile (Python/uv)", category: "Docker", tags: ["docker", "python", "uv", "fastapi"], code: `FROM python:3.12-slim AS deps\nWORKDIR /app\nCOPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv\nCOPY pyproject.toml uv.lock ./\nRUN uv sync --no-dev --frozen\n\nFROM python:3.12-slim AS runner\nWORKDIR /app\nCOPY --from=deps /app/.venv ./.venv\nCOPY src ./src\nENV PATH="/app/.venv/bin:$PATH"\nEXPOSE 4000\nCMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "4000"]` },
  // Nginx
  { id: "nginx-reverse-proxy", title: "Nginx Reverse Proxy + SSL", category: "Nginx", tags: ["nginx", "ssl", "proxy"], code: `server {\n  listen 80;\n  server_name example.com;\n  return 301 https://$host$request_uri;\n}\n\nserver {\n  listen 443 ssl;\n  server_name example.com;\n\n  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;\n\n  location / {\n    proxy_pass http://localhost:3000;\n    proxy_set_header Host $host;\n    proxy_set_header X-Real-IP $remote_addr;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    proxy_set_header X-Forwarded-Proto $scheme;\n  }\n}` },
  { id: "nginx-spa", title: "Nginx SPA (Single Page App)", category: "Nginx", tags: ["nginx", "spa", "react"], code: `server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n    expires 1y;\n    add_header Cache-Control "public, immutable";\n  }\n}` },
  // Git
  { id: "gitignore-node", title: ".gitignore (Node/Next.js)", category: "Git", tags: ["git", "ignore", "node"], code: `node_modules/\n.next/\nout/\n.env\n.env.local\n.env.prod\n*.log\n.DS_Store\ndist/\ncoverage/` },
  { id: "git-aliases", title: "Useful Git Aliases", category: "Git", tags: ["git", "alias", "config"], code: `# Add to ~/.gitconfig [alias]\n[alias]\n  co = checkout\n  br = branch\n  ci = commit\n  st = status\n  lg = log --oneline --graph --decorate -20\n  undo = reset --soft HEAD~1\n  amend = commit --amend --no-edit\n  wip = !git add -A && git commit -m \"WIP\"\n  cleanup = !git branch --merged | grep -v main | xargs git branch -d` },
  // GitHub Actions
  { id: "gh-action-ci", title: "GitHub Actions – CI (Node)", category: "CI/CD", tags: ["github", "actions", "ci", "node"], code: `name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: pnpm/action-setup@v4\n        with:\n          version: 9\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n          cache: pnpm\n      - run: pnpm install --frozen-lockfile\n      - run: pnpm lint\n      - run: pnpm build` },
  { id: "gh-action-docker", title: "GitHub Actions – Docker Build + Push", category: "CI/CD", tags: ["github", "actions", "docker", "ghcr"], code: `name: Docker\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: \${{ github.actor }}\n          password: \${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v5\n        with:\n          push: true\n          tags: ghcr.io/\${{ github.repository }}:latest` },
  // Shell
  { id: "bash-script-template", title: "Bash Script Template", category: "Shell", tags: ["bash", "shell", "template"], code: `#!/usr/bin/env bash\nset -euo pipefail\nIFS=$'\\n\\t'\n\n# Colors\nRED='\\033[0;31m'\nGREEN='\\033[0;32m'\nNC='\\033[0m'\n\nlog() { echo -e "\${GREEN}[INFO]\${NC} $1"; }\nerr() { echo -e "\${RED}[ERROR]\${NC} $1" >&2; exit 1; }\n\n# Check deps\ncommand -v docker >/dev/null 2>&1 || err "docker is required"\n\nlog "Starting..."\n# Your code here\nlog "Done!"` },
  // TypeScript
  { id: "ts-fetch-wrapper", title: "Type-safe Fetch Wrapper", category: "TypeScript", tags: ["typescript", "fetch", "api"], code: `type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";\n\nasync function api<T>(url: string, options?: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> }): Promise<T> {\n  const res = await fetch(url, {\n    method: options?.method ?? "GET",\n    headers: { "Content-Type": "application/json", ...options?.headers },\n    body: options?.body ? JSON.stringify(options.body) : undefined,\n  });\n  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);\n  return res.json();\n}` },
  { id: "ts-debounce", title: "Debounce / Throttle", category: "TypeScript", tags: ["typescript", "debounce", "throttle"], code: `function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {\n  let timer: ReturnType<typeof setTimeout>;\n  return ((...args: unknown[]) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  }) as T;\n}\n\nfunction throttle<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {\n  let last = 0;\n  return ((...args: unknown[]) => {\n    const now = Date.now();\n    if (now - last >= ms) { last = now; fn(...args); }\n  }) as T;\n}` },
  // SQL
  { id: "sql-common", title: "Common SQL Queries", category: "SQL", tags: ["sql", "postgres", "queries"], code: `-- Count rows per group\nSELECT category, COUNT(*) AS total\nFROM products\nGROUP BY category\nORDER BY total DESC;\n\n-- Pagination\nSELECT * FROM posts\nORDER BY created_at DESC\nLIMIT 20 OFFSET 40;\n\n-- Upsert (PostgreSQL)\nINSERT INTO users (email, name)\nVALUES ('user@example.com', 'John')\nON CONFLICT (email)\nDO UPDATE SET name = EXCLUDED.name;\n\n-- Full-text search (PostgreSQL)\nSELECT * FROM articles\nWHERE to_tsvector('english', title || ' ' || body)\n   @@ plainto_tsquery('search terms');` },
  // Environment
  { id: "env-template", title: ".env Template (Full Stack)", category: "Config", tags: ["env", "config", "template"], code: `# App\nNODE_ENV=development\nPORT=3000\n\n# Database\nDATABASE_URL=postgresql://user:pass@localhost:5432/mydb\n\n# Auth\nJWT_SECRET=your-secret-key\nJWT_EXPIRES_IN=15m\n\n# External APIs\nRESEND_API_KEY=re_xxxxxxxxxxxxx\n\n# CORS\nCORS_ORIGIN=http://localhost:3000\n\n# S3 / Storage\nAWS_BUCKET=my-bucket\nAWS_REGION=us-east-1` },
];

const ALL_CATEGORIES = [...new Set(SNIPPETS.map((s) => s.category))];

export default function SnippetVaultPlayground() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SNIPPETS.filter((s) => {
      const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.tags.some((t) => t.includes(q)) || s.code.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  const handleCopy = useCallback(async (code: string, id: string) => {
    await copyToClipboard(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search snippets…" className="flex-1 min-w-[200px] bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors" />
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2 text-xs text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          <option value="all">All categories</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setSelectedCategory("all"); }} className="px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      <div className="text-xs text-navy/40 mb-3">{filtered.length} snippets</div>

      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="border border-navy/10 rounded-xl bg-white/40 overflow-hidden hover:border-orange/20 transition-colors">
            <button onClick={() => setExpanded(expanded === s.id ? null : s.id)} className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer">
              <span className="text-xs px-2 py-0.5 rounded bg-navy/[0.06] text-navy/50 font-medium shrink-0">{s.category}</span>
              <span className="font-medium text-sm text-navy flex-1">{s.title}</span>
              <span className="text-navy/20 text-xs">{expanded === s.id ? "▲" : "▼"}</span>
            </button>
            {expanded === s.id && (
              <div className="px-5 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {s.tags.map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-orange/10 text-orange/70">{t}</span>)}
                  </div>
                  <button onClick={() => handleCopy(s.code, s.id)} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copiedId === s.id ? "✓ Copied" : "Copy"}</button>
                </div>
                <pre className="bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-xs font-mono text-navy whitespace-pre-wrap overflow-auto max-h-[20rem]">{s.code}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
