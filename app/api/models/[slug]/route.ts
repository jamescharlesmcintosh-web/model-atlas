import { NextResponse } from "next/server";
import { resolveSlug } from "@/lib/search";
import { benchmarksFor, relevantCompetitors } from "@/lib/benchmarks";
import { fetchModelsDevRaw, getLiveBySlug, normalizeModelsDev, searchLive } from "@/lib/models-dev";

/** GET single resolved model (demo first, then live models.dev) + competitors + benchmarks. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const demo = resolveSlug(params.slug);
  if (demo) {
    const competitors = relevantCompetitors(demo.slug, 5);
    return NextResponse.json({
      model: demo,
      competitors: competitors.map((c) => c.slug),
      benchmarks: benchmarksFor(demo.slug),
      freshness: {
        lastChecked: demo.lastChecked,
        lastSourceUpdate: demo.lastSourceUpdate,
        dataQuality: demo.dataQuality,
        isDemo: true
      }
    });
  }
  try {
    const { raw, retrievedAt } = await fetchModelsDevRaw();
    const all = normalizeModelsDev(raw, retrievedAt);
    const model = getLiveBySlug(all, params.slug);
    if (!model) return NextResponse.json({ error: "Unknown model slug. Try /api/search-models?q=… (scans demo + live models.dev)." }, { status: 404 });
    const competitors = searchLive(all.filter((m) => m.slug !== model.slug && m.provider === model.provider), model.family ?? model.name, 5);
    return NextResponse.json({
      model,
      competitors: competitors.map((c) => c.slug),
      benchmarks: [],
      freshness: {
        lastChecked: model.lastChecked,
        lastSourceUpdate: model.lastSourceUpdate,
        dataQuality: model.dataQuality,
        isDemo: false
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: `Live directory unreachable (${e?.message ?? e}).` }, { status: 502 });
  }
}
