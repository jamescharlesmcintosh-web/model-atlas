"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Analysis } from "@/lib/schema";
import { DEMO_MODELS, DEMO_RECOMMENDATIONS } from "@/lib/demo-data";
import { getAnalysis } from "@/lib/store";
import ResultsClient from "@/components/ResultsClient";
import { Skeleton, Empty } from "@/components/ui";

export default function ResultsLoader() {
  const params = useSearchParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const id = params.get("id");
    const demo = params.get("demo");
    if (id) {
      const a = getAnalysis(id);
      if (a) setAnalysis(a);
      else setErr("That analysis isn't in this browser's local storage (analyses are stored locally in v1). Open the demo landscape or run a fresh URL analysis.");
      return;
    }
    const now = new Date().toISOString();
    setAnalysis({
      id: "demo-landscape",
      sourceUrl: "https://models.dev (demo)",
      sourceTitle: "Demo landscape — fictional model set",
      createdAt: now,
      lastAnalyzed: now,
      isDemo: true,
      models: DEMO_MODELS,
      recommendations: DEMO_RECOMMENDATIONS,
      warnings: demo ? ["Demo mode: fictional values for UI testing. Extraction + live adapters plug in behind the same interface."] : [],
      sourcePages: [{ url: "https://models.dev", title: "models.dev (demo snapshot)", retrievedAt: now, isDemo: true }]
    });
  }, [params]);

  if (err) return <div className="py-10"><Empty title="Analysis not found" hint={err} /></div>;
  if (!analysis) {
    return (
      <div className="space-y-3 py-8">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid gap-3 sm:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    );
  }
  return <ResultsClient initial={analysis} taskId={params.get("task") ?? undefined} />;
}
