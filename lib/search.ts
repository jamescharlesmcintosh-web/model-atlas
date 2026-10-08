import { DEMO_MODELS } from "./demo-data";
import type { Model } from "./schema";

export interface SearchMatch {
  model: Model;
  score: number;
  matchedOn: string[];
  exact: boolean;
}

export interface SearchResult {
  query: string;
  matches: SearchMatch[];
  needsDisambiguation: boolean;
  disambiguationReason?: string;
  /** Natural-language request detected → route to task recommender instead */
  nlRoute?: { taskId: string; reason: string } | null;
}

const NL_PATTERNS: { re: RegExp; taskId: string }[] = [
  { re: /\bbest\b.*\bcod/i, taskId: "coding" },
  { re: /\bcheap/i, taskId: "value" },
  { re: /\blocal\b|\bprivate\b|\bself-host/i, taskId: "local" },
  { re: /\bvision\b|\bimage\b/, taskId: "image" },
  { re: /\bvoice\b|\baudio\b/, taskId: "voice" },
  { re: /\brag\b|\bdocument\b|\blong\b/, taskId: "rag" },
  { re: /\bwebsite\b|\blanding\b|\bweb design\b|\bsite\b/, taskId: "website" },
  { re: /\bgame\b|\bgaming\b|\bnpc\b|\bquest\b/, taskId: "game" },
  { re: /\bresearch\b/, taskId: "research" },
  { re: /\bextract/i, taskId: "extract" },
  { re: /\bwriting\b|\bcontent\b/, taskId: "writing" },
  { re: /\bsupport\b|\bcustomer\b/, taskId: "support" },
  { re: /\bsaas\b|\bproduct\b/, taskId: "saas" },
  { re: /\bagent\b/, taskId: "coding" },
];

export function detectNlRoute(q: string): { taskId: string; reason: string } | null {
  const hasIntent =
    /\b(best|cheap|fast|local|private|for|need|want|recommend|suggest|which|what)\b/i.test(q) &&
    q.trim().split(/\s+/).length >= 3;
  if (!hasIntent) return null;
  for (const p of NL_PATTERNS) {
    if (p.re.test(q)) return { taskId: p.taskId, reason: `Looks like a task request (“${q.trim()}”) — routing to the task recommender.` };
  }
  if (hasIntent) return { taskId: "saas", reason: "Looks like a natural-language request — routing to the task recommender." };
  return null;
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

export function searchModels(query: string, limit = 8): SearchResult {
  const q = query.trim();
  const nq = norm(q);
  if (!nq) return { query: q, matches: [], needsDisambiguation: false };

  const nlRoute = detectNlRoute(q);
  const scored: SearchMatch[] = [];

  for (const m of DEMO_MODELS) {
    const hay = [m.name, m.provider, m.family ?? "", m.exactVersion ?? "", ...m.aliases, ...m.apiIds, ...m.modelTypes]
      .map(norm).join(" | ");
    const matchedOn: string[] = [];
    let score = 0;
    let exact = false;

    if (norm(m.name) === nq || m.apiIds.map(norm).includes(nq)) {
      score += 100; exact = true; matchedOn.push("exact name / API id");
    }
    if (norm(m.name).includes(nq) && nq.length >= 3) { score += 50; matchedOn.push("name contains"); }
    if (nq.includes(norm(m.name)) && norm(m.name).length >= 4) { score += 45; matchedOn.push("query contains name"); }
    for (const a of m.aliases) {
      const na = norm(a);
      if (!na) continue;
      if (na === nq) { score += 80; exact = true; matchedOn.push(`alias “${a}”`); }
      else if (na.includes(nq) && nq.length >= 3) { score += 35; matchedOn.push(`alias “${a}”`); }
      else if (nq.includes(na) && na.length >= 4) { score += 30; matchedOn.push(`alias “${a}”`); }
    }
    if (norm(m.provider) === nq) { score += 25; matchedOn.push("provider"); }
    else if (norm(m.provider).includes(nq) && nq.length >= 3) { score += 15; matchedOn.push("provider"); }
    if (m.family && norm(m.family) === nq) { score += 30; matchedOn.push("family"); }
    else if (m.family && nq.includes(norm(m.family))) { score += 18; matchedOn.push("family"); }
    // token overlap
    const qt = new Set(nq.split(" "));
    const mt = new Set(hay.split(/[\s|]+/));
    let overlap = 0;
    for (const t of qt) if (t.length >= 3 && mt.has(t)) overlap++;
    score += overlap * 8;
    if (overlap > 0) matchedOn.push(`${overlap} token overlap`);

    if (score > 0) scored.push({ model: m, score, matchedOn, exact });
  }

  scored.sort((a, b) => b.score - a.score);
  const matches = scored.slice(0, limit);

  // Disambiguation: vague single-token family/provider queries, or several close matches
  const vagueTokens = ["gpt-4", "gpt", "claude", "gemini", "llama", "qwen", "mistral", "sonnet", "pro", "r1", "deepseek"];
  const isVague = vagueTokens.includes(nq) || (nq.split(" ").length === 1 && nq.length <= 6);
  const closeTop = matches.length >= 2 && matches[0] && matches[1] && matches[0].score - matches[1].score < 25;
  const noExact = matches.length > 1 && !matches[0]?.exact;
  const needsDisambiguation =
    (isVague && matches.length > 1) || (closeTop && noExact) || (matches.length > 1 && matches[0]!.score < 60);

  return {
    query: q,
    matches,
    needsDisambiguation,
    disambiguationReason: needsDisambiguation
      ? `“${q.trim()}” could refer to multiple versions. Pick the exact model — provider, version, and source links are shown. Vague names are never treated as exact.`
      : undefined,
    nlRoute
  };
}

export function resolveSlug(slug: string): Model | undefined {
  return DEMO_MODELS.find((m) => m.slug === slug);
}
