"use client";
import { cn } from "@/lib/utils";
import type { ConfidenceLevel, DataQuality, VerificationStatus } from "@/lib/schema";

export function Badge({ children, tone = "slate", className }: { children: React.ReactNode; tone?: "slate" | "mint" | "amber" | "violet" | "rose" | "sky"; className?: string }) {
  const tones: Record<string, string> = {
    slate: "border-white/10 bg-white/5 text-slate-200",
    mint: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
    amber: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    violet: "border-violet-300/30 bg-violet-300/10 text-violet-200",
    rose: "border-rose-300/30 bg-rose-300/10 text-rose-200",
    sky: "border-sky-300/30 bg-sky-300/10 text-sky-200"
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>{children}</span>;
}

const VERIFY_STYLE: Record<VerificationStatus, { label: string; cls: string }> = {
  verified: { label: "Verified from source", cls: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" },
  derived: { label: "Derived calculation", cls: "border-sky-300/30 bg-sky-300/10 text-sky-200" },
  interpretation: { label: "Interpretation", cls: "border-violet-300/30 bg-violet-300/10 text-violet-200" },
  inferred: { label: "Reasonable inference", cls: "border-amber-300/30 bg-amber-300/10 text-amber-200" },
  unknown: { label: "Unknown / needs verification", cls: "border-white/15 bg-white/5 text-slate-300" },
  conflicting: { label: "Conflicting sources", cls: "border-rose-300/30 bg-rose-300/10 text-rose-200" },
  demo: { label: "Demo data (fictional)", cls: "border-amber-400/40 bg-amber-400/10 text-amber-200" }
};

export function VerifyBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const s = VERIFY_STYLE[status];
  return <span title={s.label} className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", s.cls, className)}>{s.label}</span>;
}

export function DataQualityBadge({ level }: { level: DataQuality }) {
  const map: Record<DataQuality, { t: string; tone: "mint" | "sky" | "amber" | "rose" }> = {
    strong: { t: "Strong evidence", tone: "mint" },
    partial: { t: "Partial evidence", tone: "sky" },
    sparse: { t: "Sparse evidence", tone: "amber" },
    none: { t: "No verified coverage", tone: "rose" }
  };
  const m = map[level];
  return <Badge tone={m.tone}>{m.t}</Badge>;
}

export function ConfDot({ level }: { level: ConfidenceLevel }) {
  const c = level === "high" ? "bg-emerald-300" : level === "medium" ? "bg-sky-300" : level === "low" ? "bg-amber-300" : "bg-slate-500";
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", c)} title={`Confidence: ${level}`} />;
}

export function ScoreBar({ value, tone }: { value: number | null; tone?: string }) {
  if (value == null) return <span className="text-xs italic text-slate-400">Not enough verified data</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full bg-gradient-to-r from-accent to-mint", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-xs text-slate-200">{value}</span>
    </div>
  );
}

export function DemoBanner({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100">
      <strong>Demo dataset — fictional values for UI testing, not live data.</strong>
      {!compact && <span className="text-amber-200/80"> Swap in permitted real sources via the benchmark adapters (official APIs, licensed dumps, manual CSV import). Never present demo scores as real.</span>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} />;
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
      <div>
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        {hint && <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div>
      {kicker && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">{kicker}</p>}
      <h2 className="editorial-headline mt-1 text-2xl text-white">{title}</h2>
      {sub && <p className="mt-1 max-w-2xl text-sm text-slate-400">{sub}</p>}
    </div>
  );
}
