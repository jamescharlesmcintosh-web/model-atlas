"use client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  ScatterChart, Scatter, ZAxis, Cell
} from "recharts";
import type { BenchmarkDatapoint, Model } from "@/lib/schema";
import { normalizedScore } from "@/lib/benchmarks";

const COLORS = ["#7c6cff", "#5eead4", "#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#fb7185", "#a78bfa"];

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="max-w-[260px] rounded-lg border border-white/10 bg-ink-900/95 p-2.5 text-xs text-slate-200 shadow-card">
      <p className="font-semibold text-white">{label ?? payload[0]?.name ?? payload[0]?.payload?.name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono">{p.name}: {p.value}{p.payload?.unit ? ` ${p.payload.unit}` : ""}</p>
      ))}
      {payload[0]?.payload?.caveats && <p className="mt-1 text-amber-200/90">⚠ {payload[0].payload.caveats}</p>}
      {payload[0]?.payload?.sourceUrl && <p className="mt-1 break-all text-sky-300">{payload[0].payload.sourceUrl}</p>}
    </div>
  );
}

export function BenchmarkBars({ points, models }: { points: BenchmarkDatapoint[]; models: Model[] }) {
  const nameOf = (slug: string) => models.find((m) => m.slug === slug)?.name ?? slug;
  const data = points.map((p) => ({ name: nameOf(p.modelSlug), value: p.score, unit: p.unit, caveats: p.caveats, sourceUrl: p.sourceUrl, origin: p.origin }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
          <XAxis type="number" tick={{ fill: "#9aa4b8", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#e2e8f0", fontSize: 11 }} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CapabilityRadar({ models }: { models: Model[] }) {
  const dims = ["coding", "reasoning", "agent", "writing", "long_context", "multimodal", "structured", "speed", "cost", "privacy"] as const;
  const labels: Record<string, string> = { coding: "Code", reasoning: "Reason", agent: "Agent", writing: "Write", long_context: "LongCtx", multimodal: "Multi", structured: "Struct", speed: "Speed", cost: "Cost", privacy: "Privacy" };
  const data = dims.map((d) => {
    const row: Record<string, unknown> = { dim: labels[d] };
    for (const m of models) row[m.name] = m.scores.find((s) => s.dimension === d)?.score ?? 0;
    return row;
  });
  return (
    <div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,.12)" />
            <PolarAngleAxis dataKey="dim" tick={{ fill: "#9aa4b8", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            {models.slice(0, 4).map((m, i) => (
              <Radar key={m.slug} name={m.name} dataKey={m.name} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.18} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11, color: "#cbd5e1" }} />
            <Tooltip content={<Tip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">Normalized composite scores (0–100) from source-backed specs + explicitly labeled interpretation. Missing data renders as 0 here and “Unknown” everywhere else — the radar is less precise than it looks; check Evidence.</p>
    </div>
  );
}

export function CostQuality({ models }: { models: Model[] }) {
  const data = models.map((m, i) => ({
    name: m.name,
    cost: (m.pricing?.inputPer1M ?? 0) * 3 + (m.pricing?.outputPer1M ?? 0),
    quality: Math.round(((m.scores.find((s) => s.dimension === "coding")?.score ?? 50) + (m.scores.find((s) => s.dimension === "reasoning")?.score ?? 50)) / 2),
    ctx: m.contextWindow ?? 32000,
    color: COLORS[i % COLORS.length]
  }));
  return (
    <div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10 }}>
            <CartesianGrid stroke="rgba(255,255,255,.08)" />
            <XAxis dataKey="cost" name="blended cost" tick={{ fill: "#9aa4b8", fontSize: 11 }} label={{ value: "blended cost (in×3+out $/1M)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 10 }} />
            <YAxis dataKey="quality" name="quality" domain={[0, 100]} tick={{ fill: "#9aa4b8", fontSize: 11 }} label={{ value: "quality", angle: -90, fill: "#64748b", fontSize: 10 }} />
            <ZAxis dataKey="ctx" range={[60, 400]} name="context" />
            <Tooltip content={<Tip />} />
            <Scatter data={data}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-400">Data may vary by provider, region, and pricing tier. Bubble size = advertised context window (not effective recall).</p>
    </div>
  );
}

export function SpeedQuality({ models, points }: { models: Model[]; points: BenchmarkDatapoint[] }) {
  const tps = new Map(points.filter((p) => p.category === "speed").map((p) => [p.modelSlug, p.score]));
  const data = models.map((m) => ({
    name: m.name,
    tps: tps.get(m.slug) ?? null,
    quality: m.scores.find((s) => s.dimension === "coding")?.score ?? null
  })).filter((d) => d.tps != null);
  if (!data.length) return <p className="text-sm italic text-slate-400">No comparable throughput figures — methods differ across providers, so nothing is plotted rather than mixing incompatible metrics.</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <ScatterChart>
          <CartesianGrid stroke="rgba(255,255,255,.08)" />
          <XAxis dataKey="tps" name="tok/s" tick={{ fill: "#9aa4b8", fontSize: 11 }} label={{ value: "tokens/sec (demo harness — not comparable across regions)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 10 }} />
          <YAxis dataKey="quality" domain={[0, 100]} tick={{ fill: "#9aa4b8", fontSize: 11 }} />
          <ZAxis range={[120, 120]} />
          <Tooltip content={<Tip />} />
          <Scatter data={data} fill="#5eead4" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContextBars({ models }: { models: Model[] }) {
  const data = models.map((m, i) => ({
    name: m.name,
    advertised: m.contextWindow ?? 0,
    effective: m.effectiveContextWindow ?? 0,
    color: COLORS[i % COLORS.length]
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
          <XAxis type="number" tick={{ fill: "#9aa4b8", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#e2e8f0", fontSize: 11 }} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="advertised" name="advertised ctx" fill="#7c6cff" radius={[0, 6, 6, 0]} />
          <Bar dataKey="effective" name="effective (tested)" fill="#fbbf24" radius={[0, 6, 6, 0]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ValueBars({ models }: { models: Model[] }) {
  const data = models.map((m) => {
    const q = Math.round(((m.scores.find((s) => s.dimension === "coding")?.score ?? 0) + (m.scores.find((s) => s.dimension === "reasoning")?.score ?? 0)) / 2);
    const blended = (m.pricing?.inputPer1M ?? 0) * 3 + (m.pricing?.outputPer1M ?? 0);
    const value = blended <= 0 ? Math.min(100, q + 8) : Math.max(0, Math.round(q - Math.log10(blended + 1) * 22));
    return { name: m.name, value, quality: q, normalized: normalizedScore({ score: q, maxScore: 100 } as any) };
  }).sort((a, b) => b.value - a.value);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9aa4b8", fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#e2e8f0", fontSize: 11 }} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="value" name="value (quality − log cost)" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
