import { Suspense } from "react";
import ResultsLoader from "./ResultsLoader";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-slate-400">Loading landscape…</div>}>
      <ResultsLoader />
    </Suspense>
  );
}
