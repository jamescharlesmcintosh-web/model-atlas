import { NextResponse } from "next/server";
import { AnalyzeUrlRequestSchema, type Analysis, type Recommendation } from "@/lib/schema";
import { hostHint, validateUrl } from "@/lib/url-validate";
import { safeFetchPage } from "@/lib/fetcher";
import { getProvider } from "@/lib/mock-adapter";
import { fetchModelsDevRaw, landscapeModels, normalizeModelsDev } from "@/lib/models-dev";
import { scoreMap } from "@/lib/scoring";

/** Build a live Analysis straight from the models.dev public API. */
async function liveModelsDevAnalysis(url: string) {
  const now = new Date().toISOString();
  const { raw, retrievedAt } = await fetchModelsDevRaw();
  const all = normalizeModelsDev(raw, retrievedAt);
  const { models, total } = landscapeModels(all, 200, 6);
  const top = (dim: "agent" | "cost" | "long_context" | "structured" | "privacy") =>
    [...models].sort((a, b) => ((scoreMap(b)[dim] ?? -1) - (scoreMap(a)[dim] ?? -1)))[0];
  const overall = [...models].sort((a, b) => {
    const sa = a.scores.map((s) => s.score ?? 0).reduce((x, y) => x + y, 0);
    const sb = b.scores.map((s) => s.score ?? 0).reduce((x, y) => x + y, 0);
    return sb - sa;
  })[0];
  const open = models.find((m) => m.openWeight);
  const rec = (id: string, label: string, slug: string | undefined, reason: string): Recommendation => ({
    id, label, modelSlug: slug ?? models[0]!.slug, reason: `${reason} (Derived from models.dev spec signals — not benchmarks.)`,
    reasonStatus: "derived", sourceIds: []
  });
  const analysis: Analysis = {
    id: `md-${Date.now().toString(36)}`,
    sourceUrl: url,
    sourceTitle: "models.dev — live directory sync",
    createdAt: now,
    lastAnalyzed: now,
    isDemo: false,
    models,
    recommendations: [
      rec("rec-agents", "Best model for agents", top("agent")?.slug, "Top tool_call + reasoning spec signal."),
      rec("rec-lowcost", "Best low-cost model", top("cost")?.slug, "Cheapest verified per-1M price."),
      rec("rec-rag", "Best for RAG and long documents", top("long_context")?.slug, "Largest verified context window."),
      rec("rec-struct", "Best for structured outputs", top("structured")?.slug, "structured_output flag set."),
      rec("rec-selfhost", "Best model to self-host", open?.slug, "Open weights in this sync."),
      rec("rec-all", "Best all-around spec pick", overall?.slug, "Highest derived spec composite.")
    ],
    warnings: [
      `Live sync: ${models.length} of ${total} models shown (capped, max 6 per provider for diversity). Directory snapshot: ${retrievedAt}.`,
      "Specs, pricing, and flags are verified from models.dev. Quality scores are DERIVED spec signals (formula in lib/models-dev.ts) — not benchmarks. Validate with real evals before production use."
    ],
    sourcePages: [{ url, title: "models.dev public API", retrievedAt, isDemo: false }]
  };
  return analysis;
}

/** POST { url } → Analysis. SSRF-safe, robots-aware. models.dev → live sync; else demo-backed. Always JSON. */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Send JSON { url }." }, { status: 400 });
    }
    const parsed = AnalyzeUrlRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid URL.", details: parsed.error.flatten() }, { status: 400 });

    const check = validateUrl(parsed.data.url);
    if (!check.ok) return NextResponse.json({ error: check.error, code: "URL_BLOCKED" }, { status: 400 });

    if (check.hostname === "models.dev" || check.hostname.endsWith(".models.dev")) {
      try {
        const analysis = await liveModelsDevAnalysis(check.normalized);
        return NextResponse.json({ analysis, fetch: { live: true, source: "https://models.dev/api.json" } });
      } catch (e: any) {
        console.error("[analyze-url] live sync failed, demo fallback:", e);
        // fall through to demo-backed result with an honest warning
      }
    }

    const hint = hostHint(check.hostname);
    const fetched = await safeFetchPage(check.normalized);
    const provider = getProvider();
    const analysis = await provider.analyze({
      url: check.normalized,
      title: fetched.title,
      text: fetched.text,
      blockedReason: fetched.ok ? undefined : fetched.blockedReason
    });
    if (check.hostname === "models.dev" || check.hostname.endsWith(".models.dev")) {
      analysis.warnings.unshift("Live models.dev sync failed (network or upstream) — showing demo data instead. Retry or hit GET /api/catalog?refresh=1 to test the sync directly.");
    }
    if (!hint.known) {
      analysis.warnings.unshift(`Generic page (${check.hostname}): ${hint.label}. Results are demo-labeled — paste page text for a tighter pass.`);
    }
    return NextResponse.json({ analysis, fetch: { status: fetched.status, blockedReason: fetched.blockedReason, hostHint: hint.label } });
  } catch (e: any) {
    console.error("[analyze-url] unhandled:", e);
    return NextResponse.json({ error: `Server failed while analyzing (${e?.message ?? e}). Try the demo landscape or manual paste.` }, { status: 500 });
  }
}
