"use client";
import { useState } from "react";
import { Copy, Check, ExternalLink, Download } from "lucide-react";
import type { Model } from "@/lib/schema";
import { VerifyBadge } from "./ui";

/** Where to actually get the model: API id, provider docs, SDK, weights. Links out — never proxies keys/files. */
export default function GetPanel({ model }: { model: Model }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };
  const hfUrl = `https://huggingface.co/models?search=${encodeURIComponent(model.family ?? model.name)}`;
  const live = !model.isDemo;

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
        <Download size={14} className="text-mint" /> Get this model
      </h3>
      <div className="mt-2 space-y-2 text-[13px]">
        {model.apiIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100" title={model.apiIds[0]}>{model.apiIds[0]}</span>
            <button onClick={() => copy("api", model.apiIds[0]!)} title="Copy API model id" className="shrink-0 text-slate-300 hover:text-white">
              {copied === "api" ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
        {(model.providerDocUrl || model.officialSourceUrl) && (
          <a href={model.providerDocUrl ?? model.officialSourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 hover:border-white/25">
            <span className="font-medium text-white">Provider docs <VerifyBadge status={live ? "verified" : "demo"} className="ml-1" /></span>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        )}
        {model.providerNpm && (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-2.5 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-100">npm i {model.providerNpm}</span>
            <button onClick={() => copy("npm", `npm i ${model.providerNpm}`)} title="Copy install command" className="shrink-0 text-slate-300 hover:text-white">
              {copied === "npm" ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
        {model.openWeight && (
          <a href={hfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-mint/30 bg-mint/[0.06] px-2.5 py-2 hover:bg-mint/10">
            <span className="font-medium text-white">Find weights on Hugging Face</span>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        )}
        {model.modelsDevUrl && (
          <a href={model.modelsDevUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 hover:border-white/25">
            <span className="font-medium text-white">models.dev directory</span>
            <ExternalLink size={14} className="text-slate-400" />
          </a>
        )}
        {!live && (
          <p className="rounded-lg bg-white/[0.03] p-2 text-[11px] text-slate-400">Demo entry — live Get links (provider docs, SDK, weights) arrive with the models.dev sync.</p>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Downloads and API keys live on the provider — Atlas links you there, it never proxies keys or files. Verify the exact repo/id before downloading.</p>
    </div>
  );
}
