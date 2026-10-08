"use client";
import { useState } from "react";
import { Copy, Check, ScrollText } from "lucide-react";
import { LEGENDS } from "@/lib/legends";

export default function LegendsShelf() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <div className="mx-auto mt-8 max-w-5xl">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-soft">
        <ScrollText size={13} /> Legend prompts — the old classics
      </p>
      <h2 className="editorial-headline mt-1 text-2xl text-white">Demos that felt impossible on release day</h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        Remember when Sonnet first dropped and devs posted showpieces nobody believed — a whole game from one prompt?
        Still crazy now, and everyone forgets. These are those archetypes, tagged by era, so you can feel what “top of the top” looked like then — and run it yourself today.
        No provenance claimed: patterns, not quotes.
      </p>
      <div className="thin-scroll mt-3 flex gap-3 overflow-x-auto pb-2">
        {LEGENDS.map((l) => (
          <div key={l.id} className="glass w-72 shrink-0 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">{l.tag}</span>
              <span className="rounded-full border border-mint/30 bg-mint/[0.07] px-2 py-0.5 text-[10px] text-mint">{l.era}</span>
            </div>
            <div className="mt-1.5 flex justify-end">
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-300">{l.difficulty}</span>
            </div>
            <p className="mt-2 font-semibold text-white">{l.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-300">{l.does}</p>
            <p className="mt-1.5 text-[12px] italic leading-relaxed text-slate-400">Why it works: {l.why}</p>
            <button
              onClick={() => copy(l.id, l.prompt)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/8 border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-semibold text-white hover:bg-white/10"
            >
              {copied === l.id ? <Check size={14} /> : <Copy size={14} />} {copied === l.id ? "Copied — go run it" : "Copy the prompt"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
