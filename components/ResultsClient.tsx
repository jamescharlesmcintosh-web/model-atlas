"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpDown, Download, Copy, Check, Table2, LayoutGrid, GitCompareArrows, Search, RotateCcw } from "lucide-react";
import type { Analysis, Model, ScoreDimension } from "@/lib/schema";
import { SCORE_LABELS } from "@/lib/schema";
import { TASK_PROFILES, DEMO_BENCHMARKS } from "@/lib/demo-data";
import { DEFAULT_WEIGHTS, DIMENSIONS, explainRank, rankModels } from "@/lib/scoring";
import { analysisToMarkdown, modelsToCsv, shareSummary } from "@/lib/export";
import { recentAnalyses, saveAnalysis } from "@/lib/store";
import ModelCard from "./ModelCard";
import BuilderBox from "./BuilderBox";
import { Badge, DataQualityBadge, DemoBanner, Empty, ScoreBar, SectionTitle, VerifyBadge } from "./ui";
import { CapabilityRadar, BenchmarkBars } from "./Charts";
import { cn, fmtCtx } from "@/lib/utils";

type SortKey = "overall" | "cost" | "speed" | "context" | "coding" | "reasoning" | "agent" | "multimodal" | "structured";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "overall", label: "Overall" }, { id: "cost", label: "Cost" }, { id: "speed", label: "Speed" },
  { id: "context", label: "Context" }, { id: "coding", label: "Coding" }, { id: "reasoning", label: "Reasoning" },
  { id: "agent", label: "Agents" }, { id: "multimodal", label: "Multimodal" }, { id: "structured", label: "Structured" }
];

function sortVal(m: Model, k: SortKey): number {
  const g = (d: ScoreDimension) => m.scores.find((s) => s.dimension === d)?.score ?? -1;
  if (k === "overall") return (m.scores.map((s) => s.score ?? 0).reduce((a, b) => a + b, 0) / Math.max(1, m.scores.length));
  if (k === "context") return m.contextWindow ?? -1;
  if (k === "cost") return g("cost");
  if (k === "speed") return g("speed");
  if (k === "coding") return g("coding");
  if (k === "reasoning") return g("reasoning");
  if (k === "agent") return g("agent");
  if (k === "multimodal") return g("multimodal");
  return g("structured");
}

const QUICK_TASKS = [
  { id: "custom-saas", label: "SaaS default" }, { id: "coding", label: "Coding" }, { id: "support", label: "Support agent" },
  { id: "rag", label: "RAG" }, { id: "value", label: "Best value" }, { id: "local", label: "Private" }
];

export default function ResultsClient({ initial, taskId }: { initial: Analysis; taskId?: string }) {
  const [analysis] = useState<Analysis>(initial);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("overall");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [task, setTask] = useState(taskId ?? "coding");
  const [weights, setWeights] = useState<Record<ScoreDimension, number>>(
    () => ({ ...(TASK_PROFILES.find((t) => t.id === (taskId ?? "coding"))?.weights as Record<ScoreDimension, number> | undefined ?? DEFAULT_WEIGHTS) })
  );
  const [copied, setCopied] = useState(false);
  const [showWeights, setShowWeights] = useState(false);

  const models = useMemo(() => {
    let list = [...analysis.models];
    if (q.trim()) {
      const nq = q.toLowerCase();
      list = list.filter((m) => `${m.name} ${m.provider} ${m.family ?? ""} ${m.aliases.join(" ")}`.toLowerCase().includes(nq));
    }
    if (onlyOpen) list = list.filter((m) => m.openWeight);
    return list.sort((a, b) => sortVal(b, sort) - sortVal(a, sort));
  }, [analysis, q, sort, onlyOpen]);

  const ranked = useMemo(() => rankModels(analysis.models, weights), [analysis, weights]);
  const activeTask = TASK_PROFILES.find((t) => t.id === task);

  function pickTask(id: string) {
    setTask(id);
    const t = TASK_PROFILES.find((x) => x.id === id);
    if (t) setWeights({ ...(t.weights as Record<ScoreDimension, number>) });
  }

  function toggleCompare(slug: string) {
    setCompare((c) => c.includes(slug) ? c.filter((x) => x !== slug) : c.length >= 4 ? [...c.slice(1), slug] : [...c, slug]);
  }

  function download(name: string, text: string, type: string) {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const codingPoints = DEMO_BENCHMARKS.filter((b) => b.category === "coding");

  return (
    <div className="space-y-6 py-6">
      {analysis.isDemo && <DemoBanner />}
      {analysis.warnings.map((w) => (
        <div key={w.slice(0, 40)} className="rounded-xl border border-sky-300/25 bg-sky-300/[0.07] px-4 py-2.5 text-[13px] text-sky-100">{w}</div>
      ))}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">Landscape · {analysis.models.length} models</p>
          <h1 className="editorial-headline text-3xl text-white sm:text-4xl">{analysis.sourceTitle}</h1>
          <p className="mt-1 font-mono text-[11px] text-slate-400">Source: {analysis.sourceUrl} · Last analyzed {new Date(analysis.lastAnalyzed).toLocaleString()} · {analysis.isDemo ? "DEMO" : "live"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => download(`atlas-${analysis.id}.md`, analysisToMarkdown(analysis), "text/markdown")} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"><Download size={13} /> Markdown</button>
          <button onClick={() => download(`atlas-${analysis.id}.csv`, modelsToCsv(analysis.models), "text/csv")} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"><Download size={13} /> CSV</button>
          <button onClick={() => { navigator.clipboard.writeText(analysis.models.map(shareSummary).join("\n\n")); setCopied(true); setTimeout(() => setCopied(false), 1600); }} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10">
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Share summary"}
          </button>
        </div>
      </div>

      {/* sticky comparison toolbar */}
      <div className="sticky top-[57px] z-30 glass rounded-xl px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3">
            <Search size={14} className="text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models, providers, families…" className="w-full bg-transparent py-2 text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs">
            <ArrowUpDown size={13} className="text-slate-400" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="bg-transparent py-1 focus:outline-none">
              {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-ink-900">{s.label}</option>)}
            </select>
          </div>
          <button onClick={() => setView(view === "cards" ? "table" : "cards")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10">
            {view === "cards" ? <span className="inline-flex items-center gap-1"><Table2 size={13} /> Table</span> : <span className="inline-flex items-center gap-1"><LayoutGrid size={13} /> Cards</span>}
          </button>
          <button onClick={() => setOnlyOpen((v) => !v)} className={cn("rounded-lg border px-3 py-2 text-xs font-semibold", onlyOpen ? "border-mint/50 bg-mint/10 text-mint" : "border-white/10 bg-white/5 hover:bg-white/10")}>
            Open-weight only
          </button>
          <Link href={compare.length >= 2 ? `/compare?m=${compare.join(",")}` : "#"} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold", compare.length >= 2 ? "bg-gradient-to-r from-accent to-mint text-ink-950" : "border border-white/10 text-slate-400")}>
            <GitCompareArrows size={13} /> Head-to-head ({compare.length}/4)
          </Link>
        </div>
        {compare.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {compare.map((s) => {
              const m = analysis.models.find((x) => x.slug === s);
              return <button key={s} onClick={() => toggleCompare(s)} className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[11px] text-white hover:bg-accent/25">{m?.name} ✕</button>;
            })}
            <button onClick={() => setCompare([])} className="text-[11px] text-slate-400 underline underline-offset-2">clear</button>
          </div>
        )}
      </div>

      {/* recommendations strip */}
      <section className="glass rounded-2xl p-4">
        <SectionTitle kicker="Recommendations" title="Best picks for this landscape" sub="Transparent winners per category. Every pick is an interpretation over demo evidence — click through to verify." />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {analysis.recommendations.slice(0, 9).map((r) => {
            const m = analysis.models.find((x) => x.slug === r.modelSlug);
            return (
              <Link key={r.id} href={m ? `/models/${m.slug}` : "#"} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/25">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{r.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{m?.name ?? r.modelSlug}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{r.reason}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* task recommender */}
      <section className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle kicker="Task recommender" title={activeTask ? activeTask.label : "Rank for your task"} sub={activeTask?.description + " Weights are adjustable — the ranking explains itself."} />
          <button onClick={() => setShowWeights((v) => !v)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold hover:bg-white/10">{showWeights ? "Hide weights" : "Adjust weights"}</button>
        </div>
        <div className="mt-3"><BuilderBox models={analysis.models} /></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TASK_PROFILES.map((t) => (
            <button key={t.id} onClick={() => pickTask(t.id)} title={t.tagline ?? t.description} className={cn("rounded-full border px-3 py-1 text-xs", task === t.id ? "border-accent/60 bg-accent/20 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>{t.label}</button>
          ))}
        </div>
        {activeTask && (activeTask.plain || activeTask.tagline) && (
          <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3.5">
            {activeTask.tagline && <p className="text-[15px] font-semibold text-white">{activeTask.tagline}</p>}
            {activeTask.plain && <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-300">{activeTask.plain}</p>}
            <div className="mt-2 grid gap-2 text-[12px] leading-relaxed md:grid-cols-3">
              {activeTask.costNote && <p className="rounded-lg bg-white/[0.03] p-2 text-slate-300"><span className="font-semibold text-mint">Cost in plain terms: </span>{activeTask.costNote}</p>}
              {activeTask.privacyNote && <p className="rounded-lg bg-white/[0.03] p-2 text-slate-300"><span className="font-semibold text-sky-300">Privacy: </span>{activeTask.privacyNote}</p>}
              {activeTask.watchOut && <p className="rounded-lg bg-white/[0.03] p-2 text-slate-300"><span className="font-semibold text-amber-200">Watch out: </span>{activeTask.watchOut}</p>}
            </div>
          </div>
        )}
        {showWeights && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {DIMENSIONS.map((d) => (
              <label key={d} className="rounded-lg border border-white/10 bg-black/20 p-2 text-[11px]">
                <span className="flex justify-between text-slate-300"><span>{SCORE_LABELS[d]}</span><span className="font-mono">{weights[d] ?? 0}</span></span>
                <input type="range" min={0} max={3} step={0.5} value={weights[d] ?? 0} onChange={(e) => setWeights({ ...weights, [d]: Number(e.target.value) })} className="mt-1 w-full accent-violet-400" />
              </label>
            ))}
            <button onClick={() => activeTask && setWeights({ ...(activeTask.weights as Record<ScoreDimension, number>) })} className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 p-2 text-[11px] text-slate-300 hover:bg-white/5"><RotateCcw size={12} /> Reset</button>
          </div>
        )}
        <div className="mt-3 space-y-2">
          {ranked.slice(0, 5).map((r, i) => (
            <motion.div key={r.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/models/${r.slug}`} className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/25 sm:flex-row sm:items-center sm:gap-4">
                <span className="font-mono text-lg font-bold text-white">#{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{r.model.name} <span className="font-mono text-xs text-mint">{r.total}</span></span>
                  <span className="block text-xs text-slate-400">{explainRank(r)}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">coverage {(r.coverage * 100).toFixed(0)}%</span>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_TASKS.map((t) => <span key={t.id} className="text-[11px] text-slate-500">{t.label}</span>)}
        </div>
      </section>

      {/* models */}
      {models.length === 0 ? (
        <Empty title="No models match." hint="Clear search or disable the open-weight filter." />
      ) : view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {models.map((m) => (
            <ModelCard key={m.slug} model={m} selected={compare.includes(m.slug)} onToggleCompare={() => toggleCompare(m.slug)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="thin-scroll w-full min-w-[900px] text-left text-[13px]">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-400">
              <tr><th className="px-3 py-2">Model</th><th className="px-3 py-2">Coding</th><th className="px-3 py-2">Reason</th><th className="px-3 py-2">Agent</th><th className="px-3 py-2">Struct</th><th className="px-3 py-2">Context</th><th className="px-3 py-2">Cost</th><th className="px-3 py-2">Quality</th><th className="px-3 py-2">Compare</th></tr>
            </thead>
            <tbody>
              {models.map((m) => {
                const g = (d: ScoreDimension) => m.scores.find((s) => s.dimension === d)?.score ?? null;
                return (
                  <tr key={m.slug} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2"><Link href={`/models/${m.slug}`} className="font-semibold text-white hover:underline">{m.name}</Link><span className="block text-[11px] text-slate-400">{m.provider} · {fmtCtx(m.contextWindow)}</span></td>
                    <td className="px-3 py-2"><ScoreBar value={g("coding")} /></td>
                    <td className="px-3 py-2"><ScoreBar value={g("reasoning")} /></td>
                    <td className="px-3 py-2"><ScoreBar value={g("agent")} /></td>
                    <td className="px-3 py-2"><ScoreBar value={g("structured")} /></td>
                    <td className="px-3 py-2 font-mono text-xs">{fmtCtx(m.contextWindow)}</td>
                    <td className="px-3 py-2"><ScoreBar value={g("cost")} /></td>
                    <td className="px-3 py-2"><DataQualityBadge level={m.dataQuality} /></td>
                    <td className="px-3 py-2"><button onClick={() => toggleCompare(m.slug)} className={cn("rounded-md border px-2 py-1 text-[11px]", compare.includes(m.slug) ? "border-accent/60 bg-accent/20 text-white" : "border-white/10 text-slate-300")}>{compare.includes(m.slug) ? "✓" : "+"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* benchmark preview + methodology */}
      <section className="grid gap-3 lg:grid-cols-2">
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white">Demo coding benchmark (fictional — do not use as real)</h3>
          <div className="mt-2"><BenchmarkBars points={codingPoints} models={analysis.models} /></div>
          <p className="mt-2 text-[11px] text-slate-400">Versions are never mixed without warning. Each point keeps benchmark name, date, methodology, origin, source URL, reliability, and caveats — open the model page → Benchmarks.</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white">Capability radar (composite)</h3>
          <div className="mt-2"><CapabilityRadar models={analysis.models.slice(0, 3)} /></div>
        </div>
      </section>

      <section className="glass rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white">Methodology — how scores work</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-300">
          Scores blend source-backed specs, provider statements, and explicitly labeled evaluation signals.
          Missing data lowers confidence and renders as “Not enough verified data” — never a fabricated number.
          Rankings use transparent weights you can adjust above; each rank shows its contributing dimensions, missing-data handling (scored 0 for ordering, Unknown in display), coverage %, and confidence penalty. There is no universal “best model.”
        </p>
        {!analysis.isDemo && (
          <p className="mt-2 rounded-lg border border-mint/25 bg-mint/[0.06] p-2.5 text-[13px] leading-relaxed text-mint">
            Live models.dev sync: specs, pricing, and flags are verified from the public directory snapshot.
            The 0–100 quality numbers here are DERIVED spec signals (formula in <span className="font-mono">lib/models-dev.ts</span>: flags → scores), not benchmark results — coding, writing, and speed stay Unknown until benchmark adapters land.
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <VerifyBadge status="verified" /><VerifyBadge status="derived" /><VerifyBadge status="interpretation" /><VerifyBadge status="inferred" /><VerifyBadge status="unknown" /><VerifyBadge status="conflicting" /><VerifyBadge status="demo" />
        </div>
      </section>

      <RecentStrip currentId={analysis.id} />
    </div>
  );
}

function RecentStrip({ currentId }: { currentId: string }) {
  // Effect-loaded so SSR and hydration render identically
  const [list, setList] = useState<Analysis[]>([]);
  useEffect(() => { try { setList(recentAnalyses().filter((a) => a.id !== currentId).slice(0, 6)); } catch {} }, [currentId]);
  if (!list.length) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-200">Recent analyses (this browser)</h3>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {list.map((a) => (
          <Link key={a.id} href={`/results?id=${a.id}`} onClick={() => saveAnalysis(a)} className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs hover:border-white/25">
            <span className="block max-w-[220px] truncate font-semibold text-white">{a.sourceTitle}</span>
            <span className="font-mono text-[10px] text-slate-400">{a.models.length} models · {new Date(a.lastAnalyzed).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DEFAULT_WEIGHTS_EXPORT() {
  return DEFAULT_WEIGHTS;
}
