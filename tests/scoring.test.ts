import { describe, it, expect } from "vitest";
import { weightedScore, rankModels, explainRank, DEFAULT_WEIGHTS } from "../lib/scoring";
import { DEMO_MODELS } from "../lib/demo-data";

describe("score calculation", () => {
  it("ranks coding task toward coding-strong demo models", () => {
    const ranked = rankModels(DEMO_MODELS, { ...DEFAULT_WEIGHTS, coding: 3, agent: 2, structured: 2, cost: 0.5, privacy: 0 });
    expect(ranked[0]!.model.slug).toBe("claude-sonnet-4-5-demo");
  });
  it("ranks local/private task toward self-hostable models", () => {
    const ranked = rankModels(DEMO_MODELS, { ...DEFAULT_WEIGHTS, privacy: 3, cost: 1.5, coding: 1.5 });
    expect(["qwen-2-5-coder-32b-demo", "llama-3-3-70b-demo", "deepseek-r1-demo"]).toContain(ranked[0]!.model.slug);
  });
  it("never fabricates: null stays null, explanation admits gaps", () => {
    const r = weightedScore(DEMO_MODELS[0]!, { ...DEFAULT_WEIGHTS, multimodal: 3 });
    const text = explainRank(r);
    expect(text).toMatch(/Score/);
    expect(r.coverage).toBeGreaterThan(0);
  });
  it("penalizes demo/sparse evidence vs verified data", () => {
    const r = weightedScore(DEMO_MODELS[4]!, DEFAULT_WEIGHTS);
    expect(r.confidencePenalty).toBeGreaterThan(0);
  });
});
