"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { DEMO_MODELS, DEMO_BENCHMARKS } from "@/lib/demo-data";
import type { ScoreDimension } from "@/lib/schema";
import { Badge, DemoBanner, ScoreBar, VerifyBadge } from "./ui";
import { BenchmarkBars, CapabilityRadar, ContextBars, CostQuality } from "./Charts";
import { fmtCtx, fmtPrice, cn } from "@/lib/utils";

export default function CompareClient({ initialSlugs }: { initialSlugs: string[] }) {
  const [slugs, setSlugs] = useState<string[]>(initialSlugs.filter((s) => DEMO_MODELS.some((m) => m.slug === s)).slice(0, 4));
  const models = useMemo(() => slugs.map((s) => DEMO_MODELS.find((m) => m.slug === s)!).filter(Boolean), [slugs]);

  function toggle(slug: string) {
    setSlugs((cur) => cur.includes(slug) ? cur.filter((x) => x !== slug) : cur.length >= 4 ? [...cur.slice(1), slug] : [...cur, slug]);
  }

  const rows: { label: string; get: (m: (typeof DEMO_MODELS)[number]) => React.ReactNode }[] = [
    { label: "Best use case", get: (m) => m.bestFor.slice(0, 2).join("; ") },
    { label: "Coding", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === ("coding" as ScoreDimension))?.score ?? null} /> },
    { label: "Reasoning", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === ("reasoning" as ScoreDimension))?.score ?? null} /> },
    { label: "Agent / tool use", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === ("agent" as ScoreDimension))?.score ?? null} /> },
    { label: "Structured output", get: (m) => <ScoreBar value={m.scores.find((s) => s.dimension === ("structured" as ScoreDimension))?.score ?? null} /> },
    { label: "Long context", get: (m) => fmtCtx(m.contextWindow) },
    { label: "Multimodal", get: (m) => m.modalities.join(", ") || "Unknown" },
    { label: "Cost", get: (m) => `${fmtPrice(m.pricing?.inputPer1M)} / ${fmtPrice(m.pricing?.outputPer1M)}` },
    { label: "Speed", get: (m) => m.speedNote ?? "Unknown" },
    { label: "Privacy / self-host", get: (m) => m.selfHostable ? "Self-hostable" : "API-only" },
    { label: "Source confidence", get: (m) => <span className="inline-flex items-center gap-2">{m.confidenceOverall}/100 <VerifyBadge status="demo" /></span> }
  ];

  return (
    <div className="space-y-4 py-6">
      <DemoBanner />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">Head-to-head · 2–4 models</p>
        <h1 className="editorial-headline text-3xl text-white">Compare models</h1>
      </div>
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Select 2–4 models</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DEMO_MODELS.map((m) => (
            <button key={m.slug} onClick={() => toggle(m.slug)} className={cn("rounded-full border px-3 py-1 text-xs", slugs.includes(m.slug) ? "border-accent/60 bg-accent/20 text-white" : "border-white/10 bg-white/5 text-slate-300")}>
              {m.name} {slugs.includes(m.slug) ? "✓" : ""}
            </button>
          ))}
        </div>
      </div>
      {models.length < 2 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-slate-400">Pick at least 2 models above. Unknown cells stay “Unknown” — never invented.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="bg-white/5">
                <tr><th className="px-3 py-2 text-slate-400">Category</th>{models.map((m) => <th key={m.slug} className="px-3 py-2"><Link href={`/models/${m.slug}`} className="text-white hover:underline">{m.name}</Link><span className="block text-[11px] font-normal text-slate-400">{m.provider}</span></th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-white/5"><td className="px-3 py-2 font-medium text-slate-300">{r.label}</td>{models.map((m) => <td key={m.slug} className="px-3 py-2 text-slate-200">{r.get(m)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="glass rounded-2xl p-4"><h3 className="text-sm font-semibold text-white">Coding benchmark</h3><BenchmarkBars points={DEMO_BENCHMARKS.filter((b) => b.category === "coding" && slugs.includes(b.modelSlug))} models={models} /></div>
            <div className="glass rounded-2xl p-4"><h3 className="text-sm font-semibold text-white">Radar</h3><CapabilityRadar models={models.slice(0, 4)} /></div>
            <div className="glass rounded-2xl p-4"><h3 className="text-sm font-semibold text-white">Cost vs quality</h3><CostQuality models={models} /></div>
            <div className="glass rounded-2xl p-4"><h3 className="text-sm font-semibold text-white">Context</h3><ContextBars models={models} /></div>
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-white">Strengths & weaknesses</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {models.map((m) => (
                <div key={m.slug} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[13px]">
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="mt-1 text-emerald-200">+ {m.bestFor.join(" · ")}</p>
                  <p className="mt-1 text-rose-200">− {m.avoidFor.join(" · ")}</p>
                  <p className="mt-1 text-slate-400">Choose it if: {m.bestFor[0]}. Choose an alternative if: {m.avoidFor[0]}.</p>
                  <div className="mt-1"><Badge>confidence {m.confidenceOverall}</Badge></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
