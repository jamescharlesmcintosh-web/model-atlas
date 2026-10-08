import { z } from "zod";

export const FetchCheckSchema = z.object({
  url: z.string().url(),
  timeoutMs: z.number().default(12000),
  maxBytes: z.number().default(1500000)
});

/** Minimal robots.txt handling: fetch /robots.txt, honor Disallow for our agent. */
export async function robotsAllowed(pageUrl: string, agent = "ModelAtlasBot"): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const u = new URL(pageUrl);
    const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(robotsUrl, { signal: ctrl.signal, headers: { "User-Agent": agent } });
    clearTimeout(t);
    if (!res.ok) return { allowed: true };
    const text = (await res.text()).slice(0, 100000);
    const lines = text.split(/\r?\n/);
    let inGroup = false;
    const disallows: string[] = [];
    for (const raw of lines) {
      const line = raw.split("#")[0]!.trim();
      if (/^user-agent:/i.test(line)) {
        const v = line.split(":")[1]!.trim();
        inGroup = v === "*" || v.toLowerCase().includes("modelatlas");
      } else if (inGroup && /^disallow:/i.test(line)) {
        const path = line.split(":").slice(1).join(":").trim();
        if (path) disallows.push(path);
      }
    }
    for (const d of disallows) {
      if (d === "/") return { allowed: false, reason: "robots.txt disallows all crawling (Disallow: /)." };
      if (u.pathname.startsWith(d)) return { allowed: false, reason: `robots.txt disallows this path (Disallow: ${d}).` };
    }
    return { allowed: true };
  } catch {
    return { allowed: true, reason: "robots.txt unreachable — proceeding (fail-open for read)." };
  }
}

export interface SafeFetchResult {
  ok: boolean;
  status?: number;
  title?: string;
  text?: string;
  htmlLength?: number;
  blockedReason?: string;
  finalUrl?: string;
}

/** Server-side fetch with SSRF already validated upstream, plus size/time caps. Never sends auth. */
export async function safeFetchPage(pageUrl: string, opts?: { timeoutMs?: number; maxBytes?: number }): Promise<SafeFetchResult> {
  const timeoutMs = opts?.timeoutMs ?? Number(process.env.ATLAS_FETCH_TIMEOUT_MS ?? 12000);
  const maxBytes = opts?.maxBytes ?? Number(process.env.ATLAS_FETCH_MAX_BYTES ?? 1500000);
  const robots = await robotsAllowed(pageUrl);
  if (!robots.allowed) return { ok: false, blockedReason: robots.reason };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(pageUrl, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "ModelAtlasBot/0.1 (+decision-support; respects robots.txt)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1"
      }
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(ct) && !res.url.endsWith(".md")) {
      return { ok: false, status: res.status, blockedReason: `Unsupported content type (${ct || "unknown"}). Paste page text manually instead.` };
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) {
      return { ok: false, status: res.status, blockedReason: `Page too large (${(buf.byteLength / 1e6).toFixed(1)} MB). Paste an excerpt manually instead.` };
    }
    const html = new TextDecoder().decode(buf);
    const title = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i)?.[1]?.trim();
    // crude readable-text extraction (server keeps raw for excerpt; no JS execution)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60000);
    return { ok: res.ok, status: res.status, title, text, htmlLength: buf.byteLength, finalUrl: res.url };
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Fetch timed out. The site may block bots — paste page text manually." : `Fetch failed: ${e?.message ?? e}`;
    return { ok: false, blockedReason: msg };
  } finally {
    clearTimeout(t);
  }
}
