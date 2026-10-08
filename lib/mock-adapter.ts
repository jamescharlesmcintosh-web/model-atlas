import { DEMO_BENCHMARKS, DEMO_MODELS, DEMO_RECOMMENDATIONS } from "./demo-data";
import { detectModelsOnPage } from "./extract";
import type { Analysis } from "./schema";

/** Swappable extraction/analysis provider. Mock works with zero keys. */
export interface AnalysisProvider {
  id: string;
  analyze(opts: { url: string; title?: string; text?: string; blockedReason?: string }): Promise<Analysis>;
}

export const mockProvider: AnalysisProvider = {
  id: "mock-demo",
  async analyze({ url, title, text, blockedReason }) {
    const now = new Date().toISOString();
    const warnings: string[] = [];
    let models = DEMO_MODELS;
    if (blockedReason) {
      warnings.push(`Direct extraction blocked: ${blockedReason} Showing demo landscape so the UI stays usable — paste page text manually for a source-backed pass.`);
    } else if (text) {
      const found = detectModelsOnPage(text, url);
      if (found.slugs.length > 0) {
        models = DEMO_MODELS.filter((m) => found.slugs.includes(m.slug));
        warnings.push(`Matched ${found.slugs.length} known model(s) on this page. Other claims are demo-labeled — verify before production use.`);
      } else {
        warnings.push("No known model names detected on this page — showing the full demo landscape. Paste structured model data or try a provider/model-directory URL.");
      }
      if (found.unknownNames.length) {
        warnings.push(`Possible additional models mentioned (unverified, not scored): ${found.unknownNames.join(", ")}.`);
      }
    }
    return {
      id: `an-${Date.now().toString(36)}`,
      sourceUrl: url,
      sourceTitle: title ?? url,
      createdAt: now,
      lastAnalyzed: now,
      isDemo: true,
      models,
      recommendations: DEMO_RECOMMENDATIONS.filter((r) => models.some((m) => m.slug === r.modelSlug)),
      warnings,
      sourcePages: [
        {
          url,
          title: title ?? url,
          retrievedAt: now,
          excerpt: text?.slice(0, 600),
          blockedReason,
          isDemo: true
        }
      ]
    };
  }
};

export function getProvider(): AnalysisProvider {
  return mockProvider; // swap via env ATLAS_AI_PROVIDER in future
}
