# Model Atlas — Know which AI model to use before you build

Decision-support product for choosing AI models. Two primary modes:

1. **Analyze a URL** — paste a model directory / provider / docs URL (e.g. `https://models.dev`). Server-side extraction + source-backed landscape, task rankings, head-to-head.
2. **Look up a model** — type a name, alias, family, provider, or API id (`Sonnet`, `GPT-4.1`, `DeepSeek reasoning`). Autocomplete + disambiguation; vague names are never treated as exact. Natural-language asks (`cheap OpenAI model`, `local coding model`) route to the task recommender.

Every claim carries **Verified / Derived / Interpretation / Inferred / Unknown / Conflicting / Demo** labels. Demo data is fictional and banner-labeled.

## Live models.dev sync (no keys needed)

The app syncs the **public models.dev directory API** (`https://models.dev/api.json`, ~223 providers / ~8,000 models):

- Paste `https://models.dev` (or hit **Sync live models.dev**) → `POST /api/analyze-url` builds a real `Analysis` (`isDemo:false`): 200 models, max 6 per provider, derived-spec recommendations.
- Lookup search (`GET /api/search-models?q=`) scans demo entries **plus** the full live catalog — LIVE badges vs demo badges, disambiguation across both.
- Model pages resolve live slugs too (`GET /api/models/[slug]` → demo first, then live). Each live model carries a **Get panel**: API model id (copy), provider docs, JS SDK package, Hugging Face weights search (open weights), models.dev link.
- `GET /api/catalog` shows sync status; `?refresh=1` forces a refresh (in-memory cache, 1h TTL).

Truthfulness: specs/pricing/flags/dates are `verified` with retrieval timestamps; 0–100 numbers are `derived` spec signals via the documented formula in `lib/models-dev.ts` (low confidence); coding/writing/speed stay `unknown`. No scraping — only their published public API, with demo fallback if it fails.

## Quickstart

```bash
cd model-atlas
npm install
npm run dev      # http://localhost:3000
npm test         # vitest: URL validation, schema, scoring
npm run build && npm start
```

No API keys needed — demo mode works out of the box.

## Env

Copy `.env.example` → `.env.local`. All keys optional in v1:

| Var | Purpose |
|---|---|
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `MISTRAL_API_KEY`, `XAI_API_KEY` | future live interpretation (interface in `lib/ai-adapter.ts`) |
| `ATLAS_AI_PROVIDER`, `ATLAS_AI_MODEL` | select provider (`mock` default) |
| `ATLAS_FETCH_TIMEOUT_MS`, `ATLAS_FETCH_MAX_BYTES` | fetch guardrails |

## Project structure

```
app/
  page.tsx                    landing (segmented URL / model lookup)
  results/page.tsx            landscape results (cards/table, task ranker, export)
  models/[slug]/page.tsx      single-model intelligence (5 tabs + 6 chart types)
  compare/page.tsx            head-to-head 2–4
  api/analyze-url/route.ts    POST {url} → Analysis (SSRF-safe, robots-aware)
  api/search-models/route.ts  GET ?q= → matches + disambiguation + NL route
  api/models/[slug]/route.ts  GET resolved model + competitors + benchmarks
  api/benchmarks/import/route.ts  POST {format, payload} → normalized preview
components/
  UrlForm, ModelSearch, ModelCard, ResultsClient, ModelPageClient,
  CompareClient, Charts (Recharts), Evidence, LandingClient, ui
lib/
  schema.ts      Zod: Analysis, SourcePage, Citation, Model, Capability,
                 Pricing, Score, Recommendation, TaskProfile, Comparison, Benchmark
  demo-data.ts   DEMO dataset (8 models, 20+ benchmark points, 10 recs, 11 tasks) — fictional
  url-validate.ts, fetcher.ts (robots + caps), extract.ts, mock-adapter.ts,
  ai-adapter.ts (interface), search.ts (aliases + NL routing), scoring.ts,
  benchmarks.ts (adapters + normalize + value fn + CSV/JSON import),
  export.ts (MD/CSV/share), store.ts (localStorage), utils.ts
tests/  url-validate, schema, scoring
```

## Security notes (URL fetching)

- Zod-validated `http(s)` only; blocks `localhost`, `127/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/169.254` (cloud metadata), `*.internal/.local/.lan/.corp/.home/.intranet`, embedded credentials, `file:/data:/blob:`.
- `robots.txt` fetched per host (`ModelAtlasBot`); `Disallow` honored with a clear blocked message + manual-paste fallback.
- Timeout (12 s default), 1.5 MB cap, content-type allowlist, redirects followed without forwarding auth, no JS execution, excerpt capped at 60k chars.
- Partial success still renders: blocked pages return demo landscape + warning instead of a dead end.

## How to add an AI provider

1. Implement `AiProvider` in `lib/ai-adapter.ts` (~20 lines): `interpret({ modelsJson, pageExcerpt, task }) → { summary, status: "interpretation", … }`.
2. Register in `getAiProvider()` behind `ATLAS_AI_PROVIDER` + key env.
3. Never return scores as facts — mark prose `interpretation`, keep numbers in `derived`/`verified` with source ids. UI already renders the distinction.

## How to add a new source parser

- URL mode: extend `lib/extract.ts:detectModelsOnPage` (host-specific regex → slugs + excerpts) or add a `SourceParser { hostPattern, parse(html) }` and call it before the generic fallback.
- Benchmarks: implement `BenchmarkAdapter` in `lib/benchmarks.ts` (`fetchAll`/`fetchForModel` from an official API, licensed dump, or manual import — never scrape against ToS) and `registerAdapter()`. Charts + Evidence pick it up automatically since they read normalized `BenchmarkDatapoint`s.

## Scoring methodology

10 dimensions (coding, reasoning, agent, writing, long_context, multimodal, structured, speed, cost, privacy), each 0–100 or `null` (rendered “Not enough verified data”). Overall = mean of present scores. Task rank = Σ(score × weight)/Σweight − confidence penalty (demo/sparse/low-confidence), with per-dimension contributions, coverage %, and a plain-English `explainRank`. Weights adjustable per task; missing weighted dims score 0 for ordering but display Unknown.

## Testing the demo

- Landing → **Look up a model** → `Sonnet` shows disambiguation with exact versions + sources.
- `cheap OpenAI model` routes to task recommender.
- `/results?demo=1` → filters, sort, cards/table, task weights, Markdown/CSV export.
- `/models/claude-sonnet-4-5-demo` → 5 tabs; Benchmarks tab has all 6 chart types; Evidence tab traces every claim.
- `/compare?m=claude-sonnet-4-5-demo,gpt-4-1-demo,deepseek-r1-demo` → side-by-side table + charts.
- `POST /api/benchmarks/import` with CSV/JSON → normalized preview for the Evidence pipeline.
