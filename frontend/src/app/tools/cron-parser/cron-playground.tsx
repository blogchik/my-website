"use client";

import { useCallback, useEffect, useState } from "react";

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; }
  const el = document.createElement("textarea");
  el.value = text; el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el); el.focus(); el.select(); document.execCommand("copy"); document.body.removeChild(el);
}

interface CronField { value: string; label: string; options: { value: string; label: string }[] }

const FIELD_DEFS: { label: string; min: number; max: number; names?: string[] }[] = [
  { label: "Minute", min: 0, max: 59 },
  { label: "Hour", min: 0, max: 23 },
  { label: "Day of Month", min: 1, max: 31 },
  { label: "Month", min: 1, max: 12, names: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"] },
  { label: "Day of Week", min: 0, max: 6, names: ["SUN","MON","TUE","WED","THU","FRI","SAT"] },
];

function parseCronField(value: string, fieldIdx: number): string {
  const def = FIELD_DEFS[fieldIdx];
  if (value === "*") return `every ${def.label.toLowerCase()}`;
  if (value.includes("/")) { const [, step] = value.split("/"); return `every ${step} ${def.label.toLowerCase()}(s)`; }
  if (value.includes(",")) return `at ${def.label.toLowerCase()} ${value}`;
  if (value.includes("-")) return `${def.label.toLowerCase()} ${value}`;
  return `at ${def.label.toLowerCase()} ${value}`;
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (need 5 fields)";
  return parts.map((p, i) => parseCronField(p, i)).join(", ");
}

function getNextRuns(expr: string, count: number): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const runs: Date[] = [];
  const now = new Date();
  const check = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

  const matchField = (val: number, pattern: string, min: number): boolean => {
    if (pattern === "*") return true;
    if (pattern.includes("/")) { const [base, step] = pattern.split("/"); const b = base === "*" ? min : parseInt(base); return (val - b) % parseInt(step) === 0 && val >= b; }
    if (pattern.includes(",")) return pattern.split(",").map(Number).includes(val);
    if (pattern.includes("-")) { const [lo, hi] = pattern.split("-").map(Number); return val >= lo && val <= hi; }
    return val === parseInt(pattern);
  };

  let iterations = 0;
  while (runs.length < count && iterations < 525960) {
    const matches =
      matchField(check.getMinutes(), parts[0], 0) &&
      matchField(check.getHours(), parts[1], 0) &&
      matchField(check.getDate(), parts[2], 1) &&
      matchField(check.getMonth() + 1, parts[3], 1) &&
      matchField(check.getDay(), parts[4], 0);
    if (matches) runs.push(new Date(check));
    check.setMinutes(check.getMinutes() + 1);
    iterations++;
  }
  return runs;
}

const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday 9AM", value: "0 9 * * 1" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every day at 6AM and 6PM", value: "0 6,18 * * *" },
  { label: "1st of every month", value: "0 0 1 * *" },
  { label: "Weekdays at 9AM", value: "0 9 * * 1-5" },
];

export default function CronPlayground() {
  const [expression, setExpression] = useState("*/15 * * * *");
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [fields, setFields] = useState(["*/15", "*", "*", "*", "*"]);

  useEffect(() => {
    setDescription(describeCron(expression));
    setNextRuns(getNextRuns(expression, 10));
    const parts = expression.trim().split(/\s+/);
    if (parts.length === 5) setFields(parts);
  }, [expression]);

  const updateField = useCallback((idx: number, value: string) => {
    const next = [...fields]; next[idx] = value;
    setFields(next);
    setExpression(next.join(" "));
  }, [fields]);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [expression]);

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs text-navy/40">Enter a cron expression or use the builder below</span>
        <button onClick={() => setExpression("* * * * *")} className="ml-auto px-3 py-2 rounded-xl border border-navy/10 text-xs text-navy/40 hover:border-red-400/40 hover:text-red-400/70 transition-all duration-200 cursor-pointer">Clear</button>
      </div>

      {/* Expression input */}
      <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <input type="text" value={expression} onChange={(e) => setExpression(e.target.value)} className="flex-1 bg-navy/[0.03] border border-navy/10 rounded-lg px-3 py-2.5 text-lg font-mono text-navy text-center tracking-[0.3em] focus:outline-none focus:border-orange/50" spellCheck={false} />
          <button onClick={handleCopy} className="text-xs text-navy/30 hover:text-orange transition-colors cursor-pointer">{copied ? "✓ Copied" : "Copy"}</button>
        </div>
        <div className="text-sm text-navy/60 text-center">{description}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual builder */}
        <div className="space-y-4">
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Field Editor</label>
            <div className="grid grid-cols-5 gap-2">
              {FIELD_DEFS.map((def, i) => (
                <div key={def.label}>
                  <label className="text-[10px] text-navy/40 uppercase block mb-1 truncate">{def.label}</label>
                  <input type="text" value={fields[i] || "*"} onChange={(e) => updateField(i, e.target.value)} className="w-full bg-navy/[0.03] border border-navy/10 rounded-lg px-2 py-1.5 text-xs font-mono text-navy text-center focus:outline-none focus:border-orange/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
            <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Common Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button key={p.value} onClick={() => setExpression(p.value)} className={`px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${expression === p.value ? "bg-orange/10 border-orange/30 text-orange border" : "bg-navy/[0.03] border border-navy/10 text-navy/60 hover:border-orange/20"}`}>
                  <div className="font-medium">{p.label}</div>
                  <div className="font-mono text-[10px] mt-0.5 opacity-60">{p.value}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Next runs */}
        <div className="border border-navy/10 rounded-2xl p-5 bg-white/40 space-y-3">
          <label className="font-bold text-sm text-navy/70 uppercase tracking-wider">Next 10 Runs</label>
          {nextRuns.length > 0 ? (
            <div className="space-y-1">
              {nextRuns.map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-navy/[0.03] transition-colors">
                  <span className="text-[10px] text-navy/30 w-5">{i + 1}.</span>
                  <span className="font-mono text-sm text-navy">{d.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-navy/30 min-h-[16rem] flex items-center justify-center">No upcoming runs found</div>
          )}
          <div className="pt-2 border-t border-navy/10">
            <div className="text-[10px] text-navy/30 font-mono">┌───── minute (0–59)
│ ┌───── hour (0–23)
│ │ ┌───── day of month (1–31)
│ │ │ ┌───── month (1–12)
│ │ │ │ ┌───── day of week (0–6, Sun=0)
│ │ │ │ │
* * * * *</div>
          </div>
        </div>
      </div>
    </div>
  );
}
