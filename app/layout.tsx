import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Model Atlas — Know which AI model to use before you build",
  description: "Paste a model directory URL or look up a model. Source-backed comparisons, task rankings, and evidence — demo mode included."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-950 text-slate-100 antialiased">
        <div className="pointer-events-none fixed inset-0 bg-noise opacity-[0.5]" aria-hidden />
        <div className="pointer-events-none fixed -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" aria-hidden />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
            <a href="/" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-mint font-serif text-lg font-bold text-ink-950">A</span>
              <span className="text-[15px] font-semibold tracking-tight">Model Atlas</span>
              <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">Demo data</span>
            </a>
            <nav className="ml-auto flex items-center gap-1 text-sm text-slate-300">
              <a href="/" className="rounded-md px-3 py-1.5 hover:bg-white/5 hover:text-white">Home</a>
              <a href="/results?demo=1" className="rounded-md px-3 py-1.5 hover:bg-white/5 hover:text-white">Landscape</a>
              <a href="/compare" className="rounded-md px-3 py-1.5 hover:bg-white/5 hover:text-white">Compare</a>
              <a href="/models/claude-sonnet-4-5-demo" className="hidden rounded-md px-3 py-1.5 hover:bg-white/5 hover:text-white sm:block">Sample model</a>
            </nav>
          </div>
        </header>
        <main className="relative mx-auto max-w-7xl px-4 sm:px-6">{children}</main>
        <footer className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 text-xs leading-relaxed text-slate-400 sm:px-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <strong className="text-slate-200">Disclaimer:</strong> model capabilities, pricing, rate limits, and availability change quickly.
            Recommendations are task-dependent and demo-labeled unless a cited source says otherwise.
            Validate with real evaluation prompts before production use. Direct page extraction respects robots.txt and never bypasses auth, paywalls, or bot protections.
          </div>
        </footer>
      </body>
    </html>
  );
}
