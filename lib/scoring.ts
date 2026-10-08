import type { Model, ScoreDimension } from "./schema";

/**
 * Transparent scoring. No fake precision:
 * - null score stays null (rendered as "Not enough verified data")
 * - confidence degrades when data is demo/interpretation-heavy
 * - weighted rank explains itself via per-dimension contributions
 */

export const DIMENSIONS: ScoreDimension[] = [
  "coding", "reasoning", "agent", "writing", "long_context",
  "multimodal", "structured", "speed", "cost", "privacy"
];

export function scoreMap(model: Model): Record<ScoreDimension, number | null> {
  const m = {} as Record<ScoreDimension, number | null>;
  for (const d of DIMENSIONS) m[d] = null;
  for (const s of model.scores) m[s.dimension] = s.score;
  return m;
}

export function overallScore(model: Model): number | null {
  const vals = model.scores.map((s) => s.score).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export interface WeightedResult {
  slug: string;
  total: number;
  contributions: { dimension: ScoreDimension; weight: number; score: number | null; weighted: number }[];
  coverage: number; // 0..1 fraction of weighted dims with data
  confidencePenalty: number;
}

export function weightedScore(
  model: Model,
  weights: Record<ScoreDimension, number>
): WeightedResult {
  const map = scoreMap(model);
  let total = 0;
  let weightSum = 0;
  let coveredWeight = 0;
  const contributions = DIMENSIONS.map((d) => {
    const w = weights[d] ?? 0;
    const s = map[d];
    const weighted = s == null ? 0 : s * w;
    total += weighted;
    weightSum += w;
    if (s != null) coveredWeight += w;
    return { dimension: d, weight: w, score: s, weighted };
  });
  const norm = weightSum > 0 ? total / weightSum : 0;
  const coverage = weightSum > 0 ? coveredWeight / weightSum : 0;
  // Penalize low-confidence / demo-heavy models so unknowns rank below verified data
  const lowConf = model.scores.filter((s) => s.confidence === "low" || s.confidence === "insufficient").length;
  const confidencePenalty = Math.min(12, lowConf * 2 + (model.isDemo ? 4 : 0) + (model.dataQuality === "sparse" ? 3 : 0));
  return {
    slug: model.slug,
    total: Math.round(Math.max(0, norm - confidencePenalty) * 10) / 10,
    contributions,
    coverage: Math.round(coverage * 100) / 100,
    confidencePenalty
  };
}

export function rankModels(
  models: Model[],
  weights: Record<ScoreDimension, number>
): (WeightedResult & { model: Model })[] {
  return models
    .map((model) => ({ ...weightedScore(model, weights), model }))
    .sort((a, b) => b.total - a.total);
}

export function explainRank(r: WeightedResult): string {
  const top = [...r.contributions].filter((c) => c.score != null).sort((a, b) => b.weighted - a.weighted).slice(0, 3);
  const missing = r.contributions.filter((c) => c.score == null && c.weight > 0).map((c) => c.dimension);
  const parts = top.map((c) => `${c.dimension} ${c.score}×${c.weight}`);
  let s = `Score ${r.total} from ${parts.join(", ") || "no overlapping data"}.`;
  if (missing.length) s += ` Missing data for: ${missing.join(", ")} (scored as 0 for ranking, shown as Unknown in UI).`;
  if (r.coverage < 0.7) s += ` Coverage ${(r.coverage * 100).toFixed(0)}% — treat rank as low confidence.`;
  if (r.confidencePenalty > 0) s += ` −${r.confidencePenalty} confidence penalty (demo/sparse evidence).`;
  return s;
}

export const DEFAULT_WEIGHTS: Record<ScoreDimension, number> = {
  coding: 1, reasoning: 1, agent: 1, writing: 1, long_context: 1,
  multimodal: 1, structured: 1, speed: 1, cost: 1, privacy: 1
};
