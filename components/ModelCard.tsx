"use client";
import Link from "next/link";
import { GitCompareArrows, ExternalLink } from "lucide-react";
import type { Model } from "@/lib/schema";
import { overallScore } from "@/lib/scoring";
import { fmtCtx, fmtPrice, cn } from "@/lib/utils";
import { Badge, ScoreBar, VerifyBadge } from "./ui";

export default function ModelCard({
  model, selected, onToggleCompare, onOpen
}: {
  model: Model;
  selected?: boolean;
  onToggleCompare?: () => void;
  onOpen?: () => void;
}) {
  const overall = overallScore(model);
  const top = [...model.scores].sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).slice(0, 4);
  return (
    <article className={cn("glass group rounded-2xl p-4 transition hover:border-white/20", selected && "border-accent/60 ring-1 ring-accent/40")}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent/70 to-mint/60 text-base font-bold text-white">{model.name[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white">{model.name}</h3>
            <VerifyBadge status={model.isDemo ? "demo" : "verified"} />
          </div>
          <p className="truncate text-xs text-slate-400">{model.provider}{model.family ? ` · ${model.family}` : ""}{model.exactVersion ? ` · ${model.exactVersion}` : ""}</p>
        </div>
        <span className="text-right">
          <span className="block font-mono text-lg font-bold text-white">{overall ?? "—"}</span>
          <span className="block text-[10px] uppercase tracking-wide text-slate-400">overall</span>
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-300">{model.oneLiner}</p>

      <div className="mt-3 space-y-1.5">
        {top.map((s) => (
          <div key={s.dimension} className="grid grid-cols-[86px_1fr] items-center gap-2 text-[11px]">
            <span className="text-slate-400">{s.dimension.replace("_", " ")}</span>
            <ScoreBar value={s.score} />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Best for</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {model.bestFor.slice(0, 3).map((b) => <Badge key={b} tone="mint">{b}</Badge>)}
          {model.contextWindow ? <Badge>ctx {fmtCtx(model.contextWindow)}</Badge> : null}
          {model.pricing ? <Badge>{fmtPrice(model.pricing.inputPer1M)}/{fmtPrice(model.pricing.outputPer1M)} per 1M</Badge> : null}
          {model.openWeight ? <Badge tone="violet">open-weight</Badge> : <Badge>API-only</Badge>}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link href={`/models/${model.slug}`} onClick={onOpen} className="flex-1 rounded-lg bg-white/8 border border-white/10 bg-white/5 px-3 py-2 text-center text-[13px] font-semibold text-white hover:bg-white/10">
          Open intelligence →
        </Link>
        {model.officialSourceUrl && (
          <a href={model.officialSourceUrl} target="_blank" rel="noreferrer" title="Primary official source" className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10"><ExternalLink size={15} /></a>
        )}
        {onToggleCompare && (
          <button onClick={onToggleCompare} title="Add to head-to-head (2–4)" className={cn("rounded-lg border p-2", selected ? "border-accent/60 bg-accent/20 text-white" : "border-white/10 text-slate-300 hover:bg-white/10")}>
            <GitCompareArrows size={15} />
          </button>
        )}
      </div>
      <p className="mt-2 font-mono text-[10px] text-slate-500">confidence {model.confidenceOverall}/100 · {model.dataQuality} · {model.isDemo ? "DEMO" : "sourced"}</p>
    </article>
  );
}
