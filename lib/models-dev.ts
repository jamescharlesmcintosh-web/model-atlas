import type { Model, ScoreDimension } from "./schema";

/**
 * models.dev live adapter — public directory API (https://models.dev/api.json), no key.
 * Fetched server-side, cached in memory for 1h, normalized into our Model schema.
 *
 * What each field means here:
 * - verified: copied verbatim from models.dev (specs, pricing, context, flags, dates)
 * - derived: 0–100 spec signals computed ONLY from visible flags via the formula below
 * - unknown: quality dims no directory can answer (coding, writing, speed) → null, never faked
 *
 * DERIVED SPEC FORMULA (transparent, low confidence, shown in UI methodology):
 *   structured = structured_output ? 85 : 40
 *   agent      = tool_call ? (reasoning ? 80 : 70) : 35
 *   reasoning  = reasoning ? 80 : 45
 *   multimodal = image-out ? 85 : image-in ? 70 : 20 (+audio/video adjust via capabilities)
 *   longCtx    = ctx>=1M ? 90 : >=200k ? 75 : >=32k ? 60 : 45
 *   cost       = blended(in*3+out)<=$0.5 ? 90 : <=$3 ? 75 : <=$10 ? 60 : 40
 *   privacy    = open_weights ? 90 : 25
 */

const API_URL = "https://models.dev/api.json";
const TTL_MS = 1000 * 60 * 60;

let cache: { at: number; raw: any } | null = null;

export async function fetchModelsDevRaw(force = false): Promise<{ raw: any; retrievedAt: string; fromCache: boolean }> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) {
    return { raw: cache.raw, retrievedAt: new Date(cache.at).toISOString(), fromCache: true };
  }
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(API_URL, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "ModelAtlasBot/0.1 (+decision-support, public directory sync)",
        Accept: "application/json"
      }
    });
    if (!res.ok) throw new Error(`models.dev API HTTP ${res.status}`);
    const raw = await res.json();
    cache = { at: Date.now(), raw };
    return { raw, retrievedAt: new Date(cache.at).toISOString(), fromCache: false };
  } finally {
    clearTimeout(t);
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "model";
}

function palette(modalities: string[]): string[] {
  return [...new Set(modalities)];
}

function derivedLongCtx(ctx: number | null): number {
  if (ctx == null) return 45;
  if (ctx >= 1000000) return 90;
  if (ctx >= 200000) return 75;
  if (ctx >= 32000) return 60;
  return 45;
}

function derivedCost(input: number | null, output: number | null): number {
  const blended = (input ?? 99) * 3 + (output ?? 99);
  if (blended <= 0.5) return 90;
  if (blended <= 3) return 75;
  if (blended <= 10) return 60;
  return 40;
}

export function normalizeModelsDev(raw: any, retrievedAt: string): Model[] {
  const out: Model[] = [];
  for (const [providerId, p] of Object.entries<any>(raw ?? {})) {
    const models = p?.models ?? {};
    for (const [modelKey, m] of Object.entries<any>(models)) {
      try {
        const slug = `md-${slugify(providerId)}-${slugify(m?.id ?? modelKey)}`;
        const providerName: string = p?.name ?? providerId;
        const name: string = m?.name ?? modelKey;
        const apiId: string = m?.id ?? modelKey;
        const ctx: number | null = typeof m?.limit?.context === "number" ? m.limit.context : null;
        const inP: number | null = typeof m?.cost?.input === "number" ? m.cost.input : null;
        const outP: number | null = typeof m?.cost?.output === "number" ? m.cost.output : null;
        const inMods: string[] = Array.isArray(m?.modalities?.input) ? m.modalities.input : [];
        const outMods: string[] = Array.isArray(m?.modalities?.output) ? m.modalities.output : [];
        const open = m?.open_weights === true;
        const tool = m?.tool_call === true;
        const reas = m?.reasoning === true;
        const struct = m?.structured_output === true;
        const hasImageIn = inMods.includes("image");
        const hasImageOut = outMods.includes("image");
        const citDir = `md-dir-${slug}`;
        const citDoc = `md-doc-${slug}`;
        const citations: Model["citations"] = [
          { id: citDir, url: API_URL, title: "models.dev public API (api.json)", excerpt: `Provider "${providerId}", model "${modelKey}" as listed at retrieval.`, retrievedAt, kind: "independent", publisher: "models.dev" }
        ];
        if (typeof p?.doc === "string" && p.doc.startsWith("http")) {
          citations.push({ id: citDoc, url: p.doc, title: `${providerName} model docs`, retrievedAt, kind: "official", publisher: providerName });
        }
        const sc = (dimension: ScoreDimension, score: number | null, explanation: string) => ({
          dimension, score, confidence: (score == null ? "insufficient" : "low") as "low" | "insufficient", explanation
        });
        const cap = (category: any, score: number | null, explanation: string) => ({
          category, score, confidence: (score == null ? "insufficient" : "low") as "low" | "insufficient",
          explanation, explanationStatus: "derived" as const, sourceIds: [citDir]
        });
        const multiScore = hasImageOut ? 85 : hasImageIn ? 70 : 20;
        const bestFor: string[] = [];
        if (tool) bestFor.push("Agent workflows");
        if (reas) bestFor.push("Reasoning tasks");
        if (open) bestFor.push("Self-host");
        if (hasImageIn) bestFor.push("Vision tasks");
        if (inP != null && inP <= 1) bestFor.push("High-volume use");
        if (!bestFor.length) bestFor.push("General chat");
        const avoidFor: string[] = [];
        if (!tool) avoidFor.push("Tool-calling agents");
        if (!open) avoidFor.push("Offline use");
        if (!hasImageIn && !hasImageOut) avoidFor.push("Image workflows");
        out.push({
          slug,
          name,
          exactVersion: apiId,
          provider: providerName,
          family: typeof m?.family === "string" ? m.family : undefined,
          releaseDate: typeof m?.release_date === "string" ? m.release_date : undefined,
          releaseDateEvidence: typeof m?.release_date === "string"
            ? { status: "verified", confidence: 0.8, sourceIds: [citDir], note: "release_date from models.dev" }
            : undefined,
          modelTypes: [
            ...(reas ? ["reasoning" as const] : []),
            ...(open ? (["open-weight" as const, "self-hostable" as const]) : (["proprietary-api" as const])),
            ...((hasImageIn || hasImageOut) ? (["multimodal" as const]) : [])
          ],
          oneLiner: typeof m?.description === "string" && m.description.trim()
            ? m.description.trim().slice(0, 280)
            : `Directory entry from models.dev — specs verified, quality unrated without benchmarks.`,
          oneLinerStatus: typeof m?.description === "string" && m.description.trim() ? "verified" : "unknown",
          bestFor: bestFor.slice(0, 4),
          avoidFor: avoidFor.slice(0, 3),
          contextWindow: ctx,
          effectiveContextWindow: null,
          modalities: palette([...inMods, ...outMods]),
          openWeight: open,
          selfHostable: open ? true : false,
          apiIds: [apiId],
          aliases: [name, apiId, modelKey].map((s) => String(s)),
          capabilities: [
            cap("reasoning_general", reas ? 80 : 45, reas ? "Derived: reasoning flag set in models.dev." : "Derived: no reasoning flag in models.dev."),
            cap("coding", null, "Not enough verified data — directories don't measure code quality."),
            cap("debugging_review", null, "Not enough verified data."),
            cap("agent_tool_use", tool ? (reas ? 80 : 70) : 35, tool ? "Derived: tool_call flag set." : "Derived: no tool_call flag."),
            cap("function_calling", tool ? 85 : 35, tool ? "Derived: tool_call flag set." : "Derived: no tool_call flag."),
            cap("structured_json", struct ? 85 : 40, struct ? "Derived: structured_output flag set." : "Derived: no structured_output flag."),
            cap("long_context", derivedLongCtx(ctx), `Derived: advertised context ${ctx ?? "unknown"}. Effective recall untested.`),
            cap("writing_editing", null, "Not enough verified data."),
            cap("research_synthesis", null, "Not enough verified data."),
            cap("vision", hasImageIn ? 70 : null, hasImageIn ? "Derived: image input listed. Depth untested." : "Not enough verified data — no image input listed."),
            cap("image_gen_edit", hasImageOut ? 75 : null, hasImageOut ? "Derived: image output listed." : "Not enough verified data."),
            cap("audio", inMods.includes("audio") || outMods.includes("audio") ? 65 : null, inMods.includes("audio") || outMods.includes("audio") ? "Derived: audio modality listed." : "Not enough verified data."),
            cap("video", inMods.includes("video") || outMods.includes("video") ? 65 : null, inMods.includes("video") || outMods.includes("video") ? "Derived: video modality listed." : "Not enough verified data."),
            cap("reasoning_math_science", null, "Not enough verified data."),
            cap("multilingual", null, "Not enough verified data."),
            cap("speed", null, "Not enough verified data — throughput isn't in the directory."),
            cap("cost_efficiency", derivedCost(inP, outP), `Derived: $${inP ?? "?"}/$${outP ?? "?"} per 1M in/out.`),
            cap("privacy_hosting", open ? 90 : 25, open ? "Derived: open weights — self-hostable." : "Derived: API-only listing.")
          ],
          scores: [
            sc("coding", null, "Needs benchmarks."),
            sc("reasoning", reas ? 80 : 45, "Derived from reasoning flag."),
            sc("agent", tool ? (reas ? 80 : 70) : 35, "Derived from tool_call flag."),
            sc("writing", null, "Needs benchmarks."),
            sc("long_context", derivedLongCtx(ctx), "Derived from advertised context."),
            sc("multimodal", multiScore, "Derived from listed modalities."),
            sc("structured", struct ? 85 : 40, "Derived from structured_output flag."),
            sc("speed", null, "Not in directory."),
            sc("cost", derivedCost(inP, outP), "Derived from listed per-1M price."),
            sc("privacy", open ? 90 : 25, "Derived from open_weights flag.")
          ],
          pricing: {
            inputPer1M: inP, outputPer1M: outP, currency: "USD",
            note: inP == null ? "No price listed in models.dev." : undefined,
            evidence: { status: "verified", confidence: 0.85, sourceIds: [citDir], note: "cost from models.dev" }
          },
          speedNote: undefined,
          citations,
          fieldEvidence: {
            pricing: { status: "verified", confidence: 0.85, sourceIds: [citDir] },
            contextWindow: { status: "verified", confidence: 0.85, sourceIds: [citDir] },
            openWeight: { status: "verified", confidence: 0.9, sourceIds: [citDir] },
            flags: { status: "verified", confidence: 0.85, sourceIds: [citDir], note: "tool_call / reasoning / structured_output / modalities" },
            scores: { status: "derived", confidence: 0.4, sourceIds: [citDir], note: "Spec-signal formula in lib/models-dev.ts — not benchmarks." }
          },
          dataQuality: "partial",
          confidenceOverall: 65,
          confidenceExplanation: "Specs, pricing, and flags verified from models.dev; quality scores are derived spec signals, not benchmark results.",
          alternatives: [],
          tradeoffs: open ? "Open weights trade managed convenience for control." : "API convenience trades away self-hosting.",
          officialSourceUrl: typeof p?.doc === "string" ? p.doc : undefined,
          providerDocUrl: typeof p?.doc === "string" ? p.doc : undefined,
          providerNpm: typeof p?.npm === "string" ? p.npm : undefined,
          modelsDevUrl: "https://models.dev/",
          isDemo: false,
          lastChecked: retrievedAt,
          lastSourceUpdate: typeof m?.last_updated === "string" ? m.last_updated : undefined
        });
      } catch {
        // skip malformed entries, keep the sync alive
      }
    }
  }
  return out;
}

/** Landscape slice: diverse + usable, capped for render. */
export function landscapeModels(all: Model[], limit = 200, perProvider = 6): { models: Model[]; total: number } {
  const byProv = new Map<string, Model[]>();
  for (const m of all) {
    const k = m.provider;
    if ((byProv.get(k)?.length ?? 0) >= perProvider) continue;
    byProv.set(k, [...(byProv.get(k) ?? []), m]);
  }
  const models = [...byProv.values()].flat().slice(0, limit);
  return { models, total: all.length };
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

export function searchLive(all: Model[], q: string, limit = 12): Model[] {
  const nq = norm(q);
  if (!nq) return [];
  return all
    .map((m) => {
      let s = 0;
      const nm = norm(m.name);
      if (nm === nq) s += 100;
      else if (nm.includes(nq) && nq.length >= 3) s += 50;
      if (m.apiIds.some((a) => norm(a) === nq)) s += 90;
      const hay = `${m.name} ${m.provider} ${m.family ?? ""} ${m.apiIds.join(" ")}`.toLowerCase();
      for (const t of nq.split(" ")) if (t.length >= 3 && hay.includes(t)) s += 8;
      if (norm(m.provider) === nq) s += 20;
      return { m, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.m);
}

export function getLiveBySlug(all: Model[], slug: string): Model | undefined {
  return all.find((m) => m.slug === slug);
}
