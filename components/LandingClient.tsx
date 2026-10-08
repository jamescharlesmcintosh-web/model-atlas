"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link2, Search, FlaskConical, ShieldCheck, Scale, FileSearch } from "lucide-react";
import UrlForm from "@/components/UrlForm";
import ModelSearch from "@/components/ModelSearch";
import LegendsShelf from "@/components/LegendsShelf";
import { recentAnalyses } from "@/lib/store";
import type { Analysis } from "@/lib/schema";
import { cn } from "@/lib/utils";

export default function LandingClient() {
  const [mode, setMode] = useState<"url" | "model">("url");
  // Load in an effect so server HTML and first client render match (avoids hydration mismatch)
  const [recent, setRecent] = useState<Analysis[]>([]);
  useEffect(() => { try { setRecent(recentAnalyses().slice(0, 4)); } catch {} }, []);

  return (
    <div className="pb-8 pt-10 sm:pt-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">Decision support for builders</p>
        <h1 className="editorial-headline mt-2 text-4xl leading-[1.05] text-white sm:text-6xl">
          Know which AI model<br />to use <em className="text-mint">before</em> you build.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-slate-400">
          Paste a model directory or provider page — or look up one model by name.
          Atlas extracts source-backed specs, profiles every model for real tasks, and shows its evidence.
        </p>
      </motion.div>

      <div className="mx-auto mt-6 max-w-3xl">
        <div className="glass mx-auto grid w-fit grid-cols-2 gap-1 rounded-full p-1">
          {(["url", "model"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn("inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition", mode === m ? "bg-gradient-to-r from-accent to-mint text-ink-950" : "text-slate-300 hover:text-white")}
            >
              {m === "url" ? <><Link2 size={15} /> Analyze a URL</> : <><Search size={15} /> Look up a model</>}
            </button>
          ))}
        </div>
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          {mode === "url" ? <UrlForm /> : <ModelSearch autofocus />}
        </motion.div>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          {mode === "url"
            ? "Paste a provider, documentation, or model-directory URL. Extraction respects robots.txt and never bypasses auth or paywalls."
            : "Type a name, provider, family, alias, or API id. Vague names trigger disambiguation — never silent guessing. Natural-language asks route to the task recommender."}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-3">
        {[
          { n: "1", t: "Paste a source", d: "URL mode extracts models, specs, pricing hints, and citations — or paste text manually when bots are blocked.", icon: Link2 },
          { n: "2", t: "Analyze the landscape", d: "Best-at profiles, transparent scores, benchmark charts, and task rankings with confidence labels.", icon: FileSearch },
          { n: "3", t: "Pick with evidence", d: "Head-to-head 2–4 models, Evidence tab per claim, exportable Markdown/CSV for your team.", icon: Scale }
        ].map((s, i) => (
          <motion.div key={s.n} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 font-mono text-xs text-white">{s.n}</span><s.icon size={15} className="text-mint" /></div>
            <p className="mt-2 font-semibold text-white">{s.t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{s.d}</p>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto mt-3 grid max-w-5xl gap-3 sm:grid-cols-3">
        {[
          { t: "Verified ≠ guessed", d: "Verified, Derived, Interpretation, and Unknown are visually distinct on every field." },
          { t: "Demo-safe by default", d: "Fictional demo data is banner-labeled and swappable via benchmark adapters." },
          { t: "Task-first rankings", d: "SaaS, coding, RAG, agents, local… weights adjustable, ranking explained." }
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white"><ShieldCheck size={14} className="text-mint" />{c.t}</p>
            <p className="mt-1 text-[13px] text-slate-400">{c.d}</p>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="mx-auto mt-6 max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recent analyses (this browser)</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {recent.map((a) => (
              <a key={a.id} href={`/results?id=${a.id}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/25">
                <p className="truncate text-sm font-semibold text-white">{a.sourceTitle}</p>
                <p className="font-mono text-[11px] text-slate-400">{a.models.length} models · {new Date(a.lastAnalyzed).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <LegendsShelf />

      <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-center text-[13px] text-amber-100">
        <span className="inline-flex items-center gap-1.5 font-semibold"><FlaskConical size={14} /> No API keys needed.</span> Start with the demo landscape, then wire permitted real sources later.
        <a href="/results?demo=1" className="ml-2 underline underline-offset-4">Open demo →</a>
      </div>
    </div>
  );
}
