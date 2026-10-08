import { describe, it, expect } from "vitest";
import { ModelSchema, BenchmarkDatapointSchema } from "../lib/schema";
import { DEMO_MODELS, DEMO_BENCHMARKS } from "../lib/demo-data";

describe("schema parsing", () => {
  it("accepts all demo models", () => {
    for (const m of DEMO_MODELS) {
      const r = ModelSchema.safeParse(m);
      expect(r.success, JSON.stringify((r as any).error?.flatten())).toBe(true);
    }
  });
  it("accepts all demo benchmark points with traceability", () => {
    for (const b of DEMO_BENCHMARKS) {
      const r = BenchmarkDatapointSchema.safeParse(b);
      expect(r.success).toBe(true);
      expect(b.sourceUrl).toMatch(/^https?:\/\//);
      expect(b.isDemo).toBe(true);
    }
  });
  it("rejects invented required-field gaps", () => {
    const r = ModelSchema.safeParse({ slug: "x" });
    expect(r.success).toBe(false);
  });
});
