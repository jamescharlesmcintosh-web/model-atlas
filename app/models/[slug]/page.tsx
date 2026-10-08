import { Suspense } from "react";
import ModelLoader from "./ModelLoader";

export default function ModelPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-slate-400">Loading model intelligence…</div>}>
      <ModelLoader slug={params.slug} />
    </Suspense>
  );
}
