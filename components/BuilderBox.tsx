"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Wallet, Gauge, Link2, Upload, X, Copy, Check, Loader2 } from "lucide-react";
import type { Model, ScoreDimension } from "@/lib/schema";
import { TASK_PROFILES, TASK_BUILDER } from "@/lib/demo-data";
import { rankModels } from "@/lib/scoring";
import { detectNlRoute } from "@/lib/search";
import { VerifyBadge } from "./ui";
import { cn } from "@/lib/utils";

type Budget = "free" | "budget" | "best";
type Priority = "balanced" | "quality" | "fastest" | "cheapest";

const BUDGETS: { id: Budget; label: string; hint: string }[] = [
  { id: "free", label: "Free", hint: "self-host / $0 API" },
  { id: "budget", label: "Cheap", hint: "low per-use cost" },
  { id: "best", label: "Best", hint: "quality first" }
];
const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "balanced", label: "Balanced" },
  { id: "quality", label: "Best quality" },
  { id: "fastest", label: "Fastest" },
  { id: "cheapest", label: "Cheapest" }
];

function blended(m: Model): number {
  return (m.pricing?.inputPer1M ?? 99) * 3 + (m.pricing?.outputPer1M ?? 99);
}

function matchTask(q: string): { id: string; reason: string } {
  const t = q.trim();
  if (t.length < 2) return { id: "saas", reason: "Describe your idea above and I'll match it to a task." };
  const nl = detectNlRoute(t);
  if (nl && TASK_PROFILES.some((p) => p.id === nl.taskId)) return { id: nl.taskId, reason: nl.reason };
  const words = t.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4);
  let best = "saas";
  let bestScore = 0;
  for (const p of TASK_PROFILES) {
    const hay = `${p.label} ${p.tagline ?? ""} ${p.plain ?? ""} ${p.description}`.toLowerCase();
    let s = 0;
    for (const w of words) if (hay.includes(w)) s++;
    if (s > bestScore) { bestScore = s; best = p.id; }
  }
  return bestScore > 0
    ? { id: best, reason: `Matched “${TASK_PROFILES.find((p) => p.id === best)?.label}” from your words.` }
    : { id: "saas", reason: "No strong keyword match — starting from the balanced SaaS default. Add words like 'game', 'website', 'support', 'invoice'." };
}

/** Sections guessed from text signals → wireframe sketch + recreation prompt. Interpretation, not a copy. */
function sketchBlocks(signals: { label: string }[]): string[] {
  const blocks = ["hero"];
  const has = (k: string) => signals.some((s) => s.label.toLowerCase().includes(k));
  if (has("landing") || has("saas") || has("classic")) blocks.push("features", "testimonials");
  if (has("saas") || has("commerce")) blocks.push("pricing");
  if (has("gallery")) blocks.push("gallery");
  if (has("editorial") || has("blog")) blocks.push("articles");
  if (has("docs") || has("heavy")) blocks.push("docs");
  if (has("commerce")) blocks.push("products");
  if (has("game")) blocks.push("showcase");
  blocks.push("faq", "footer");
  return [...new Set(blocks)];
}

function recreationPrompt(title: string, signals: { label: string }[], taskLabel: string): string {
  const blocks = sketchBlocks(signals);
  const purposes: Record<string, string> = {
    hero: "one headline + one action button",
    features: "3 benefits in plain words",
    testimonials: "2 short quotes with names",
    pricing: "3 tiers, middle one highlighted",
    gallery: "6 visuals with one consistent filter",
    articles: "latest 3 posts with dates",
    docs: "search box + sidebar topics",
    products: "grid with photos and prices",
    showcase: "trailer spot + screenshots",
    faq: "5 real objections, honest answers",
    footer: "contact + socials"
  };
  const sectionLines = blocks.map((b) => `- ${b}: ${purposes[b] ?? "supporting content"}`).join("\n");
  return `Create a website inspired by "${title}" — STRUCTURE AND FEEL ONLY. All copy, names, and assets must be original; reproduce nothing from the reference.\nGoal: a ${taskLabel} page for my project.\nSections in order:\n${sectionLines}\nStyle: modern, generous whitespace, mobile-responsive, one accent color used sparingly.\nConstraints: placeholder copy I can edit (no lorem ipsum in headlines), room for my logo.\nFinish with 3 specific changes that keep it from looking generic.`;
}

function SketchBlock({ name }: { name: string }) {
  const shell = "rounded border border-white/15 bg-white/[0.05] p-1.5";
  const bar = "h-1.5 rounded-full bg-white/20";
  const barDim = "h-1.5 rounded-full bg-white/10";
  if (name === "hero") {
    return (
      <div className="rounded border border-white/15 bg-gradient-to-br from-accent/40 via-accent/10 to-mint/20 p-2.5 text-left">
        <div className={`${bar} w-3/4`} /><div className={`${barDim} mt-1 w-1/2`} />
        <div className="mt-2 h-4 w-16 rounded-full bg-mint/70" />
      </div>
    );
  }
  if (name === "features") {
    return <div className={`${shell} grid grid-cols-3 gap-1`}><div className={bar} /><div className={bar} /><div className={bar} /><div className={barDim} /><div className={barDim} /><div className={barDim} /></div>;
  }
  if (name === "pricing") {
    return (
      <div className={`${shell} grid grid-cols-3 gap-1`}>
        <div className="rounded bg-white/5 p-1"><div className={barDim} /></div>
        <div className="rounded border border-mint/50 bg-mint/10 p-1"><div className={bar} /></div>
        <div className="rounded bg-white/5 p-1"><div className={barDim} /></div>
      </div>
    );
  }
  if (name === "gallery" || name === "showcase" || name === "products") {
    return (
      <div className={`${shell} grid grid-cols-4 gap-1`}>
        <div className="h-6 rounded bg-gradient-to-br from-accent/50 to-mint/30" />
        <div className="h-6 rounded bg-gradient-to-br from-mint/40 to-sky-400/30" />
        <div className="h-6 rounded bg-gradient-to-br from-amber-300/40 to-rose-400/30" />
        <div className="h-6 rounded bg-gradient-to-br from-violet-400/40 to-accent/30" />
      </div>
    );
  }
  if (name === "testimonials") {
    return <div className={`${shell} grid grid-cols-2 gap-1`}><div className="rounded bg-white/5 p-1"><div className={barDim} /><div className={`${barDim} mt-1 w-2/3`} /></div><div className="rounded bg-white/5 p-1"><div className={barDim} /><div className={`${barDim} mt-1 w-2/3`} /></div></div>;
  }
  return (
    <div className={`${shell} flex items-center gap-1.5`}>
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">{name}</span>
      <div className={`${barDim} flex-1`} />
    </div>
  );
}

export default function BuilderBox({ models }: { models: Model[] }) {
  const [text, setText] = useState("");
  const [budget, setBudget] = useState<Budget>("best");
  const [priority, setPriority] = useState<Priority>("balanced");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [refUrl, setRefUrl] = useState("");
  const [refState, setRefState] = useState<{ loading: boolean; error?: string; data?: { title: string; url: string; signals: { label: string; taskId: string; hit?: string }[]; suggestedTaskId: string; note: string } }>({ loading: false });
  const [files, setFiles] = useState<{ name: string; kind: string; url: string }[]>([]);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [copiedRecreate, setCopiedRecreate] = useState(false);

  const query = submitted ?? "";
  const match = useMemo(() => matchTask(query), [query]);
  const profile = TASK_PROFILES.find((p) => p.id === match.id)!;
  const builder = TASK_BUILDER[match.id];

  async function inspectRef() {
    const target = refUrl.trim();
    if (!target) return;
    setRefState({ loading: true });
    try {
      const res = await fetch("/api/inspect-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target })
      });
      const data = await res.json();
      if (!res.ok) { setRefState({ loading: false, error: data?.error ?? `HTTP ${res.status} — try another public URL.` }); return; }
      if (data?.ok === false) { setRefState({ loading: false, error: data.blockedReason ?? "That page couldn't be read (robots.txt, bot protection, or bad type). Paste a different public URL." }); return; }
      setRefState({ loading: false, data });
    } catch (e: any) {
      setRefState({ loading: false, error: `Couldn't reach the app server (${e?.message ?? "fetch failed"}). Is 'npm run dev' still running?` });
    }
  }

  function copyPlan() {    const lines = [
      `My build plan — ${profile.label} (Atlas demo)`,
      `Idea: ${query}`,
      refState.data ? `Reference: ${refState.data.title} (${refState.data.url})` : null,
      files.length ? `Attached files: ${files.map((f) => f.name).join(", ")} (in browser only)` : null,
      `Top picks: ${results.ranked.map((r, i) => `#${i + 1} ${r.model.name} (${r.total})`).join("; ") || "none pass the budget filter"}`,
      `Steps: ${(builder?.steps ?? []).map((s, i) => `${i + 1}. ${s}`).join(" ")}`
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 1600);
  }

  const results = useMemo(() => {
    let pool = [...models];
    if (budget === "free") pool = pool.filter((m) => m.selfHostable || (m.pricing?.inputPer1M ?? 99) === 0);
    else if (budget === "budget") pool = pool.filter((m) => blended(m) <= 8);
    const w = { ...(profile.weights as Record<ScoreDimension, number>) };
    if (priority === "quality") { w.coding = Math.min(3, (w.coding ?? 1) + 1); w.reasoning = Math.min(3, (w.reasoning ?? 1) + 1); }
    if (priority === "fastest") w.speed = 3;
    if (priority === "cheapest") w.cost = 3;
    return { ranked: rankModels(pool, w).slice(0, 3), poolEmpty: pool.length === 0 };
  }, [models, budget, priority, profile]);

  return (
    <div className="rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/[0.08] to-transparent p-4">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">
        <Sparkles size={13} /> Builder — describe it, get a plan
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setSubmitted(text); }}
          placeholder='Try: "a website for my bakery" or "NPC dialogue for my game"…'
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-accent/60"
        />
        <button onClick={() => setSubmitted(text)} className="rounded-xl bg-gradient-to-r from-accent to-mint px-5 py-2.5 text-sm font-semibold text-ink-950">
          Suggest my stack
        </button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3">
          <Link2 size={14} className="shrink-0 text-slate-400" />
          <input
            value={refUrl}
            onChange={(e) => setRefUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") inspectRef(); }}
            placeholder="Reference site you admire (optional) — https://…"
            inputMode="url"
            className="w-full bg-transparent py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button onClick={inspectRef} disabled={refState.loading || !refUrl.trim()} className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50">
            {refState.loading ? <Loader2 size={13} className="animate-spin" /> : "Learn from it"}
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/20 px-3 py-2.5 text-[13px] text-slate-300 hover:bg-white/5">
          <Upload size={14} className="shrink-0 text-slate-400" />
          <span className="truncate">{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} attached (logo / images / video)` : "Attach logo, images, or video (optional)"}</span>
          <input
            type="file" accept="image/*,video/*" multiple className="hidden"
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []).slice(0, 6);
              setFiles((cur) => [...cur, ...list.map((f) => ({ name: f.name, kind: f.type.startsWith("video") ? "video" : "image", url: URL.createObjectURL(f) }))].slice(0, 6));
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {refState.error && <p className="mt-2 rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">{refState.error}</p>}
      {refState.data && (
        <div className="mt-2 rounded-xl border border-sky-300/25 bg-sky-300/[0.07] p-3">
          <p className="text-[13px] font-semibold text-white">Reference: {refState.data.title}</p>
          <p className="break-all font-mono text-[11px] text-sky-300">{refState.data.url}</p>
          {refState.data.signals.length > 0 ? (
            <ul className="mt-1.5 space-y-1.5">
              {refState.data.signals.slice(0, 4).map((s, i) => (
                <li key={i} className="rounded-lg bg-black/20 px-2 py-1.5">
                  <span className="text-xs font-medium text-slate-100">• {s.label}</span>
                  <span className="text-[11px] text-slate-400"> → try it under: {TASK_PROFILES.find((p) => p.id === s.taskId)?.label ?? s.taskId}</span>
                  {s.hit && <span className="block truncate font-mono text-[10px] text-slate-500">saw: “{s.hit}”</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-slate-300">No strong text signals — still fine as a visual reference for YOU; the steps below adapt to its task.</p>
          )}
          <p className="mt-1.5 text-[11px] italic text-slate-400">{refState.data.note}</p>
          <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Recreation prompt <VerifyBadge status="interpretation" className="ml-1" /></p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-200">{recreationPrompt(refState.data.title, refState.data.signals, TASK_PROFILES.find((p) => p.id === refState.data!.suggestedTaskId)?.label ?? "website")}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  const p = recreationPrompt(refState.data!.title, refState.data!.signals, TASK_PROFILES.find((t) => t.id === refState.data!.suggestedTaskId)?.label ?? "website");
                  navigator.clipboard.writeText(p);
                  setCopiedRecreate(true);
                  setTimeout(() => setCopiedRecreate(false), 1600);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10"
              >
                {copiedRecreate ? <Check size={12} /> : <Copy size={12} />} {copiedRecreate ? "Copied" : "Copy prompt"}
              </button>
              <button
                onClick={() => {
                  const p = recreationPrompt(refState.data!.title, refState.data!.signals, TASK_PROFILES.find((t) => t.id === refState.data!.suggestedTaskId)?.label ?? "website");
                  setText(p);
                  setSubmitted(p);
                }}
                className="rounded-lg bg-gradient-to-r from-accent to-mint px-2.5 py-1.5 text-[11px] font-semibold text-ink-950"
              >
                Generate one similar → ranks models below
              </button>
            </div>
          </div>
          <div className="mt-2 overflow-hidden rounded-xl border border-white/15 bg-ink-950">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-2.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400/70" /><span className="h-2 w-2 rounded-full bg-amber-300/70" /><span className="h-2 w-2 rounded-full bg-emerald-300/70" />
              <span className="ml-1 flex-1 truncate rounded-md bg-black/40 px-2 py-0.5 font-mono text-[10px] text-slate-400">{refState.data.url.replace("https://", "")} — concept preview</span>
            </div>
            <div className="space-y-1.5 p-2.5">
              {sketchBlocks(refState.data.signals).map((b) => <SketchBlock key={b} name={b} />)}
            </div>
            <p className="border-t border-white/10 px-2.5 py-1.5 text-[10px] text-slate-500">Concept preview from text signals — layout guess, not a copy of the site. Run the prompt above on your #1 ranked pick; that pairing is the comparison that matters.</p>
          </div>
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.url} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 py-1 pl-1 pr-2 text-[11px] text-slate-200">
              {f.kind === "video"
                ? <video src={f.url} className="h-8 w-12 rounded object-cover" muted playsInline />
                : <img src={f.url} alt={f.name} className="h-8 w-12 rounded object-cover" />}
              <span className="max-w-[140px] truncate">{f.name}</span>
              <button onClick={() => { URL.revokeObjectURL(f.url); setFiles((cur) => cur.filter((x) => x.url !== f.url)); }} title="Remove" className="text-slate-400 hover:text-white"><X size={13} /></button>
            </span>
          ))}
          <span className="w-full text-[11px] text-slate-500">Files stay in your browser only — nothing is uploaded. Mention them in your prompt (“use my attached logo, keep its colors”).</span>
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-slate-400"><Wallet size={13} /> Budget:</span>
        {BUDGETS.map((b) => (
          <button key={b.id} title={b.hint} onClick={() => setBudget(b.id)} className={cn("rounded-full border px-3 py-1", budget === b.id ? "border-mint/60 bg-mint/15 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>{b.label}</button>
        ))}
        <span className="ml-2 inline-flex items-center gap-1 text-slate-400"><Gauge size={13} /> Want:</span>
        {PRIORITIES.map((p) => (
          <button key={p.id} onClick={() => setPriority(p.id)} className={cn("rounded-full border px-3 py-1", priority === p.id ? "border-accent/60 bg-accent/20 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>{p.label}</button>
        ))}
      </div>

      {query.trim().length >= 2 && (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-sm font-semibold text-white">Matched: {profile.label} <VerifyBadge status="interpretation" className="ml-1" /></p>
            <p className="mt-0.5 text-xs text-slate-400">{match.reason}</p>
            {profile.tagline && <p className="mt-1.5 text-[13px] font-medium text-slate-100">{profile.tagline}</p>}
            {results.poolEmpty ? (
              <p className="mt-2 text-[13px] text-amber-200">No models pass the “{BUDGETS.find((b) => b.id === budget)?.label}” filter in this demo set — loosen to Cheap or Best. Unknowns are filtered out, never guessed.</p>
            ) : (
              <ol className="mt-2 space-y-1.5">
                {results.ranked.map((r, i) => (
                  <li key={r.slug}>
                    <Link href={`/models/${r.slug}`} className="block rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 hover:border-white/25">
                      <span className="text-[13px] font-semibold text-white">#{i + 1} {r.model.name} <span className="font-mono text-[11px] text-mint">{r.total}</span></span>
                      <span className="block text-[11px] text-slate-400">{r.model.bestFor.slice(0, 2).join(" · ")} · confidence {r.model.confidenceOverall}/100</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-1.5 font-mono text-[10px] text-slate-500">Assumes you want the best within your budget filter. Demo scores — validate on your task.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-sm font-semibold text-white">Your first 4 steps</p>
            <ol className="mt-1.5 space-y-1.5">
              {builder?.steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-200">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white/10 font-mono text-[11px] text-white">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
            {builder && <p className="mt-2 rounded-lg bg-white/[0.03] p-2 text-[11px] text-slate-400"><span className="font-semibold text-mint">Budget tip: </span>{builder.budgetTip}</p>}
            <button onClick={copyPlan} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10">
              {copiedPlan ? <Check size={13} /> : <Copy size={13} />} {copiedPlan ? "Plan copied" : "Copy my plan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
