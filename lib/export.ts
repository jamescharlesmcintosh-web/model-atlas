import type { Analysis, Model } from "./schema";

export function analysisToMarkdown(a: Analysis): string {
  const lines: string[] = [];
  lines.push(`# Model Atlas — ${a.sourceTitle ?? a.sourceUrl}`);
  lines.push(`> Source: ${a.sourceUrl} · Last analyzed: ${a.lastAnalyzed} · ${a.isDemo ? "**DEMO DATA (fictional — not real)**" : "live"}`);
  lines.push(`> Capabilities, pricing, and availability change. Validate with real eval prompts before production use.`);
  lines.push("");
  for (const m of a.models) {
    lines.push(`## ${m.name} (${m.provider})`);
    lines.push(`- ${m.oneLiner} [${m.oneLinerStatus}]`);
    lines.push(`- Best for: ${m.bestFor.join("; ") || "Unknown"}`);
    lines.push(`- Avoid for: ${m.avoidFor.join("; ") || "Unknown"}`);
    lines.push(`- Context: ${m.contextWindow ?? "Unknown"} · Pricing: ${m.pricing?.inputPer1M ?? "?"} in / ${m.pricing?.outputPer1M ?? "?"} out per 1M · Confidence: ${m.confidenceOverall}/100 (${m.dataQuality})`);
    lines.push(`- Official source: ${m.officialSourceUrl ?? "Unknown"}`);
    lines.push("");
  }
  lines.push("## Recommendations");
  for (const r of a.recommendations) lines.push(`- ${r.label}: ${r.modelSlug} — ${r.reason}`);
  return lines.join("\n");
}

export function modelsToCsv(models: Model[]): string {
  const head = ["slug", "name", "provider", "contextWindow", "inputPer1M", "outputPer1M", "confidence", "dataQuality", "bestFor", "officialSource", "isDemo"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = models.map((m) => [
    m.slug, m.name, m.provider, m.contextWindow ?? "", m.pricing?.inputPer1M ?? "",
    m.pricing?.outputPer1M ?? "", m.confidenceOverall, m.dataQuality,
    m.bestFor.join(" | "), m.officialSourceUrl ?? "", m.isDemo
  ].map(esc).join(","));
  return [head.join(","), ...rows].join("\n");
}

export function shareSummary(m: Model): string {
  return `${m.name} (${m.provider}) — ${m.oneLiner} Best for: ${m.bestFor.slice(0, 3).join(", ")}. Confidence ${m.confidenceOverall}/100 [${m.dataQuality} evidence, ${m.isDemo ? "DEMO data" : "sourced"}]. ${m.officialSourceUrl ?? ""}`;
}
