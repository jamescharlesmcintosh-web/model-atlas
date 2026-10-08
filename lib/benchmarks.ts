import { DEMO_BENCHMARKS, DEMO_MODELS } from "./demo-data";
import type { BenchmarkDatapoint } from "./schema";

/** Benchmark source-adapter interface — add real sources later without touching UI. */
export interface BenchmarkAdapter {
  id: string;
  label: string;
  /** license-safe fetch: official API / download / manual import. Never scrape against ToS. */
  fetchForModel?: (modelSlug: string) => Promise<BenchmarkDatapoint[]>;
  fetchAll?: () => Promise<BenchmarkDatapoint[]>;
}

export const demoAdapter: BenchmarkAdapter = {
  id: "demo-fictional",
  label: "Demo fictional harness (clearly labeled, not real)",
  fetchAll: async () => DEMO_BENCHMARKS
};

export const adapters: BenchmarkAdapter[] = [demoAdapter];

/** Register a new permitted source (official API, licensed dump, manual CSV import). */
export function registerAdapter(a: BenchmarkAdapter) {
  if (!adapters.find((x) => x.id === a.id)) adapters.push(a);
}

export function benchmarksFor(slug: string, extra: BenchmarkDatapoint[] = []): BenchmarkDatapoint[] {
  return [...DEMO_BENCHMARKS.filter((b) => b.modelSlug === slug), ...extra.filter((b) => b.modelSlug === slug)];
}

export function benchmarksByCategory(category: string, slugs?: string[]): BenchmarkDatapoint[] {
  return DEMO_BENCHMARKS.filter(
    (b) => b.category === category && (!slugs || slugs.includes(b.modelSlug))
  );
}

export function benchmarkCategories(): { id: string; label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const b of DEMO_BENCHMARKS) map.set(b.category, (map.get(b.category) ?? 0) + 1);
  const labels: Record<string, string> = {
    coding: "Coding", reasoning: "Reasoning", agents: "Agents / tool use",
    long_context: "Long context", speed: "Speed / throughput"
  };
  return [...map.entries()].map(([id, count]) => ({ id, label: labels[id] ?? id, count }));
}

/** Normalize 0..maxScore → 0..100 for radar/composite. Never mixes incompatible versions silently. */
export function normalizedScore(b: BenchmarkDatapoint): number | null {
  if (b.maxScore && b.maxScore > 0) return Math.round((b.score / b.maxScore) * 100);
  return null;
}

export function valueScore(args: { quality: number | null; inputPer1M: number | null; outputPer1M: number | null; latencyPenalty?: number }): number | null {
  const { quality, inputPer1M, outputPer1M, latencyPenalty = 0 } = args;
  if (quality == null) return null;
  const cost = (inputPer1M ?? 0) * 3 + (outputPer1M ?? 0); // output-weighted blended cost
  if (cost <= 0) return Math.round(Math.min(100, quality + 8 - latencyPenalty)); // self-host: quality + openness bonus
  const v = quality - Math.log10(cost + 1) * 22 - latencyPenalty;
  return Math.round(Math.max(0, Math.min(100, v)));
}

/** Pick relevant competitors: same tier/modality/price/use-case, not random tiny models. */
export function relevantCompetitors(slug: string, n = 5): typeof DEMO_MODELS {
  const me = DEMO_MODELS.find((m) => m.slug === slug);
  if (!me) return DEMO_MODELS.slice(0, n);
  const meOpen = !!me.openWeight;
  const meMulti = (me.modalities.length ?? 0) > 1;
  const mePrice = me.pricing?.inputPer1M ?? 2;
  return DEMO_MODELS.filter((m) => m.slug !== slug)
    .map((m) => {
      let s = 0;
      if (!!m.openWeight === meOpen) s += 3;
      if ((m.modalities.length > 1) === meMulti) s += 2;
      const p = m.pricing?.inputPer1M ?? 2;
      if (Math.abs(p - mePrice) < 2) s += 2;
      const overlap = m.bestFor.filter((b) => me.bestFor.includes(b)).length;
      s += overlap;
      if (m.modelTypes.some((t) => me.modelTypes.includes(t))) s += 1;
      return { m, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.m);
}

/** Parse admin/dev CSV or JSON import → normalized datapoints (validated, flagged demo:false only if source says so). */
export function parseBenchmarkImport(format: "json" | "csv", payload: string): { points: BenchmarkDatapoint[]; errors: string[] } {
  const errors: string[] = [];
  const points: BenchmarkDatapoint[] = [];
  try {
    if (format === "json") {
      const arr = JSON.parse(payload);
      const list = Array.isArray(arr) ? arr : [arr];
      for (const [i, r] of list.entries()) {
        if (!r?.benchmarkName || !r?.modelSlug || r?.score == null || !r?.sourceUrl) {
          errors.push(`Row ${i}: needs benchmarkName, modelSlug, score, sourceUrl.`);
          continue;
        }
        points.push({
          id: `import-${Date.now()}-${i}`,
          benchmarkName: String(r.benchmarkName),
          category: String(r.category ?? "general"),
          score: Number(r.score),
          maxScore: r.maxScore != null ? Number(r.maxScore) : null,
          unit: String(r.unit ?? "score"),
          modelSlug: String(r.modelSlug),
          evaluationDate: r.evaluationDate ? String(r.evaluationDate) : undefined,
          methodology: r.methodology ? String(r.methodology) : undefined,
          origin: r.origin === "provider" || r.origin === "independent" || r.origin === "community" ? r.origin : "independent",
          sourceUrl: String(r.sourceUrl),
          sourceTitle: r.sourceTitle ? String(r.sourceTitle) : undefined,
          reliability: r.reliability ?? "low",
          caveats: r.caveats ? String(r.caveats) : "Manually imported — verify methodology before comparing.",
          isDemo: false
        });
      }
    } else {
      const lines = payload.trim().split(/\r?\n/);
      const head = (lines.shift() ?? "").split(",").map((h) => h.trim());
      const need = ["benchmarkName", "modelSlug", "score", "sourceUrl"];
      for (const n of need) if (!head.includes(n)) errors.push(`CSV missing column: ${n}`);
      for (const [i, line] of lines.entries()) {
        if (!line.trim()) continue;
        const cells = line.split(",").map((c) => c.trim());
        const r: Record<string, string> = {};
        head.forEach((h, j) => (r[h] = cells[j] ?? ""));
        if (!r.benchmarkName || !r.modelSlug || !r.score || !r.sourceUrl) {
          errors.push(`CSV row ${i + 2}: needs benchmarkName, modelSlug, score, sourceUrl.`);
          continue;
        }
        points.push({
          id: `import-${Date.now()}-${i}`,
          benchmarkName: r.benchmarkName,
          category: r.category || "general",
          score: Number(r.score),
          maxScore: r.maxScore ? Number(r.maxScore) : null,
          unit: r.unit || "score",
          modelSlug: r.modelSlug,
          evaluationDate: r.evaluationDate || undefined,
          methodology: r.methodology || undefined,
          origin: (r.origin as any) || "independent",
          sourceUrl: r.sourceUrl,
          reliability: (r.reliability as any) || "low",
          caveats: r.caveats || "Manually imported — verify methodology before comparing.",
          isDemo: false
        });
      }
    }
  } catch (e: any) {
    errors.push(`Parse error: ${e?.message ?? e}`);
  }
  return { points, errors };
}
