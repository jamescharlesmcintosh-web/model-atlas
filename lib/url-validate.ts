import { z } from "zod";

/** SSRF-safe URL validation. Blocks localhost, private nets, file/data/blob, non-http(s). */
const BLOCKED_HOSTNAMES = new Set([
  "localhost", "127.0.0.1", "::1", "0.0.0.0",
  "metadata.google.internal", "169.254.169.254"
]);

function isPrivateHostname(host: string): boolean {
  const h = host.toLowerCase().trim().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h === "[::1]" || h === "[::]") return true;
  // IPv4 literal checks
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 127) return true;
    if (a === 0) return true;
  }
  // obvious internal suffixes
  if (h.endsWith(".internal") || h.endsWith(".local") || h.endsWith(".lan")) return true;
  if (h.endsWith(".corp") || h.endsWith(".home") || h.endsWith(".intranet")) return true;
  return false;
}

export const UrlValidationSchema = z.string().url().max(2048).superRefine((val, ctx) => {
  let u: URL;
  try {
    u = new URL(val);
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid URL format." });
    return;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Only http(s) URLs are allowed (got ${u.protocol}).` });
  }
  if (isPrivateHostname(u.hostname)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Localhost and private-network addresses are blocked to prevent SSRF." });
  }
  if (u.username || u.password) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URLs with embedded credentials are not allowed." });
  }
  if (val.startsWith("file:") || val.startsWith("data:") || val.startsWith("blob:")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "file/data/blob URLs are blocked." });
  }
});

export type UrlValidationResult =
  | { ok: true; normalized: string; hostname: string }
  | { ok: false; error: string };

export function validateUrl(raw: string): UrlValidationResult {
  const parsed = UrlValidationSchema.safeParse(raw.trim());
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid URL." };
  }
  const u = new URL(parsed.data);
  return { ok: true, normalized: u.toString(), hostname: u.hostname.toLowerCase() };
}

/** Allowed directory/provider hosts — anything else still works via generic parser with a warning. */
export const KNOWN_HOSTS = [
  "models.dev", "platform.openai.com", "openai.com", "anthropic.com",
  "docs.anthropic.com", "cloud.google.com", "ai.google.dev", "deepmind.google",
  "mistral.ai", "docs.mistral.ai", "x.ai", "docs.x.ai", "deepseek.com",
  "api-docs.deepseek.com", "huggingface.co", "together.ai", "docs.together.ai",
  "groq.com", "console.groq.com", "openrouter.ai"
];

export function hostHint(hostname: string): { known: boolean; label: string } {
  const known = KNOWN_HOSTS.some((h) => hostname === h || hostname.endsWith("." + h));
  return {
    known,
    label: known ? "Known model-directory / provider host" : "Generic page — generic parser will be used"
  };
}
