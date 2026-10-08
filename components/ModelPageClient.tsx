"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Copy, Check, RefreshCw, FlaskConical } from "lucide-react";
import type { BenchmarkDatapoint, Model } from "@/lib/schema";
import { CAPABILITY_LABELS } from "@/lib/schema";
import { DEMO_MODELS, DEMO_BENCHMARKS } from "@/lib/demo-data";
import { benchmarkCategories, benchmarksByCategory, relevantCompetitors } from "@/lib/benchmarks";
import { markViewed } from "@/lib/store";
import { shareSummary } from "@/lib/export";
import { fmtCtx, fmtPrice, cn, timeAgo } from "@/lib/utils";
import { Badge, ConfDot, DataQualityBadge, DemoBanner, ScoreBar, SectionTitle, VerifyBadge } from "./ui";
import EvidenceTab from "./Evidence";
import GetPanel from "./GetPanel";
import { BenchmarkBars, CapabilityRadar, ContextBars, CostQuality, SpeedQuality, ValueBars } from "./Charts";

const TABS = ["Overview", "Capabilities", "Benchmarks", "Compare", "Evidence"] as const;

export default function ModelPageClient({ model }: { model: Model }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [benchCat, setBenchCat] = useState("coding");
  const [copied, setCopied] = useState(false);
  const [compareSlugs, setCompareSlugs] = useState<string[]>(() => relevantCompetitors(model.slug, 3).map((m) => m.slug));
  const [staleNote, setStaleNote] = useState<string | null>(null);

  useEffect(() => { markViewed(model.slug); }, [model.slug]);

  const competitors = useMemo(
    () => compareSlugs.map((s) => DEMO_MODELS.find((m) => m.slug === s)).filter(Boolean) as Model[],
    [compareSlugs]
  );
  const allForCharts = useMemo(() => [model, ...competitors.filter((c) => c.slug !== model.slug)], [model, competitors]);
  const catPoints = useMemo(() => benchmarksByCategory(benchCat, allForCharts.map((m) => m.slug)), [benchCat, allForCharts]);
  const myBench = useMemo(() => DEMO_BENCHMARKS.filter((b) => b.modelSlug === model.slug), [model.slug]);
  const cats = benchmarkCategories();

  const stale = useMemo(() => {
    const age = Date.now() - new Date(model.lastChecked).getTime();
    return age > 1000 * 60 * 60 * 24 * 30;
  }, [model.lastChecked]);

  function toggleCompare(slug: string) {
    setCompareSlugs((cur) => cur.includes(slug) ? cur.filter((x) => x !== slug) : cur.length >= 3 ? [...cur.slice(1), slug] : [...cur, slug]);
  }

  return (
    <div className="space-y-5 py-6">
      {model.isDemo && <DemoBanner />}
      {/* header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-mint text-2xl font-bold text-ink-950">{model.name[0]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="editorial-headline text-3xl text-white">{model.name}</h1>
              <VerifyBadge status={model.isDemo ? "demo" : "verified"} />
              <DataQualityBadge level={model.dataQuality} />
            </div>
            <p className="mt-1 text-sm text-slate-300">{model.provider}{model.family ? ` · ${model.family}` : ""}{model.exactVersion ? ` · ${model.exactVersion}` : ""}{model.releaseDate ? ` · released ${model.releaseDate}` : " · release date unverified"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {model.modelTypes.map((t) => <Badge key={t} tone="violet">{t}</Badge>)}
              {model.openWeight ? <Badge tone="mint">open-weight</Badge> : <Badge>proprietary API</Badge>}
              {model.selfHostable ? <Badge tone="mint">self-hostable</Badge> : null}
            </div>
            <p className="mt-3 max-w-3xl border-l-2 border-accent/60 pl-3 text-[15px] italic leading-relaxed text-slate-100">“{model.oneLiner}” <VerifyBadge status={model.oneLinerStatus} className="ml-1 align-middle" /></p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Best for</p>
                <div className="mt-1 flex flex-wrap gap-1.5">{model.bestFor.map((b) => <Badge key={b} tone="mint">{b}</Badge>)}</div>
              </div>
              <div className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-200">Avoid for</p>
                <div className="mt-1 flex flex-wrap gap-1.5">{model.avoidFor.map((b) => <Badge key={b} tone="rose">{b}</Badge>)}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {model.officialSourceUrl && <a href={model.officialSourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-white hover:bg-white/10"><ExternalLink size={13} /> Official source</a>}
              <button onClick={() => { navigator.clipboard.writeText(shareSummary(model)); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy summary"}</button>
              <button onClick={() => setStaleNote("Refresh requested — in demo mode this re-reads the fictional harness. With live adapters each source refreshes independently; snapshots are versioned.")} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"><RefreshCw size={13} /> Manual refresh</button>
              <span className="font-mono text-[11px] text-slate-400">Last checked {timeAgo(model.lastChecked)} · Last source update {model.lastSourceUpdate ?? "unknown"} · confidence {model.confidenceOverall}/100</span>
              {stale && <Badge tone="amber">Stale — re-verify before prod</Badge>}
            </div>
            {staleNote && <p className="mt-2 rounded-lg border border-sky-300/25 bg-sky-300/10 px-3 py-2 text-xs text-sky-100">{staleNote}</p>}
          </div>
          <div className="grid w-full gap-2 rounded-xl border border-white/10 bg-black/25 p-3 text-center sm:w-40">
            <div><p className="font-mono text-3xl font-bold text-white">{model.confidenceOverall}</p><p className="text-[10px] uppercase tracking-wide text-slate-400">confidence</p></div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div className="rounded-lg bg-white/5 p-1.5"><p className="font-mono font-bold text-white">{fmtCtx(model.contextWindow)}</p><p className="text-slate-400">context</p></div>
              <div className="rounded-lg bg-white/5 p-1.5"><p className="font-mono font-bold text-white">{fmtPrice(model.pricing?.inputPer1M)}</p><p className="text-slate-400">in / 1M</p></div>
            </div>
            <p className="text-[10px] text-slate-500">Tradeoff: {model.tradeoffs ?? "see Compare"}</p>
          </div>
        </div>
        {/* tabs */}
        <div className="mt-4 flex gap-1 overflow-x-auto border-t border-white/10 pt-3">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-lg px-4 py-2 text-sm font-semibold", tab === t ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>{t}</button>
          ))}
          <Link href={`/compare?m=${[model.slug, ...compareSlugs].slice(0, 4).join(",")}`} className="ml-auto shrink-0 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-white hover:bg-accent/25">Head-to-head →</Link>
        </div>
      </div>

      {tab === "Overview" && (
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="glass rounded-2xl p-4 lg:col-span-3">
            <SectionTitle kicker="Capability profile" title="What it's genuinely good at" sub="Scores 0–100 with confidence. Missing data shows as Unknown — never a precise-looking guess." />
            <div className="mt-3 space-y-2.5">
              {model.capabilities.map((c) => (
                <div key={c.category} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="w-44 shrink-0 font-medium text-slate-200">{CAPABILITY_LABELS[c.category]}</span>
                    <span className="flex-1"><ScoreBar value={c.score} /></span>
                    <ConfDot level={c.confidence} />
                    <span className="w-16 text-right font-mono text-[10px] uppercase text-slate-400">{c.confidence}</span>
                  </div>
                  <p className="mt-1 pl-[176px] text-xs text-slate-400">{c.explanation} <VerifyBadge status={c.explanationStatus} /></p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 lg:col-span-2">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white">Key benchmark (demo)</h3>
              <div className="mt-2"><BenchmarkBars points={myBench.filter((b) => b.category === benchCat).length ? myBench.filter((b) => b.category === benchCat) : myBench.slice(0, 4)} models={[model]} /></div>
              <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-200/90"><FlaskConical size={12} className="mt-0.5 shrink-0" /> Fictional demo values. Reputation-vs-data verdicts require dated, sourced benchmarks — see Benchmarks tab.</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white">Best alternatives</h3>
              <div className="mt-2 space-y-2">
                {relevantCompetitors(model.slug, 3).map((c) => (
                  <Link key={c.slug} href={`/models/${c.slug}`} className="block rounded-xl border border-white/10 bg-white/[0.03] p-2.5 hover:border-white/25">
                    <p className="text-[13px] font-semibold text-white">{c.name} <span className="font-normal text-slate-400">· {c.provider}</span></p>
                    <p className="line-clamp-1 text-xs text-slate-400">{c.oneLiner}</p>
                  </Link>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Competitors chosen by tier, modality, price, use-case, availability, and benchmark coverage — not at random.</p>
            </div>
            <GetPanel model={model} />
          </div>
        </div>
      )}

      {tab === "Capabilities" && (
        <div className="glass rounded-2xl p-4">
          <SectionTitle kicker="Full profile" title="Real-world capability profile" sub="Every score carries confidence + practical meaning + source trace. Sourced metrics and interpretation are visually distinct." />
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2">Category</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Confidence</th><th className="px-3 py-2">What it means</th></tr>
              </thead>
              <tbody>
                {model.capabilities.map((c) => (
                  <tr key={c.category} className="border-t border-white/5">
                    <td className="px-3 py-2 font-medium text-white">{CAPABILITY_LABELS[c.category]}</td>
                    <td className="min-w-[180px] px-3 py-2"><ScoreBar value={c.score} /></td>
                    <td className="px-3 py-2"><span className="inline-flex items-center gap-1.5 text-xs text-slate-300"><ConfDot level={c.confidence} />{c.confidence}</span></td>
                    <td className="px-3 py-2 text-slate-300">{c.explanation} <VerifyBadge status={c.explanationStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Benchmarks" && (
        <div className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <SectionTitle kicker="Benchmarks" title="Benchmark & evaluation charts" sub="Fictional demo harness below. Architecture supports official cards, leaderboards, licensed dumps, and manual CSV/JSON imports." />
              <select value={benchCat} onChange={(e) => setBenchCat(e.target.value)} className="ml-auto rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm">
                {cats.map((c) => <option key={c.id} value={c.id} className="bg-ink-900">{c.label} ({c.count})</option>)}
              </select>
            </div>
            <h4 className="mt-4 text-sm font-semibold text-white">1 · Benchmark comparison — {benchCat} (vs 5–10 relevant competitors)</h4>
            <BenchmarkBars points={catPoints} models={allForCharts} />
            <p className="mt-1 text-[11px] text-slate-400">Non-equivalent benchmark versions are never mixed without a visible warning. Click a bar's tooltip for methodology, date, origin, reliability, and caveats.</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div><h4 className="text-sm font-semibold text-white">2 · Capability radar (normalized composite)</h4><CapabilityRadar models={allForCharts.slice(0, 3)} /></div>
              <div><h4 className="text-sm font-semibold text-white">3 · Cost vs quality</h4><CostQuality models={allForCharts} /></div>
              <div><h4 className="text-sm font-semibold text-white">4 · Speed vs quality</h4><SpeedQuality models={allForCharts} points={DEMO_BENCHMARKS} /></div>
              <div><h4 className="text-sm font-semibold text-white">5 · Context window (advertised vs effective)</h4><ContextBars models={allForCharts} /></div>
            </div>
            <div className="mt-3"><h4 className="text-sm font-semibold text-white">6 · Value for money (transparent: quality − log cost)</h4><ValueBars models={allForCharts} /></div>
          </div>
          <div className="glass rounded-2xl p-4">
            <h4 className="text-sm font-semibold text-white">Datapoints ({myBench.length}) — every point traceable</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-white/5 uppercase tracking-wide text-slate-400"><tr><th className="px-2 py-2">Benchmark</th><th className="px-2 py-2">Score</th><th className="px-2 py-2">Date</th><th className="px-2 py-2">Origin</th><th className="px-2 py-2">Reliability</th><th className="px-2 py-2">Source</th><th className="px-2 py-2">Caveats</th></tr></thead>
                <tbody>
                  {myBench.map((b: BenchmarkDatapoint) => (
                    <tr key={b.id} className="border-t border-white/5">
                      <td className="px-2 py-1.5 font-semibold text-white">{b.benchmarkName}<span className="block font-normal text-slate-400">{b.methodology}</span></td>
                      <td className="px-2 py-1.5 font-mono">{b.score}{b.maxScore ? ` / ${b.maxScore}` : ""} {b.unit}</td>
                      <td className="px-2 py-1.5 font-mono text-slate-400">{b.evaluationDate?.slice(0, 10) ?? "—"}</td>
                      <td className="px-2 py-1.5"><Badge tone={b.origin === "demo" ? "amber" : "sky"}>{b.origin}</Badge></td>
                      <td className="px-2 py-1.5">{b.reliability}</td>
                      <td className="px-2 py-1.5"><a href={b.sourceUrl} target="_blank" rel="noreferrer" className="break-all text-sky-300 hover:underline">{b.sourceTitle ?? b.sourceUrl}</a></td>
                      <td className="px-2 py-1.5 text-amber-200/90">{b.caveats ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300">
              <summary className="cursor-pointer font-semibold text-white">Admin / developer: import updated CSV or JSON</summary>
              <p className="mt-1">POST to <code className="font-mono text-sky-300">/api/benchmarks/import</code> with <code className="font-mono">{"{ format: 'json'|'csv', payload }"}</code>. JSON rows need benchmarkName, modelSlug, score, sourceUrl (+ optional category, maxScore, methodology, evaluationDate, origin, reliability, caveats). Each source refreshes independently; keep snapshots to show price/rank changes.</p>
              <p className="mt-1 text-slate-400">Example JSON row: <code className="font-mono">{"{ \"benchmarkName\": \"SWE-bench\", \"category\": \"coding\", \"modelSlug\": \""}{model.slug}{"\", \"score\": 71.2, \"maxScore\": 100, \"sourceUrl\": \"https://…\" }"}</code></p>
            </details>
          </div>
        </div>
      )}

      {tab === "Compare" && (
        <CompareSection model={model} competitors={competitors} all={allForCharts} compareSlugs={compareSlugs} onToggle={toggleCompare} />
      )}

      {tab === "Evidence" && (
        <div className="glass rounded-2xl p-4"><EvidenceTab model={model} /></div>
      )}
    </div>
  );
}

function CompareSection({ model, competitors, all, compareSlugs, onToggle }: { model: Model; competitors: Model[]; all: Model[]; compareSlugs: string[]; onToggle: (s: string) => void }) {
  const rows: { label: string; get: (m: Model) => React.ReactNode }[] = [
    { label: "Best use case", get: (m) => m.bestFor.slice(0, 2).join("; ") || "Unknown" },
    { label: "Coding", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === "coding")?.score ?? null} /> },
    { label: "Reasoning", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === "reasoning")?.score ?? null} /> },
    { label: "Agent / tool use", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === "agent")?.score ?? null} /> },
    { label: "Structured output", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === "structured")?.score ?? null} /> },
    { label: "Long context", get: (m) => `${fmtCtx(m.contextWindow)}${m.effectiveContextWindow ? ` (eff. ${fmtCtx(m.effectiveContextWindow)})` : " (effective unverified)"}` },
    { label: "Multimodal", get: (m) => m.modalities.join(", ") || "Unknown" },
    { label: "Cost", get: (m) => `${fmtPrice(m.pricing?.inputPer1M)} in / ${fmtPrice(m.pricing?.outputPer1M)} out` },
    { label: "Speed", get: (m) => m.speedNote ?? "Unknown" },
    { label: "Privacy / self-host", get: (m) => m.selfHostable ? "Self-hostable" : m.openWeight ? "Open weights" : "API-only" },
    { label: "Source confidence", get: (m) => `${m.confidenceOverall}/100 · ${m.dataQuality}` }
  ];
  const myCoding = model.scores.find((s) => s.dimension === "coding")?.score ?? 0;
  return (
    <div className="space-y-3">
      <div className="glass rounded-2xl p-4">
        <SectionTitle kicker="How it compares" title="Against relevant alternatives" sub="Chosen by tier, modality, price, use-case, availability, and benchmark coverage." />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEMO_MODELS.filter((m) => m.slug !== model.slug).map((m) => (
            <button key={m.slug} onClick={() => onToggle(m.slug)} className={cn("rounded-full border px-3 py-1 text-xs", compareSlugs.includes(m.slug) ? "border-accent/60 bg-accent/20 text-white" : "border-white/10 bg-white/5 text-slate-300")}>{m.name}</button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 text-[13px]"><strong className="text-emerald-200">Choose {model.name} if…</strong><p className="mt-1 text-slate-200">{model.bestFor.join(" · ")}. Strengths: {model.scores.filter((s) => (s.score ?? 0) >= 85).map((s) => s.dimension).join(", ") || "balanced, no standout"}.</p></div>
          <div className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-3 text-[13px]"><strong className="text-rose-200">Choose an alternative if…</strong><p className="mt-1 text-slate-200">Lowest cost → Atlas Mock Mini (demo). Self-host → {relevantCompetitors(model.slug, 2).filter((m) => m.selfHostable).map((m) => m.name).join(", ") || "verify options"}. Longest docs → Gemini 2.5 Pro (demo). Frontier coding duel → {myCoding >= 88 ? "GPT-4.1 (demo)" : "Claude Sonnet 4.5 (demo)"}.</p></div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-white/5"><tr><th className="px-3 py-2 text-slate-400">Category</th><th className="px-3 py-2 text-white">{model.name} ★</th>{competitors.map((c) => <th key={c.slug} className="px-3 py-2"><Link href={`/models/${c.slug}`} className="text-white hover:underline">{c.name}</Link></th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-white/5"><td className="px-3 py-2 font-medium text-slate-300">{r.label}</td><td className="px-3 py-2 text-slate-100">{r.get(model)}</td>{competitors.map((c) => <td key={c.slug} className="px-3 py-2 text-slate-300">{r.get(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="glass rounded-2xl p-4"><h4 className="text-sm font-semibold text-white">Benchmarks side-by-side</h4><div className="mt-2"><BenchmarkBars points={DEMO_BENCHMARKS.filter((b) => b.category === "coding" && all.map((m) => m.slug).includes(b.modelSlug))} models={all} /></div></div>
        <div className="glass rounded-2xl p-4"><h4 className="text-sm font-semibold text-white">Cost vs quality</h4><div className="mt-2"><CostQuality models={all} /></div></div>
        <div className="glass rounded-2xl p-4"><h4 className="text-sm font-semibold text-white">Context</h4><div className="mt-2"><ContextBars models={all} /></div></div>
        <div className="glass rounded-2xl p-4"><h4 className="text-sm font-semibold text-white">Radar</h4><div className="mt-2"><CapabilityRadar models={all.slice(0, 3)} /></div></div>
      </div>
      <Link href={`/compare?m=${[model.slug, ...compareSlugs].slice(0, 4).join(",")}`} className="block rounded-2xl bg-gradient-to-r from-accent to-mint p-4 text-center font-semibold text-ink-950">Open full head-to-head (2–4 models) →</Link>
    </div>
  );
}
