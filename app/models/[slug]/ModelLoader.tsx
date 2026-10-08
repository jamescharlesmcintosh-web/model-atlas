"use client";
import { useEffect, useState } from "react";
import type { Model } from "@/lib/schema";
import ModelPageClient from "@/components/ModelPageClient";
import { Skeleton, Empty } from "@/components/ui";

export default function ModelLoader({ slug }: { slug: string }) {
  const [model, setModel] = useState<Model | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await fetch(`/api/models/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!live) return;
        if (!res.ok) setError(data?.error ?? `HTTP ${res.status} — model not found.`);
        else setModel(data.model as Model);
      } catch (e: any) {
        if (live) setError(`Couldn't reach the app server (${e?.message ?? "fetch failed"}). Is 'npm run dev' still running?`);
      }
    })();
    return () => { live = false; };
  }, [slug]);

  if (error) {
    return (
      <div className="py-10">
        <Empty title="Model not found" hint={error} />
        <p className="mt-3 text-center text-sm text-slate-400">
          Try the <a href="/" className="underline underline-offset-2">lookup search</a> — it scans demo entries plus the live models.dev directory.
        </p>
      </div>
    );
  }
  if (!model) {
    return (
      <div className="space-y-3 py-8">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    );
  }
  return <ModelPageClient model={model} />;
}
