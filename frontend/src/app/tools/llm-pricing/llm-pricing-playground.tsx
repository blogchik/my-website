"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface Model { name: string; provider: string; inputPer1M: number; outputPer1M: number; contextWindow: number; notes?: string }

const MODELS: Model[] = [
  // OpenAI
  { name: "GPT-4o", provider: "OpenAI", inputPer1M: 2.50, outputPer1M: 10.00, contextWindow: 128000 },
  { name: "GPT-4o mini", provider: "OpenAI", inputPer1M: 0.15, outputPer1M: 0.60, contextWindow: 128000 },
  { name: "GPT-4.1", provider: "OpenAI", inputPer1M: 2.00, outputPer1M: 8.00, contextWindow: 1047576 },
  { name: "GPT-4.1 mini", provider: "OpenAI", inputPer1M: 0.40, outputPer1M: 1.60, contextWindow: 1047576 },
  { name: "GPT-4.1 nano", provider: "OpenAI", inputPer1M: 0.10, outputPer1M: 0.40, contextWindow: 1047576 },
  { name: "o3", provider: "OpenAI", inputPer1M: 2.00, outputPer1M: 8.00, contextWindow: 200000, notes: "Reasoning model" },
  { name: "o3 mini", provider: "OpenAI", inputPer1M: 1.10, outputPer1M: 4.40, contextWindow: 200000, notes: "Reasoning model" },
  { name: "o4 mini", provider: "OpenAI", inputPer1M: 1.10, outputPer1M: 4.40, contextWindow: 200000, notes: "Reasoning model" },
  // Anthropic
  { name: "Claude Opus 4", provider: "Anthropic", inputPer1M: 15.00, outputPer1M: 75.00, contextWindow: 200000, notes: "Most capable" },
  { name: "Claude Sonnet 4", provider: "Anthropic", inputPer1M: 3.00, outputPer1M: 15.00, contextWindow: 200000 },
  { name: "Claude Haiku 3.5", provider: "Anthropic", inputPer1M: 0.80, outputPer1M: 4.00, contextWindow: 200000 },
  // Google
  { name: "Gemini 2.5 Pro", provider: "Google", inputPer1M: 1.25, outputPer1M: 10.00, contextWindow: 1048576, notes: "Up to 1M context" },
  { name: "Gemini 2.5 Flash", provider: "Google", inputPer1M: 0.15, outputPer1M: 0.60, contextWindow: 1048576 },
  { name: "Gemini 2.0 Flash", provider: "Google", inputPer1M: 0.10, outputPer1M: 0.40, contextWindow: 1048576 },
  // Meta (via API providers)
  { name: "Llama 4 Maverick", provider: "Meta", inputPer1M: 0.20, outputPer1M: 0.60, contextWindow: 1048576, notes: "Via Groq/Together" },
  { name: "Llama 4 Scout", provider: "Meta", inputPer1M: 0.10, outputPer1M: 0.30, contextWindow: 512000, notes: "Via Groq/Together" },
  // Mistral
  { name: "Mistral Large", provider: "Mistral", inputPer1M: 2.00, outputPer1M: 6.00, contextWindow: 128000 },
  { name: "Mistral Small", provider: "Mistral", inputPer1M: 0.10, outputPer1M: 0.30, contextWindow: 32000 },
  // DeepSeek
  { name: "DeepSeek V3", provider: "DeepSeek", inputPer1M: 0.27, outputPer1M: 1.10, contextWindow: 131072 },
  { name: "DeepSeek R1", provider: "DeepSeek", inputPer1M: 0.55, outputPer1M: 2.19, contextWindow: 131072, notes: "Reasoning model" },
  // xAI
  { name: "Grok 3", provider: "xAI", inputPer1M: 3.00, outputPer1M: 15.00, contextWindow: 131072 },
  { name: "Grok 3 Mini", provider: "xAI", inputPer1M: 0.30, outputPer1M: 0.50, contextWindow: 131072 },
];

const PROVIDERS = [...new Set(MODELS.map((m) => m.provider))].sort();

export default function LlmPricingPlayground() {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [sortBy, setSortBy] = useState<"name" | "input" | "output" | "total">("total");
  const [sortAsc, setSortAsc] = useState(true);
  const [unit, setUnit] = useState<"tokens" | "k">("tokens");

  const multiplier = unit === "k" ? 1000 : 1;
  const effectiveInput = inputTokens * multiplier;
  const effectiveOutput = outputTokens * multiplier;

  const costFor = useCallback((model: Model) => {
    const input = (effectiveInput / 1_000_000) * model.inputPer1M;
    const output = (effectiveOutput / 1_000_000) * model.outputPer1M;
    return { input, output, total: input + output };
  }, [effectiveInput, effectiveOutput]);

  const filtered = useMemo(() => {
    let list = MODELS.filter((m) => {
      const matchProvider = selectedProvider === "all" || m.provider === selectedProvider;
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q);
      return matchProvider && matchSearch;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "input") cmp = a.inputPer1M - b.inputPer1M;
      else if (sortBy === "output") cmp = a.outputPer1M - b.outputPer1M;
      else cmp = costFor(a).total - costFor(b).total;
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [search, selectedProvider, sortBy, sortAsc, costFor]);

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(true); }
  };

  const fmtCost = (n: number) => n < 0.001 ? "<$0.001" : "$" + n.toFixed(4);
  const fmtCtx = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : (n / 1000) + "K";

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models…" className="flex-1 min-w-[180px] bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2 text-sm text-navy font-mono focus:outline-none focus:border-orange/50 transition-colors" />
        <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-2 text-xs text-navy/60 focus:outline-none cursor-pointer" suppressHydrationWarning>
          <option value="all">All providers</option>
          {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setSelectedProvider("all"); }} className="px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      {/* Calculator */}
      <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 mb-6 space-y-3">
        <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Cost Calculator</label>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="text-[10px] text-navy/40 block mb-1">Input tokens</label>
            <input type="number" min={0} value={inputTokens} onChange={(e) => setInputTokens(Number(e.target.value))} className="w-28 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
          </div>
          <div>
            <label className="text-[10px] text-navy/40 block mb-1">Output tokens</label>
            <input type="number" min={0} value={outputTokens} onChange={(e) => setOutputTokens(Number(e.target.value))} className="w-28 bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
          </div>
          <div className="flex gap-1 bg-navy/[0.04] rounded-lg p-0.5">
            <button onClick={() => setUnit("tokens")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${unit === "tokens" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>Tokens</button>
            <button onClick={() => setUnit("k")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${unit === "k" ? "bg-white text-navy shadow-sm" : "text-navy/40 hover:text-navy/60"}`}>K tokens</button>
          </div>
          <div className="text-xs text-navy/40 ml-auto">= {effectiveInput.toLocaleString()} in / {effectiveOutput.toLocaleString()} out</div>
        </div>
      </div>

      {/* Pricing table */}
      <div className="border border-navy/10 rounded-2xl overflow-hidden bg-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-navy/[0.03] border-b border-navy/10">
                <th className="text-left px-4 py-3 font-bold text-navy/50 uppercase tracking-wider cursor-pointer hover:text-orange" onClick={() => handleSort("name")}>Model {sortBy === "name" ? (sortAsc ? "↑" : "↓") : ""}</th>
                <th className="text-left px-3 py-3 font-bold text-navy/50 uppercase tracking-wider">Provider</th>
                <th className="text-right px-3 py-3 font-bold text-navy/50 uppercase tracking-wider cursor-pointer hover:text-orange" onClick={() => handleSort("input")}>Input/1M {sortBy === "input" ? (sortAsc ? "↑" : "↓") : ""}</th>
                <th className="text-right px-3 py-3 font-bold text-navy/50 uppercase tracking-wider cursor-pointer hover:text-orange" onClick={() => handleSort("output")}>Output/1M {sortBy === "output" ? (sortAsc ? "↑" : "↓") : ""}</th>
                <th className="text-right px-3 py-3 font-bold text-navy/50 uppercase tracking-wider">Context</th>
                <th className="text-right px-4 py-3 font-bold text-orange uppercase tracking-wider cursor-pointer hover:text-orange/70" onClick={() => handleSort("total")}>Est. Cost {sortBy === "total" ? (sortAsc ? "↑" : "↓") : ""}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const cost = costFor(m);
                return (
                  <tr key={m.name} className="border-b border-navy/[0.05] hover:bg-navy/[0.02] transition-colors">
                    <td className="px-4 py-2.5 font-medium text-navy">
                      {m.name}
                      {m.notes && <span className="ml-1.5 text-[10px] text-navy/30">{m.notes}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-navy/50">{m.provider}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-navy/60">${m.inputPer1M.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-navy/60">${m.outputPer1M.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-navy/40">{fmtCtx(m.contextWindow)}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-orange">{fmtCost(cost.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-navy/30">
        Prices as of mid-2025. Actual pricing may vary — check provider websites for the latest rates. Cached/batch pricing not shown.
      </div>
    </div>
  );
}
