import { NextResponse } from "next/server";
import { fetchModelsDevRaw, normalizeModelsDev } from "@/lib/models-dev";

/** GET /api/catalog (?refresh=1) → live models.dev snapshot (cached 1h server-side). */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("refresh") === "1";
    const { raw, retrievedAt, fromCache } = await fetchModelsDevRaw(force);
    const models = normalizeModelsDev(raw, retrievedAt);
    return NextResponse.json({
      ok: true,
      retrievedAt,
      fromCache,
      providers: Object.keys(raw ?? {}).length,
      count: models.length,
      source: "https://models.dev/api.json",
      note: "Public directory sync. Specs/pricing/flags verbatim; quality scores are derived spec signals (see lib/models-dev.ts), not benchmarks."
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: `models.dev sync failed (${e?.message ?? e}). Demo data remains available.` }, { status: 502 });
  }
}
