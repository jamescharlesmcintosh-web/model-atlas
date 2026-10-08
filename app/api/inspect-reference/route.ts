import { NextResponse } from "next/server";
import { z } from "zod";
import { validateUrl } from "@/lib/url-validate";
import { safeFetchPage } from "@/lib/fetcher";

const BodySchema = z.object({ url: z.string().url().max(2048) });

/** Keyword signals → what the reference page looks like + which task it maps to. Text only — we can't "see" design. */
const SIGNALS: { re: RegExp; label: string; taskId: string }[] = [
  { re: /pricing|subscribe|checkout|sign up|free trial|per seat/i, label: "Looks like a SaaS site (pricing/signup language)", taskId: "saas" },
  { re: /docs|documentation|tutorial|guide|api reference/i, label: "Heavy on docs/guides", taskId: "rag" },
  { re: /shop|cart|add to bag|menu|order online|book now/i, label: "Commerce/booking flow", taskId: "saas" },
  { re: /gallery|portfolio|showcase|case stud/i, label: "Gallery/portfolio style", taskId: "website" },
  { re: /blog|article|newsroom|press/i, label: "Editorial/blog content", taskId: "writing" },
  { re: /play|download|trailer|gameplay|quest|multiplayer/i, label: "Game-related page", taskId: "game" },
  { re: /hero|landing|features|testimonials|faq/i, label: "Classic landing-page sections", taskId: "website" },
  { re: /call|voicemail|phone|talk to/i, label: "Voice/call angle", taskId: "voice" },
];

/**
 * POST { url } → lightweight reference inspection.
 * Reuses the SSRF-safe fetcher (robots.txt honored, no auth/paywall bypass).
 * Returns text signals only — never claims visual understanding.
 */
export async function POST(req: Request) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: "Send JSON { url }." }, { status: 400 });
    }
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid URL." }, { status: 400 });

    const check = validateUrl(parsed.data.url);
    if (!check.ok) return NextResponse.json({ error: check.error, code: "URL_BLOCKED" }, { status: 400 });

    const fetched = await safeFetchPage(check.normalized);
    if (!fetched.ok) {
      return NextResponse.json({ ok: false, url: check.normalized, blockedReason: fetched.blockedReason }, { status: 200 });
    }
    const text = fetched.text ?? "";
    const signals = SIGNALS.flatMap((s) => {
      const m = s.re.exec(text);
      if (!m) return [];
      const at = Math.max(0, (m.index ?? 0) - 40);
      return [{
        label: s.label,
        taskId: s.taskId,
        hit: `…${text.slice(at, at + 110).replace(/\s+/g, " ").trim()}…`
      }];
    });
    const top = signals[0];
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return NextResponse.json({
      ok: true,
      url: check.normalized,
      title: fetched.title ?? check.normalized,
      wordCount,
      excerpt: text.slice(0, 500),
      signals,
      suggestedTaskId: top?.taskId ?? "website",
      note: "Text signals only — the app reads words on the page, it can't see layout, colors, or style. Use it as a reference for structure and sections."
    });
  } catch (e: any) {
    console.error("[inspect-reference] unhandled:", e);
    return NextResponse.json({ error: `Reference inspection failed (${e?.message ?? e}).` }, { status: 500 });
  }
}
