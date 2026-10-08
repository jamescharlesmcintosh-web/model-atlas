"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, GitCompareArrows } from "lucide-react";
import { recentlyViewed } from "@/lib/store";
import { DEMO_MODELS } from "@/lib/demo-data";

interface Hit {
  slug: string; name: string; provider: string; family?: string;
  exactVersion?: string; officialSourceUrl?: string; matchedOn: string[]; exact: boolean;
  source?: "demo" | "models.dev";
}

const POPULAR = ["Claude Sonnet", "GPT-4.1", "Gemini Pro", "DeepSeek R1", "Qwen Coder", "Llama 3", "Mistral Large"];

export default function ModelSearch({ autofocus }: { autofocus?: boolean }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [meta, setMeta] = useState<{ needsDisambiguation?: boolean; reason?: string; nlRoute?: { taskId: string; reason: string } | null; liveError?: string }>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewed, setViewed] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setViewed(recentlyViewed()); }, [open]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setHits([]); setMeta({}); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search-models?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setHits(d.matches ?? []);
        setMeta({ needsDisambiguation: d.needsDisambiguation, reason: d.disambiguationReason, nlRoute: d.nlRoute, liveError: d.liveError });
        setOpen(true);
      } finally { setLoading(false); }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  function go(slug: string) {
    router.push(`/models/${slug}`);
  }

  return (
    <div ref={box} className="glass relative rounded-2xl p-4 sm:p-5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Look up a model</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            autoFocus={autofocus}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q.trim() && setOpen(true)}
            onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) go(hits[0].slug); }}
            placeholder='Try “Sonnet”, “GPT-4.1”, “DeepSeek reasoning”…'
            className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {loading && <span className="font-mono text-[11px] text-slate-400">…</span>}
        </div>
        <button onClick={() => hits[0] && go(hits[0].slug)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
          <CornerDownLeft size={15} /> Open top match
        </button>
      </div>

      {meta.nlRoute && q.trim().length > 2 && (
        <button onClick={() => router.push(`/results?demo=1&task=${meta.nlRoute!.taskId}`)} className="mt-2 w-full rounded-xl border border-sky-300/25 bg-sky-300/10 px-3 py-2 text-left text-xs text-sky-100 hover:bg-sky-300/15">
          {meta.nlRoute.reason} <span className="underline underline-offset-2">Open task recommender →</span>
        </button>
      )}

      {open && q.trim() && (
        <div className="absolute inset-x-3 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-850/95 shadow-card backdrop-blur">
          {meta.needsDisambiguation && (
            <p className="border-b border-amber-300/20 bg-amber-300/[0.07] px-3 py-2 text-[11px] text-amber-100">{meta.reason}</p>
          )}
          {meta.liveError && (
            <p className="border-b border-white/5 px-3 py-1.5 font-mono text-[10px] text-slate-500">{meta.liveError}</p>
          )}
          {hits.length === 0 && <p className="px-3 py-4 text-sm text-slate-400">No matches. Try provider, family, or alias — e.g. “Anthropic”, “Qwen”, “llama”.</p>}
          {hits.map((h) => (
            <button key={h.slug} onClick={() => go(h.slug)} className="flex w-full items-center gap-3 border-b border-white/5 px-3 py-2.5 text-left last:border-0 hover:bg-white/5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-accent/60 to-mint/50 text-xs font-bold text-white">{h.name[0]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{h.name} <span className="font-normal text-slate-400">· {h.provider}</span></span>
                <span className="block truncate font-mono text-[11px] text-slate-400">{h.exactVersion ?? h.family ?? ""} · {h.matchedOn.slice(0, 2).join(" · ")}</span>
              </span>
              {h.exact
                ? <span className="rounded-full bg-emerald-300/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">EXACT</span>
                : <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">CANDIDATE</span>}
              {h.source === "models.dev"
                ? <span className="rounded-full bg-mint/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-mint">LIVE</span>
                : <span className="rounded-full bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-200">demo</span>}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400">Popular:</span>
        {POPULAR.map((p) => (
          <button key={p} onClick={() => setQ(p)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200 hover:bg-white/10">{p}</button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
        {viewed.length > 0 && (
          <>
            <span>Recently viewed:</span>
            {viewed.slice(0, 5).map((s) => {
              const m = DEMO_MODELS.find((x) => x.slug === s);
              return <button key={s} onClick={() => go(s)} className="rounded-full border border-white/10 px-2.5 py-0.5 text-slate-200 hover:bg-white/10">{m?.name ?? s}</button>;
            })}
          </>
        )}
        <a href="/compare" className="ml-auto inline-flex items-center gap-1 text-slate-300 hover:text-white"><GitCompareArrows size={12} /> Compare models shortcut</a>
      </div>
    </div>
  );
}
