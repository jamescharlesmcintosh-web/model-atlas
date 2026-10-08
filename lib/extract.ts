import { DEMO_MODELS } from "./demo-data";

/** Detect known models mentioned on a page; generic fallback names kept clearly labeled. */
export function detectModelsOnPage(text: string, pageUrl: string): { slugs: string[]; unknownNames: string[]; excerptBySlug: Record<string, string> } {
  const lower = text.toLowerCase();
  const slugs: string[] = [];
  const excerptBySlug: Record<string, string> = {};
  for (const m of DEMO_MODELS) {
    const needles = [m.name.toLowerCase(), ...m.aliases.map((a) => a.toLowerCase()), ...m.apiIds.map((a) => a.toLowerCase())]
      .filter((s) => s.length >= 4);
    const hit = needles.find((n) => lower.includes(n));
    if (hit) {
      slugs.push(m.slug);
      const idx = lower.indexOf(hit);
      excerptBySlug[m.slug] = `…${text.slice(Math.max(0, idx - 160), idx + 240).replace(/\s+/g, " ").trim()}… (source: ${pageUrl})`;
    }
  }
  // Generic "ModelName X.Y" pattern for unknown candidates (capped, labeled inferred)
  const unknownNames: string[] = [];
  const re = /\b([A-Z][A-Za-z0-9-]{2,}(?:\s+[A-Z][A-Za-z0-9.-]{1,}){0,3}\s+\d+(?:\.\d+)+)\b/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(text)) && unknownNames.length < 8) {
    const name = mm[1]!.trim();
    if (!slugs.some((s) => name.toLowerCase().includes(DEMO_MODELS.find((m) => m.slug === s)?.name.toLowerCase() ?? "§"))) {
      if (!unknownNames.includes(name)) unknownNames.push(name);
    }
  }
  return { slugs, unknownNames, excerptBySlug };
}

export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
