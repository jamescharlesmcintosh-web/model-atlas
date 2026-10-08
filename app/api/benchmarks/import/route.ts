import { NextResponse } from "next/server";
import { BenchmarkImportSchema } from "@/lib/schema";
import { parseBenchmarkImport } from "@/lib/benchmarks";

/**
 * Admin/dev import: POST { format: "json"|"csv", payload } → normalized preview.
 * Persist via your own store; this endpoint validates + normalizes only.
 * Body example (json): [{ benchmarkName, category, modelSlug, score, maxScore, sourceUrl, ... }]
 */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Send JSON { format, payload }." }, { status: 400 });
  }
  const parsed = BenchmarkImportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid import.", details: parsed.error.flatten() }, { status: 400 });
  const { points, errors } = parseBenchmarkImport(parsed.data.format, parsed.data.payload);
  return NextResponse.json({
    ok: errors.length === 0,
    imported: points.length,
    points: points.slice(0, 200),
    errors,
    note: "Import is validated + normalized only. Wire persistence to your store; each point keeps sourceUrl, methodology, origin, and caveats for the Evidence tab."
  });
}
