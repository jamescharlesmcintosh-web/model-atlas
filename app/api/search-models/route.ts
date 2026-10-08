import { NextResponse } from "next/server";
import { searchModels } from "@/lib/search";
import { fetchModelsDevRaw, normalizeModelsDev, searchLive } from "@/lib/models-dev";

/** GET ?q= → demo matches + LIVE models.dev matches + disambiguation + NL route hint. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").slice(0, 200);
  if (!q.trim()) return NextResponse.json({ query: "", matches: [], needsDisambiguation: false });
  const result = searchModels(q);
  const demo = result.matches.map((m) => ({
    slug: m.model.slug,
    name: m.model.name,
    provider: m.model.provider,
    family: m.model.family,
    exactVersion: m.model.exactVersion,
    officialSourceUrl: m.model.officialSourceUrl,
    confidenceOverall: m.model.confidenceOverall,
    dataQuality: m.model.dataQuality,
    isDemo: true,
    source: "demo" as const,
    score: m.score,
    matchedOn: m.matchedOn,
    exact: m.exact
  }));
  type Hit = Omit<(typeof demo)[number], "source"> & { source: "demo" | "models.dev" };
  const demoHits: Hit[] = demo.map((d) => ({ ...d, source: "demo" as const }));
  let live: Hit[] = [];
  let liveError: string | undefined;
  try {
    const { raw, retrievedAt } = await fetchModelsDevRaw();
    const all = normalizeModelsDev(raw, retrievedAt);
    live = searchLive(all, q, 12).map((m) => ({
      slug: m.slug,
      name: m.name,
      provider: m.provider,
      family: m.family,
      exactVersion: m.exactVersion,
      officialSourceUrl: m.officialSourceUrl,
      confidenceOverall: m.confidenceOverall,
      dataQuality: m.dataQuality,
      isDemo: false,
      source: "models.dev" as const,
      score: 50,
      matchedOn: ["live directory match"],
      exact: false
    }));
  } catch (e: any) {
    liveError = `Live directory unreachable (${e?.message ?? e}) — demo matches only.`;
  }
  const matches = [...demoHits, ...live].slice(0, 14);
  return NextResponse.json({
    ...result,
    matches,
    liveError,
    needsDisambiguation: result.needsDisambiguation || (demoHits.length > 0 && live.length > 0),
    disambiguationReason: result.disambiguationReason ?? (demoHits.length > 0 && live.length > 0
      ? `“${q.trim()}” matches both demo entries and live models.dev entries — check the source badge and pick the exact one.`
      : undefined)
  });
}
