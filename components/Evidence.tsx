"use client";
import type { Model } from "@/lib/schema";
import { VerifyBadge, Badge } from "./ui";

export default function EvidenceTab({ model }: { model: Model }) {
  const byId = new Map(model.citations.map((c) => [c.id, c]));
  const groups: Record<string, typeof model.citations> = {};
  for (const c of model.citations) {
    (groups[c.kind] ||= []).push(c);
  }
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm">
        <p className="font-semibold text-white">Every conclusion traces to evidence.</p>
        <ul className="mt-2 grid gap-1 text-[13px] text-slate-300 sm:grid-cols-2">
          <li><VerifyBadge status="verified" /> directly supported by a cited source</li>
          <li><VerifyBadge status="derived" /> calculated from visible data + formula</li>
          <li><VerifyBadge status="interpretation" /> AI conclusion from evidence</li>
          <li><VerifyBadge status="unknown" /> no reliable info — shown, not hidden</li>
          <li><VerifyBadge status="conflicting" /> sources disagree — both shown</li>
          <li><VerifyBadge status="demo" /> fictional demo value</li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">Field-level evidence</h3>
        <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-slate-400">
              <tr><th className="px-3 py-2">Field</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Confidence</th><th className="px-3 py-2">Sources</th><th className="px-3 py-2">Note</th></tr>
            </thead>
            <tbody>
              {Object.entries(model.fieldEvidence).length === 0 && (
                <tr><td colSpan={5} className="px-3 py-3 text-slate-400">Core fields in this demo carry model-level citations; per-field excerpts arrive with the live extraction pass.</td></tr>
              )}
              {Object.entries(model.fieldEvidence).map(([k, v]) => (
                <tr key={k} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-xs text-slate-200">{k}</td>
                  <td className="px-3 py-2"><VerifyBadge status={v.status} /></td>
                  <td className="px-3 py-2 font-mono text-xs">{Math.round(v.confidence * 100)}%</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-sky-300">{v.sourceIds.join(", ") || "—"}</td>
                  <td className="px-3 py-2 text-slate-300">{v.note ?? "—"}</td>
                </tr>
              ))}
              <tr className="border-t border-white/5">
                <td className="px-3 py-2 font-mono text-xs text-slate-200">oneLiner (recommendation)</td>
                <td className="px-3 py-2"><VerifyBadge status={model.oneLinerStatus} /></td>
                <td className="px-3 py-2 font-mono text-xs">{model.confidenceOverall}%</td>
                <td className="px-3 py-2 text-slate-300">capability composite</td>
                <td className="px-3 py-2 text-slate-300">Recommendation, not fact — see capabilities + benchmarks.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">Sources ({model.citations.length})</h3>
        <div className="mt-2 space-y-2">
          {model.citations.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={c.kind === "official" || c.kind === "model-card" ? "mint" : c.kind === "demo" ? "amber" : "sky"}>{c.kind}</Badge>
                <a href={c.url} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-white hover:underline">{c.title}</a>
              </div>
              <p className="mt-1 break-all font-mono text-[11px] text-sky-300">{c.url}</p>
              {c.excerpt && <p className="mt-1 text-[13px] italic text-slate-300">“{c.excerpt}”</p>}
              <p className="mt-1 font-mono text-[10px] text-slate-500">retrieved {c.retrievedAt}{c.publisher ? ` · ${c.publisher}` : ""} · id {c.id}</p>
            </div>
          ))}
          {model.citations.length === 0 && <p className="text-sm text-slate-400">No verified sources yet — fields show Unknown rather than invented citations.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[13px] text-slate-300">
        <p className="font-semibold text-white">Data completeness: {model.dataQuality}</p>
        <p className="mt-1">{model.confidenceExplanation}</p>
        <p className="mt-2 font-mono text-[11px] text-slate-500">Last checked {model.lastChecked} · Last source update {model.lastSourceUpdate ?? "unknown — flag as stale before prod use"} · {model.isDemo ? "DEMO snapshot (fictional)" : "live snapshot"}. Historical snapshots: v1 keeps per-analysis copies in local storage; wire a DB table for diffing later.</p>
      </div>
    </div>
  );
}

export function fieldNote() {
  return null;
}

export function evidenceFor() {
  return null;
}
