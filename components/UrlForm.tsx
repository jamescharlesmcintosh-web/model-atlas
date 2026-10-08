"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, FlaskConical } from "lucide-react";
import { saveAnalysis } from "@/lib/store";
import type { Analysis } from "@/lib/schema";

const EXAMPLES = ["https://models.dev", "https://platform.openai.com/docs/models", "https://docs.anthropic.com/en/docs/about-claude/models", "https://ai.google.dev/gemini-api/docs/models"];

export default function UrlForm({ onDone }: { onDone?: (a: Analysis) => void }) {
  const [url, setUrl] = useState("");
  const [manual, setManual] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e?: React.FormEvent, override?: string) {
    e?.preventDefault();
    setError(null);
    const target = (override ?? url).trim() || "https://models.dev";
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/analyze-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target })
        });
      } catch (e: any) {
        setError(`Could not reach the app server (${e?.message ?? "fetch failed"}). Is 'npm run dev' still running? Paste page text below instead.`);
        setShowManual(true);
        return;
      }
      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; }
      catch {
        setError(`Server returned HTTP ${res.status} with a non-JSON body (first 160 chars: ${raw.slice(0, 160) || "empty"}). Check the dev terminal for the API error, or use demo/manual paste.`);
        setShowManual(true);
        return;
      }
      if (!res.ok) {
        if (data?.code === "URL_BLOCKED") setError(data.error + " Try a public https URL, or paste page text below.");
        else setError(data?.error ? `HTTP ${res.status}: ${data.error}` : `HTTP ${res.status}: analysis failed. Paste page text below for a manual pass.`);
        setShowManual(true);
        return;
      }
      const analysis = data.analysis as Analysis;
      saveAnalysis(analysis);
      onDone?.(analysis);
      router.push(`/results?id=${analysis.id}`);
    } catch (err: any) {
      setError(`Unexpected form error: ${err?.message ?? err}. Paste page text manually or use the demo landscape.`);
      setShowManual(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-4 sm:p-5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Analyze a URL</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3">
          <Link2 size={16} className="shrink-0 text-slate-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://models.dev"
            inputMode="url"
            className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <button disabled={loading} className="rounded-xl bg-gradient-to-r from-accent to-mint px-5 py-3 text-sm font-semibold text-ink-950 disabled:opacity-60">
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Analyzing…</span> : "Analyze landscape"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => { setUrl("https://models.dev"); submit(undefined, "https://models.dev"); }}
          className="rounded-full bg-gradient-to-r from-accent to-mint px-3 py-1 font-mono text-[11px] font-semibold text-ink-950 hover:opacity-90 disabled:opacity-60"
        >
          ⟳ Sync live models.dev (8,000+ models)
        </button>
        {EXAMPLES.filter((ex) => ex !== "https://models.dev").map((ex) => (
          <button key={ex} type="button" onClick={() => setUrl(ex)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-300 hover:bg-white/10">
            {ex.replace("https://", "")}
          </button>
        ))}
      </div>
      {error && (
        <div className="mt-3 rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-100">
          {error}
          <div className="mt-1 text-xs text-rose-200/80">Blocked hosts (localhost, private nets, file://) are never fetched. Manual paste stays available.</div>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-xs">
        <button type="button" onClick={() => setShowManual((v) => !v)} className="text-slate-300 underline decoration-dotted underline-offset-4 hover:text-white">
          {showManual ? "Hide manual paste" : "Extraction failed? Paste page text manually"}
        </button>
        <a href="/results?demo=1" className="inline-flex items-center gap-1 text-slate-300 hover:text-white"><FlaskConical size={13} /> Open demo landscape</a>
      </div>
      {showManual && (
        <div className="mt-2">
          <textarea value={manual} onChange={(e) => setManual(e.target.value)} rows={5} placeholder="Paste model-page text or structured model data here…" className="w-full rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none" />
          <p className="mt-1 text-[11px] text-slate-400">Manual paste is analyzed locally with the same demo adapter in v1; source excerpts are preserved per field where possible.</p>
        </div>
      )}
    </form>
  );
}
