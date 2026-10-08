import type { BenchmarkDatapoint, Model, Recommendation, TaskProfile } from "./schema";

/**
 * DEMO DATASET — fictional values for UI testing only. NEVER real data.
 * Every model has isDemo:true, every benchmark has isDemo:true + origin:"demo".
 * UI must render a "Demo data" banner whenever this set is shown.
 */
const NOW = new Date().toISOString();
const DAY = "2026-09-10T00:00:00.000Z";

function cit(slug: string, title: string, url: string, kind: any, excerpt?: string) {
  return { id: `${slug}-${kind}-${title.slice(0, 12).replace(/\W+/g, "")}`, url, title, excerpt, retrievedAt: DAY, kind, publisher: "Demo source" };
}

function cap(category: any, score: number | null, confidence: any, explanation: string, sourceIds: string[] = []) {
  return { category, score, confidence, explanation, explanationStatus: "demo" as const, sourceIds };
}
function sc(dimension: any, score: number | null, confidence: any, explanation?: string) {
  return { dimension, score, confidence, explanation };
}

export const DEMO_MODELS: Model[] = [
  {
    slug: "claude-sonnet-4-5-demo",
    name: "Claude Sonnet 4.5",
    exactVersion: "20250929 (demo — verify)",
    provider: "Anthropic",
    family: "Claude",
    releaseDate: undefined,
    modelTypes: ["proprietary-api", "multimodal", "reasoning"],
    oneLiner: "Best for production coding workflows that need strong code generation, tool calling, and reliable structured responses. (Demo interpretation — verify against official docs.)",
    oneLinerStatus: "demo",
    bestFor: ["Production coding assistant", "Agent workflows", "Structured extraction", "Long-doc RAG"],
    avoidFor: ["Lowest-cost bulk jobs", "Fully local deployment", "Image generation"],
    contextWindow: 200000,
    effectiveContextWindow: null,
    modalities: ["text", "image", "pdf"],
    openWeight: false,
    selfHostable: false,
    apiIds: ["claude-sonnet-4-5", "claude-sonnet-4-5-20250929"],
    aliases: ["claude sonnet", "sonnet", "sonnet 4.5", "anthropic sonnet", "best claude for coding"],
    capabilities: [
      cap("coding", 92, "medium", "Demo: strong code-gen + review in fictional evals.", []),
      cap("debugging_review", 90, "medium", "Demo: precise diffs and test-aware fixes.", []),
      cap("agent_tool_use", 91, "medium", "Demo: reliable multi-step tool chains.", []),
      cap("function_calling", 90, "medium", "Demo: schema-adherent calls.", []),
      cap("structured_json", 93, "medium", "Demo: valid JSON at high rate in demo harness.", []),
      cap("reasoning_general", 88, "medium", "Demo: solid planning, verify on your tasks.", []),
      cap("reasoning_math_science", 84, "low", "Demo placeholder — sparse evidence.", []),
      cap("long_context", 86, "low", "Demo: advertised window large; effective use unverified.", []),
      cap("writing_editing", 87, "medium", "Demo: clean, careful prose.", []),
      cap("research_synthesis", 85, "low", "Demo: decent synthesis; citations unverified.", []),
      cap("vision", 78, "low", "Demo: image understanding present, depth unknown.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", null, "insufficient", "Not enough verified data.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 80, "low", "Demo placeholder.", []),
      cap("speed", 74, "low", "Demo: mid latency; measure in your region.", []),
      cap("cost_efficiency", 62, "low", "Demo: premium tier pricing placeholder.", []),
      cap("privacy_hosting", 20, "medium", "Demo: proprietary API only, no self-host.", []),
    ],
    scores: [
      sc("coding", 92, "medium"), sc("reasoning", 88, "medium"), sc("agent", 91, "medium"),
      sc("writing", 87, "medium"), sc("long_context", 86, "low"), sc("multimodal", 72, "low"),
      sc("structured", 93, "medium"), sc("speed", 74, "low"), sc("cost", 62, "low"), sc("privacy", 20, "medium")
    ],
    pricing: { inputPer1M: 3, outputPer1M: 15, currency: "USD", note: "Demo placeholder — verify live pricing.", evidence: { status: "demo", confidence: 0.2, sourceIds: [], note: "Fictional demo price." } },
    speedNote: "Demo: ~45 tok/s placeholder in demo harness; measure yourself.",
    citations: [
      cit("sonnet", "Anthropic Claude docs (demo link)", "https://docs.anthropic.com/demo", "official", "Demo excerpt — replace with real retrieved text."),
      cit("sonnet", "Demo benchmark harness v0.1", "https://example.com/demo-bench", "benchmark", "Fictional scores for UI testing.")
    ],
    fieldEvidence: {
      pricing: { status: "demo", confidence: 0.2, sourceIds: [], note: "Fictional demo price." },
      contextWindow: { status: "demo", confidence: 0.3, sourceIds: [], note: "Demo placeholder." }
    },
    dataQuality: "partial",
    confidenceOverall: 58,
    confidenceExplanation: "Demo dataset: fictional values, no live verification. Architecture supports swapping in permitted real sources.",
    alternatives: ["gpt-4-1-demo", "gemini-2-5-pro-demo", "deepseek-r1-demo"],
    tradeoffs: "Demo: quality vs premium price; no self-host path.",
    officialSourceUrl: "https://www.anthropic.com/demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "gpt-4-1-demo",
    name: "GPT-4.1",
    exactVersion: "gpt-4.1-2025-04-14 (demo — verify)",
    provider: "OpenAI",
    family: "GPT",
    modelTypes: ["proprietary-api", "multimodal", "coding-focused"],
    oneLiner: "Best all-around frontier pick for coding + agents when you want broad ecosystem support. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["All-around product default", "Coding assistant", "Customer-support agent", "Data extraction"],
    avoidFor: ["Fully offline use", "Tightest budgets at scale", "Image generation (needs separate model)"],
    contextWindow: 1000000,
    effectiveContextWindow: null,
    modalities: ["text", "image"],
    openWeight: false,
    selfHostable: false,
    apiIds: ["gpt-4.1", "gpt-4.1-2025-04-14"],
    aliases: ["gpt-4.1", "gpt 4.1", "openai gpt", "cheap openai model", "gpt-4"],
    capabilities: [
      cap("coding", 90, "medium", "Demo: strong across SWE-style demo tasks.", []),
      cap("debugging_review", 88, "medium", "Demo placeholder.", []),
      cap("agent_tool_use", 89, "medium", "Demo: solid function-call reliability.", []),
      cap("function_calling", 90, "medium", "Demo placeholder.", []),
      cap("structured_json", 91, "medium", "Demo: strict-schema adherence high in demo.", []),
      cap("reasoning_general", 87, "medium", "Demo placeholder.", []),
      cap("reasoning_math_science", 83, "low", "Demo placeholder.", []),
      cap("long_context", 88, "low", "Demo: huge advertised window; effective recall unverified.", []),
      cap("writing_editing", 86, "medium", "Demo placeholder.", []),
      cap("research_synthesis", 84, "low", "Demo placeholder.", []),
      cap("vision", 80, "low", "Demo placeholder.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", 60, "low", "Demo: audio via separate endpoints; unverified.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 82, "low", "Demo placeholder.", []),
      cap("speed", 78, "low", "Demo placeholder.", []),
      cap("cost_efficiency", 66, "low", "Demo placeholder.", []),
      cap("privacy_hosting", 20, "medium", "Demo: API-only.", []),
    ],
    scores: [sc("coding", 90, "medium"), sc("reasoning", 87, "medium"), sc("agent", 89, "medium"), sc("writing", 86, "medium"), sc("long_context", 88, "low"), sc("multimodal", 74, "low"), sc("structured", 91, "medium"), sc("speed", 78, "low"), sc("cost", 66, "low"), sc("privacy", 20, "medium")],
    pricing: { inputPer1M: 2, outputPer1M: 8, currency: "USD", note: "Demo placeholder.", evidence: { status: "demo", confidence: 0.2, sourceIds: [] } },
    speedNote: "Demo placeholder latency.",
    citations: [cit("gpt41", "OpenAI model docs (demo link)", "https://platform.openai.com/docs/demo", "official", "Demo excerpt.")],
    fieldEvidence: { pricing: { status: "demo", confidence: 0.2, sourceIds: [] } },
    dataQuality: "partial",
    confidenceOverall: 56,
    confidenceExplanation: "Demo dataset with fictional values.",
    alternatives: ["claude-sonnet-4-5-demo", "gemini-2-5-pro-demo"],
    tradeoffs: "Demo: ecosystem breadth vs API-only privacy.",
    officialSourceUrl: "https://platform.openai.com/docs/demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "gemini-2-5-pro-demo",
    name: "Gemini 2.5 Pro",
    exactVersion: "gemini-2.5-pro (demo — verify)",
    provider: "Google",
    family: "Gemini",
    modelTypes: ["proprietary-api", "multimodal", "reasoning"],
    oneLiner: "Best for long-document RAG and multimodal (vision+audio) prototypes in demo data. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["RAG / long documents", "Multimodal prototype", "Research synthesis"],
    avoidFor: ["Self-hosting", "Deterministic strict-JSON at scale (verify)", "Lowest latency chat"],
    contextWindow: 1000000,
    effectiveContextWindow: null,
    modalities: ["text", "image", "audio", "video"],
    openWeight: false,
    selfHostable: false,
    apiIds: ["gemini-2.5-pro", "gemini-pro"],
    aliases: ["gemini pro", "gemini", "gemini vision", "google gemini"],
    capabilities: [
      cap("coding", 85, "low", "Demo placeholder.", []),
      cap("debugging_review", 83, "low", "Demo placeholder.", []),
      cap("agent_tool_use", 84, "low", "Demo placeholder.", []),
      cap("function_calling", 84, "low", "Demo placeholder.", []),
      cap("structured_json", 82, "low", "Demo placeholder.", []),
      cap("reasoning_general", 88, "medium", "Demo: long-context reasoning emphasis.", []),
      cap("reasoning_math_science", 85, "low", "Demo placeholder.", []),
      cap("long_context", 93, "medium", "Demo: standout long-doc recall in demo harness.", []),
      cap("writing_editing", 84, "low", "Demo placeholder.", []),
      cap("research_synthesis", 89, "medium", "Demo placeholder.", []),
      cap("vision", 88, "medium", "Demo: vision breadth (image+video) in demo.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", 82, "low", "Demo: native audio placeholder.", []),
      cap("video", 85, "low", "Demo: video understanding placeholder.", []),
      cap("multilingual", 84, "low", "Demo placeholder.", []),
      cap("speed", 70, "low", "Demo placeholder.", []),
      cap("cost_efficiency", 68, "low", "Demo placeholder.", []),
      cap("privacy_hosting", 20, "medium", "Demo: API-only.", []),
    ],
    scores: [sc("coding", 85, "low"), sc("reasoning", 88, "medium"), sc("agent", 84, "low"), sc("writing", 84, "low"), sc("long_context", 93, "medium"), sc("multimodal", 88, "medium"), sc("structured", 82, "low"), sc("speed", 70, "low"), sc("cost", 68, "low"), sc("privacy", 20, "medium")],
    pricing: { inputPer1M: 1.25, outputPer1M: 5, currency: "USD", note: "Demo placeholder.", evidence: { status: "demo", confidence: 0.2, sourceIds: [] } },
    speedNote: "Demo placeholder.",
    citations: [cit("gemini", "Google AI model docs (demo link)", "https://ai.google.dev/demo", "official", "Demo excerpt.")],
    fieldEvidence: {},
    dataQuality: "partial",
    confidenceOverall: 54,
    confidenceExplanation: "Demo dataset.",
    alternatives: ["claude-sonnet-4-5-demo", "gpt-4-1-demo"],
    tradeoffs: "Demo: context breadth vs latency.",
    officialSourceUrl: "https://ai.google.dev/demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "deepseek-r1-demo",
    name: "DeepSeek R1",
    exactVersion: "deepseek-r1 (demo — verify)",
    provider: "DeepSeek",
    family: "DeepSeek",
    modelTypes: ["open-weight", "self-hostable", "reasoning"],
    oneLiner: "Best value reasoning pick in demo data when cost matters and self-host is an option. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["Reasoning on a budget", "Self-host / private deploy", "Research workflow"],
    avoidFor: ["Strict vision workflows", "Fast chat latency (verify)", "Managed-API-only teams"],
    contextWindow: 128000,
    effectiveContextWindow: null,
    modalities: ["text"],
    openWeight: true,
    selfHostable: true,
    apiIds: ["deepseek-reasoner", "deepseek-r1"],
    aliases: ["deepseek reasoning", "deepseek r1", "r1", "deepseek"],
    capabilities: [
      cap("coding", 84, "low", "Demo placeholder.", []),
      cap("debugging_review", 82, "low", "Demo placeholder.", []),
      cap("agent_tool_use", 78, "low", "Demo: tool-use less polished in demo.", []),
      cap("function_calling", 76, "low", "Demo placeholder.", []),
      cap("structured_json", 78, "low", "Demo placeholder.", []),
      cap("reasoning_general", 90, "medium", "Demo: reasoning traces emphasized.", []),
      cap("reasoning_math_science", 89, "medium", "Demo placeholder.", []),
      cap("long_context", 74, "low", "Demo placeholder.", []),
      cap("writing_editing", 78, "low", "Demo placeholder.", []),
      cap("research_synthesis", 84, "low", "Demo placeholder.", []),
      cap("vision", null, "insufficient", "Not enough verified data.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", null, "insufficient", "Not enough verified data.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 76, "low", "Demo placeholder.", []),
      cap("speed", 66, "low", "Demo: reasoning traces add latency.", []),
      cap("cost_efficiency", 92, "medium", "Demo: cheap API + self-host option.", []),
      cap("privacy_hosting", 92, "medium", "Demo: open weights, self-hostable.", []),
    ],
    scores: [sc("coding", 84, "low"), sc("reasoning", 90, "medium"), sc("agent", 78, "low"), sc("writing", 78, "low"), sc("long_context", 74, "low"), sc("multimodal", 30, "low"), sc("structured", 78, "low"), sc("speed", 66, "low"), sc("cost", 92, "medium"), sc("privacy", 92, "medium")],
    pricing: { inputPer1M: 0.5, outputPer1M: 2, currency: "USD", note: "Demo placeholder.", evidence: { status: "demo", confidence: 0.2, sourceIds: [] } },
    speedNote: "Demo: slower when reasoning traces on.",
    citations: [cit("r1", "DeepSeek docs (demo link)", "https://api-docs.deepseek.com/demo", "official", "Demo excerpt.")],
    fieldEvidence: {},
    dataQuality: "partial",
    confidenceOverall: 52,
    confidenceExplanation: "Demo dataset.",
    alternatives: ["qwen-2-5-coder-32b-demo", "llama-3-3-70b-demo"],
    tradeoffs: "Demo: cost/privacy vs tool polish.",
    officialSourceUrl: "https://www.deepseek.com/demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "qwen-2-5-coder-32b-demo",
    name: "Qwen 2.5 Coder 32B",
    exactVersion: "Qwen2.5-Coder-32B-Instruct (demo — verify)",
    provider: "Alibaba",
    family: "Qwen",
    modelTypes: ["open-weight", "self-hostable", "coding-focused"],
    oneLiner: "Best local coding option in demo data for private deployment. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["Local / private deployment", "Coding assistant offline", "Cost-sensitive coding"],
    avoidFor: ["Frontier-grade multimodal", "Longest-context RAG", "Managed agent platform (verify)"],
    contextWindow: 128000,
    effectiveContextWindow: null,
    modalities: ["text"],
    openWeight: true,
    selfHostable: true,
    apiIds: ["qwen2.5-coder:32b"],
    aliases: ["qwen coder", "qwen", "qwen agent model", "local coding model"],
    capabilities: [
      cap("coding", 86, "medium", "Demo: strong for size in demo harness.", []),
      cap("debugging_review", 84, "low", "Demo placeholder.", []),
      cap("agent_tool_use", 76, "low", "Demo placeholder.", []),
      cap("function_calling", 78, "low", "Demo placeholder.", []),
      cap("structured_json", 80, "low", "Demo placeholder.", []),
      cap("reasoning_general", 78, "low", "Demo placeholder.", []),
      cap("reasoning_math_science", 76, "low", "Demo placeholder.", []),
      cap("long_context", 72, "low", "Demo placeholder.", []),
      cap("writing_editing", 72, "low", "Demo placeholder.", []),
      cap("research_synthesis", 72, "low", "Demo placeholder.", []),
      cap("vision", null, "insufficient", "Not enough verified data.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", null, "insufficient", "Not enough verified data.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 78, "low", "Demo placeholder.", []),
      cap("speed", 82, "low", "Demo: fast when local with good GPU.", []),
      cap("cost_efficiency", 90, "medium", "Demo: self-host = marginal cost.", []),
      cap("privacy_hosting", 95, "medium", "Demo: fully self-hostable.", []),
    ],
    scores: [sc("coding", 86, "low"), sc("reasoning", 78, "low"), sc("agent", 76, "low"), sc("writing", 72, "low"), sc("long_context", 72, "low"), sc("multimodal", 25, "low"), sc("structured", 80, "low"), sc("speed", 82, "low"), sc("cost", 90, "medium"), sc("privacy", 95, "medium")],
    pricing: { inputPer1M: 0, outputPer1M: 0, currency: "USD", note: "Demo: self-host compute cost only.", evidence: { status: "demo", confidence: 0.3, sourceIds: [] } },
    speedNote: "Demo: depends on local GPU.",
    citations: [cit("qwen", "Qwen docs (demo link)", "https://huggingface.co/demo-qwen", "official", "Demo excerpt.")],
    fieldEvidence: {},
    dataQuality: "sparse",
    confidenceOverall: 48,
    confidenceExplanation: "Demo dataset, sparse evidence.",
    alternatives: ["llama-3-3-70b-demo", "deepseek-r1-demo"],
    tradeoffs: "Demo: privacy/cost vs frontier quality.",
    officialSourceUrl: "https://huggingface.co/demo-qwen",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "llama-3-3-70b-demo",
    name: "Llama 3.3 70B",
    exactVersion: "Llama-3.3-70B-Instruct (demo — verify)",
    provider: "Meta",
    family: "Llama",
    modelTypes: ["open-weight", "self-hostable", "chat"],
    oneLiner: "Balanced open-weight default for private chat + RAG prototypes. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["Private RAG prototype", "Self-host chat", "Research workflow"],
    avoidFor: ["Frontier coding precision", "Native multimodal video", "Lowest-latency edge"],
    contextWindow: 128000,
    effectiveContextWindow: null,
    modalities: ["text"],
    openWeight: true,
    selfHostable: true,
    apiIds: ["llama-3.3-70b"],
    aliases: ["llama 3", "llama", "llama 3.3", "meta llama"],
    capabilities: [
      cap("coding", 78, "low", "Demo placeholder.", []),
      cap("debugging_review", 76, "low", "Demo placeholder.", []),
      cap("agent_tool_use", 74, "low", "Demo placeholder.", []),
      cap("function_calling", 76, "low", "Demo placeholder.", []),
      cap("structured_json", 78, "low", "Demo placeholder.", []),
      cap("reasoning_general", 80, "low", "Demo placeholder.", []),
      cap("reasoning_math_science", 76, "low", "Demo placeholder.", []),
      cap("long_context", 74, "low", "Demo placeholder.", []),
      cap("writing_editing", 80, "low", "Demo placeholder.", []),
      cap("research_synthesis", 78, "low", "Demo placeholder.", []),
      cap("vision", null, "insufficient", "Not enough verified data.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", null, "insufficient", "Not enough verified data.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 80, "low", "Demo placeholder.", []),
      cap("speed", 76, "low", "Demo placeholder.", []),
      cap("cost_efficiency", 88, "medium", "Demo placeholder.", []),
      cap("privacy_hosting", 93, "medium", "Demo: self-hostable.", []),
    ],
    scores: [sc("coding", 78, "low"), sc("reasoning", 80, "low"), sc("agent", 74, "low"), sc("writing", 80, "low"), sc("long_context", 74, "low"), sc("multimodal", 28, "low"), sc("structured", 78, "low"), sc("speed", 76, "low"), sc("cost", 88, "medium"), sc("privacy", 93, "medium")],
    pricing: { inputPer1M: 0, outputPer1M: 0, currency: "USD", note: "Demo: self-host.", evidence: { status: "demo", confidence: 0.3, sourceIds: [] } },
    speedNote: "Demo placeholder.",
    citations: [cit("llama", "Meta Llama docs (demo link)", "https://www.llama.com/demo", "official", "Demo excerpt.")],
    fieldEvidence: {},
    dataQuality: "sparse",
    confidenceOverall: 46,
    confidenceExplanation: "Demo dataset.",
    alternatives: ["qwen-2-5-coder-32b-demo", "mistral-large-2-demo"],
    tradeoffs: "Demo: openness vs frontier peaks.",
    officialSourceUrl: "https://www.llama.com/demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "mistral-large-2-demo",
    name: "Mistral Large 2",
    exactVersion: "mistral-large-2407 (demo — verify)",
    provider: "Mistral",
    family: "Mistral",
    modelTypes: ["proprietary-api", "open-weight", "multimodal"],
    oneLiner: "Solid EU-hosted all-rounder in demo data with agent + multilingual lean. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["EU data-residency prototype", "Multilingual chat", "Agent workflows"],
    avoidFor: ["Fully offline small-GPU use", "Image generation", "Cheapest bulk (verify)"],
    contextWindow: 128000,
    effectiveContextWindow: null,
    modalities: ["text", "image"],
    openWeight: false,
    selfHostable: false,
    apiIds: ["mistral-large-latest"],
    aliases: ["mistral large", "mistral", "mistral agent"],
    capabilities: [
      cap("coding", 82, "low", "Demo placeholder.", []),
      cap("debugging_review", 80, "low", "Demo placeholder.", []),
      cap("agent_tool_use", 83, "low", "Demo placeholder.", []),
      cap("function_calling", 84, "low", "Demo placeholder.", []),
      cap("structured_json", 83, "low", "Demo placeholder.", []),
      cap("reasoning_general", 82, "low", "Demo placeholder.", []),
      cap("reasoning_math_science", 78, "low", "Demo placeholder.", []),
      cap("long_context", 76, "low", "Demo placeholder.", []),
      cap("writing_editing", 82, "low", "Demo placeholder.", []),
      cap("research_synthesis", 80, "low", "Demo placeholder.", []),
      cap("vision", 70, "low", "Demo placeholder.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", null, "insufficient", "Not enough verified data.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 88, "medium", "Demo: multilingual emphasis.", []),
      cap("speed", 76, "low", "Demo placeholder.", []),
      cap("cost_efficiency", 74, "low", "Demo placeholder.", []),
      cap("privacy_hosting", 45, "low", "Demo: EU hosting narrative, still API.", []),
    ],
    scores: [sc("coding", 82, "low"), sc("reasoning", 82, "low"), sc("agent", 83, "low"), sc("writing", 82, "low"), sc("long_context", 76, "low"), sc("multimodal", 62, "low"), sc("structured", 83, "low"), sc("speed", 76, "low"), sc("cost", 74, "low"), sc("privacy", 45, "low")],
    pricing: { inputPer1M: 2, outputPer1M: 6, currency: "USD", note: "Demo placeholder.", evidence: { status: "demo", confidence: 0.2, sourceIds: [] } },
    speedNote: "Demo placeholder.",
    citations: [cit("mistral", "Mistral docs (demo link)", "https://docs.mistral.ai/demo", "official", "Demo excerpt.")],
    fieldEvidence: {},
    dataQuality: "sparse",
    confidenceOverall: 45,
    confidenceExplanation: "Demo dataset.",
    alternatives: ["llama-3-3-70b-demo", "gpt-4-1-demo"],
    tradeoffs: "Demo: multilingual vs frontier coding.",
    officialSourceUrl: "https://mistral.ai/demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  },
  {
    slug: "atlas-mock-mini-demo",
    name: "Atlas Mock Mini",
    exactVersion: "atlas-mini-1.0-demo (fictional)",
    provider: "Atlas (fictional)",
    family: "Atlas Mock",
    modelTypes: ["proprietary-api", "chat"],
    oneLiner: "Cheapest fast-chat option in demo data for high-volume simple tasks. (Demo interpretation.)",
    oneLinerStatus: "demo",
    bestFor: ["Fast chat", "High-volume classification", "Tight budgets"],
    avoidFor: ["Hard reasoning", "Complex agents", "Multimodal depth"],
    contextWindow: 32000,
    effectiveContextWindow: null,
    modalities: ["text"],
    openWeight: false,
    selfHostable: false,
    apiIds: ["atlas-mini"],
    aliases: ["atlas mini", "cheap", "fast chat", "mock mini"],
    capabilities: [
      cap("coding", 58, "low", "Demo: simple snippets only.", []),
      cap("debugging_review", 55, "low", "Demo placeholder.", []),
      cap("agent_tool_use", 60, "low", "Demo: single-step tools.", []),
      cap("function_calling", 62, "low", "Demo placeholder.", []),
      cap("structured_json", 70, "low", "Demo: small schemas OK.", []),
      cap("reasoning_general", 60, "low", "Demo placeholder.", []),
      cap("reasoning_math_science", 52, "low", "Demo placeholder.", []),
      cap("long_context", 55, "low", "Demo placeholder.", []),
      cap("writing_editing", 68, "low", "Demo placeholder.", []),
      cap("research_synthesis", 58, "low", "Demo placeholder.", []),
      cap("vision", null, "insufficient", "Not enough verified data.", []),
      cap("image_gen_edit", null, "insufficient", "Not enough verified data.", []),
      cap("audio", null, "insufficient", "Not enough verified data.", []),
      cap("video", null, "insufficient", "Not enough verified data.", []),
      cap("multilingual", 65, "low", "Demo placeholder.", []),
      cap("speed", 95, "medium", "Demo: fastest in set.", []),
      cap("cost_efficiency", 96, "medium", "Demo: cheapest in set.", []),
      cap("privacy_hosting", 20, "medium", "Demo: API-only.", []),
    ],
    scores: [sc("coding", 58, "low"), sc("reasoning", 60, "low"), sc("agent", 60, "low"), sc("writing", 68, "low"), sc("long_context", 55, "low"), sc("multimodal", 20, "low"), sc("structured", 70, "low"), sc("speed", 95, "medium"), sc("cost", 96, "medium"), sc("privacy", 20, "medium")],
    pricing: { inputPer1M: 0.15, outputPer1M: 0.6, currency: "USD", note: "Demo fictional.", evidence: { status: "demo", confidence: 0.3, sourceIds: [] } },
    speedNote: "Demo: fastest fictional.",
    citations: [cit("mini", "Atlas fictional spec", "https://example.com/atlas-mini-demo", "demo", "Fictional spec.")],
    fieldEvidence: {},
    dataQuality: "sparse",
    confidenceOverall: 50,
    confidenceExplanation: "Demo fictional model.",
    alternatives: ["mistral-large-2-demo", "gpt-4-1-demo"],
    tradeoffs: "Demo: speed/cost vs quality.",
    officialSourceUrl: "https://example.com/atlas-mini-demo",
    isDemo: true, lastChecked: NOW, lastSourceUpdate: DAY
  }
];

export const DEMO_BENCHMARKS: BenchmarkDatapoint[] = [
  // category: coding
  { id: "b-coding-sonnet", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 72.5, maxScore: 100, unit: "%", modelSlug: "claude-sonnet-4-5-demo", evaluationDate: DAY, methodology: "Fictional harness, 200 tasks. DO NOT USE as real.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Self-reported demo values; non-comparable across versions.", isDemo: true },
  { id: "b-coding-gpt41", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 70.1, maxScore: 100, unit: "%", modelSlug: "gpt-4-1-demo", evaluationDate: DAY, methodology: "Fictional harness, 200 tasks.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-coding-gemini", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 64.8, maxScore: 100, unit: "%", modelSlug: "gemini-2-5-pro-demo", evaluationDate: DAY, methodology: "Fictional harness.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-coding-r1", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 63.2, maxScore: 100, unit: "%", modelSlug: "deepseek-r1-demo", evaluationDate: DAY, methodology: "Fictional harness.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-coding-qwen", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 62.0, maxScore: 100, unit: "%", modelSlug: "qwen-2-5-coder-32b-demo", evaluationDate: DAY, methodology: "Fictional harness.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-coding-llama", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 55.4, maxScore: 100, unit: "%", modelSlug: "llama-3-3-70b-demo", evaluationDate: DAY, methodology: "Fictional harness.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-coding-mistral", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 60.9, maxScore: 100, unit: "%", modelSlug: "mistral-large-2-demo", evaluationDate: DAY, methodology: "Fictional harness.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-coding-mini", benchmarkName: "DemoSWE-Bench (fictional v0.1)", category: "coding", score: 32.0, maxScore: 100, unit: "%", modelSlug: "atlas-mock-mini-demo", evaluationDate: DAY, methodology: "Fictional harness.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  // reasoning
  { id: "b-reas-sonnet", benchmarkName: "DemoGPQA (fictional v0.1)", category: "reasoning", score: 68.0, maxScore: 100, unit: "%", modelSlug: "claude-sonnet-4-5-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values; do not compare across versions.", isDemo: true },
  { id: "b-reas-gpt41", benchmarkName: "DemoGPQA (fictional v0.1)", category: "reasoning", score: 66.5, maxScore: 100, unit: "%", modelSlug: "gpt-4-1-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-reas-gemini", benchmarkName: "DemoGPQA (fictional v0.1)", category: "reasoning", score: 69.2, maxScore: 100, unit: "%", modelSlug: "gemini-2-5-pro-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-reas-r1", benchmarkName: "DemoGPQA (fictional v0.1)", category: "reasoning", score: 71.0, maxScore: 100, unit: "%", modelSlug: "deepseek-r1-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-reas-qwen", benchmarkName: "DemoGPQA (fictional v0.1)", category: "reasoning", score: 55.0, maxScore: 100, unit: "%", modelSlug: "qwen-2-5-coder-32b-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  // agents
  { id: "b-agent-sonnet", benchmarkName: "DemoAgentBench (fictional v0.1)", category: "agents", score: 61.4, maxScore: 100, unit: "%", modelSlug: "claude-sonnet-4-5-demo", evaluationDate: DAY, methodology: "Fictional multi-step tools.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-agent-gpt41", benchmarkName: "DemoAgentBench (fictional v0.1)", category: "agents", score: 59.8, maxScore: 100, unit: "%", modelSlug: "gpt-4-1-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-agent-gemini", benchmarkName: "DemoAgentBench (fictional v0.1)", category: "agents", score: 55.0, maxScore: 100, unit: "%", modelSlug: "gemini-2-5-pro-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-agent-r1", benchmarkName: "DemoAgentBench (fictional v0.1)", category: "agents", score: 48.2, maxScore: 100, unit: "%", modelSlug: "deepseek-r1-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  // long context
  { id: "b-long-gemini", benchmarkName: "DemoLongDoc-Recall (fictional)", category: "long_context", score: 88.0, maxScore: 100, unit: "%", modelSlug: "gemini-2-5-pro-demo", evaluationDate: DAY, methodology: "Fictional needle test.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Advertised vs effective differ; demo only.", isDemo: true },
  { id: "b-long-sonnet", benchmarkName: "DemoLongDoc-Recall (fictional)", category: "long_context", score: 79.0, maxScore: 100, unit: "%", modelSlug: "claude-sonnet-4-5-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  { id: "b-long-gpt41", benchmarkName: "DemoLongDoc-Recall (fictional)", category: "long_context", score: 81.0, maxScore: 100, unit: "%", modelSlug: "gpt-4-1-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Demo values.", isDemo: true },
  // speed (tok/s fictional)
  { id: "b-speed-mini", benchmarkName: "DemoThroughput tok/s (fictional)", category: "speed", score: 145, maxScore: null, unit: "tok/s", modelSlug: "atlas-mock-mini-demo", evaluationDate: DAY, methodology: "Fictional single-region measure.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Not comparable across providers/regions.", isDemo: true },
  { id: "b-speed-sonnet", benchmarkName: "DemoThroughput tok/s (fictional)", category: "speed", score: 48, maxScore: null, unit: "tok/s", modelSlug: "claude-sonnet-4-5-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Not comparable.", isDemo: true },
  { id: "b-speed-gpt41", benchmarkName: "DemoThroughput tok/s (fictional)", category: "speed", score: 62, maxScore: null, unit: "tok/s", modelSlug: "gpt-4-1-demo", evaluationDate: DAY, methodology: "Fictional.", origin: "demo", sourceUrl: "https://example.com/demo-bench", sourceTitle: "Demo harness", reliability: "low", caveats: "Not comparable.", isDemo: true },
];

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  { id: "rec-coding", label: "Best model for coding", modelSlug: "claude-sonnet-4-5-demo", reason: "Highest demo coding + structured scores; disambiguate version before prod. (Demo interpretation.)", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-agents", label: "Best model for agents", modelSlug: "claude-sonnet-4-5-demo", reason: "Top demo agent/tool-use composite.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-lowcost", label: "Best low-cost model", modelSlug: "atlas-mock-mini-demo", reason: "Cheapest demo price; only for simple tasks.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-writing", label: "Best for creative writing", modelSlug: "claude-sonnet-4-5-demo", reason: "Demo writing lead is narrow — validate with your prompts.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-rag", label: "Best for RAG and long documents", modelSlug: "gemini-2-5-pro-demo", reason: "Highest demo long-context score.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-multi", label: "Best multimodal model", modelSlug: "gemini-2-5-pro-demo", reason: "Broadest demo modality coverage.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-selfhost", label: "Best model to self-host", modelSlug: "qwen-2-5-coder-32b-demo", reason: "Coding-tuned open weights in demo set.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-fast", label: "Best model for fast chat", modelSlug: "atlas-mock-mini-demo", reason: "Fastest demo throughput; quality tradeoff.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-struct", label: "Best for structured outputs", modelSlug: "claude-sonnet-4-5-demo", reason: "Top demo JSON reliability.", reasonStatus: "demo", sourceIds: [] },
  { id: "rec-all", label: "Best all-around model", modelSlug: "gpt-4-1-demo", reason: "Most balanced demo composite.", reasonStatus: "demo", sourceIds: [] },
];

export const TASK_PROFILES: TaskProfile[] = [
  {
    id: "saas", label: "Building a SaaS product", description: "Balanced default: coding, agents, structured, cost.",
    weights: { coding: 2, reasoning: 1.5, agent: 2, writing: 1, long_context: 1, multimodal: 0.5, structured: 2, speed: 1, cost: 1.5, privacy: 0.5 },
    tagline: "You want to ship a subscription app people pay for.",
    plain: "Think: a web app with login, billing, and an AI feature inside — like a proposal writer, a support bot, or a dashboard that summarizes data. You need a model that writes decent code, calls your app's functions reliably, and doesn't bankrupt you at scale.",
    costNote: "Cost = per-message API bill. SaaS margins die if each user action costs cents — cheap input/output matters once you have volume.",
    privacyNote: "Your users' data passes through the model provider's API. Fine for most SaaS; not for medical/financial secrets without a contract.",
    watchOut: "Don't pick the biggest model by default — prototype with the all-rounder, then downgrade until quality breaks.",
    examples: [
      { name: "Linear — issue tracker SaaS", url: "https://linear.app", note: "Look at: fast UI, AI-assisted triage style features, per-seat pricing" },
      { name: "Notion — docs + AI SaaS", url: "https://www.notion.so", note: "Look at: AI writing inside a subscription product" }
    ]
  },
  {
    id: "coding", label: "Coding assistant", description: "Code-gen, review, debugging, tool use.",
    weights: { coding: 3, reasoning: 2, agent: 2, writing: 0.5, long_context: 1.5, multimodal: 0, structured: 2, speed: 1, cost: 1, privacy: 0.5 },
    tagline: "An AI pair-programmer that writes and fixes code with you.",
    plain: "Think: autocomplete on steroids + a buddy that explains errors and writes tests. What matters is correct code (not fancy prose), reading YOUR files (long context), and calling tools like search, run tests, edit files (agent ability).",
    costNote: "Coding burns lots of tokens (whole files in, whole files out). A slightly weaker but 5x cheaper model often wins for everyday use.",
    privacyNote: "Your private code gets sent to the provider. For company code, prefer providers with zero-retention terms or a self-hosted model.",
    watchOut: "Benchmarks lie a little — always test on YOUR repo, YOUR language, YOUR framework before committing.",
    examples: [
      { name: "GitHub Copilot", url: "https://github.com/features/copilot", note: "The reference coding assistant — inline suggestions + chat" },
      { name: "Cursor — AI code editor", url: "https://www.cursor.com", note: "Look at: codebase-aware chat, agent mode that edits files" }
    ]
  },
  {
    id: "support", label: "Customer support agent", description: "Tool use, structured, speed, cost at scale.",
    weights: { coding: 0.5, reasoning: 1.5, agent: 3, writing: 2, long_context: 1.5, multimodal: 0.5, structured: 2, speed: 2, cost: 2, privacy: 0.5 },
    tagline: "A bot that answers customers using YOUR help docs.",
    plain: "Think: website chat bubble that actually solves problems — checks order status, looks up the refund policy, opens a ticket. Needs: friendly writing, looking things up (tools), fast replies, and cheap per-chat cost because volume is huge.",
    costNote: "Support = thousands of chats. A $0.01 difference per chat is real money monthly. Speed also = cost: slow bots need more concurrent workers.",
    privacyNote: "Customer names, orders, emails flow through the model. You need a provider with data-retention controls.",
    watchOut: "Never let it invent refund policies — ground every answer in your docs (RAG) and log what it said.",
    examples: [
      { name: "Intercom — support platform", url: "https://www.intercom.com", note: "Look at: AI agent resolving chats before a human steps in" },
      { name: "Zendesk AI", url: "https://www.zendesk.com", note: "Look at: ticket triage + suggested replies" }
    ]
  },
  {
    id: "rag", label: "RAG / document chat", description: "Long context, research, structured citations.",
    weights: { coding: 0.5, reasoning: 2, agent: 1, writing: 1.5, long_context: 3, multimodal: 0.5, structured: 1.5, speed: 1, cost: 1, privacy: 1 },
    tagline: "Chat with your PDFs, manuals, and docs.",
    plain: "Think: drop in 50 PDFs and ask 'what does our contract say about refunds?' The model must read LONG documents without forgetting the middle, and cite where it found the answer so you can trust it.",
    costNote: "Long documents = huge inputs every question. Price per million input tokens is THE number here.",
    privacyNote: "Your documents are the product — private deploys or strict retention terms matter more here than anywhere.",
    watchOut: "'Advertised 1M context' ≠ remembers 1M. Test the needle-in-the-middle of YOUR docs.",
    examples: [
      { name: "Notion Q&A", url: "https://www.notion.so", note: "Look at: ask questions over your own workspace" },
      { name: "Perplexity", url: "https://www.perplexity.ai", note: "Look at: answers with cited sources you can click" }
    ]
  },
  {
    id: "writing", label: "Content writing", description: "Writing quality first.",
    weights: { coding: 0, reasoning: 1, agent: 0.5, writing: 3, long_context: 1, multimodal: 0.5, structured: 0.5, speed: 1, cost: 1, privacy: 0.5 },
    tagline: "Blogs, marketing copy, and edits that sound human.",
    plain: "Think: product descriptions, blog drafts, rewriting a rough paragraph into something sharp. You want taste and tone control — not code, not tools. Cheap and fast usually beats genius here.",
    costNote: "Writing is high-volume and low-risk per word — pick the cheapest model whose tone you actually like.",
    privacyNote: "Low stakes unless it's unreleased company news — then keep it off consumer chatbots.",
    watchOut: "Always human-edit before publishing. AI hallucinates facts with total confidence.",
    examples: [
      { name: "Jasper — marketing copy", url: "https://www.jasper.ai", note: "Look at: brand-voice presets, campaign templates" },
      { name: "Grammarly", url: "https://www.grammarly.com", note: "Look at: rewrite + tone edits inside your writing flow" }
    ]
  },
  {
    id: "extract", label: "Data extraction", description: "Strict JSON, function calling, cost.",
    weights: { coding: 1, reasoning: 1.5, agent: 1.5, writing: 0.5, long_context: 2, multimodal: 0.5, structured: 3, speed: 1.5, cost: 1.5, privacy: 0.5 },
    tagline: "Turn messy text into clean spreadsheet rows.",
    plain: "Think: 1,000 invoices → {vendor, date, total} as perfect JSON your code can trust. The ONLY thing that matters: valid structured output every single time, cheap, at volume. Pretty prose is worthless here.",
    costNote: "Extraction runs on every document you ever process — unit cost × volume is the whole business case.",
    privacyNote: "Invoices and forms contain PII — check retention, or self-host.",
    watchOut: "Demand strict-schema mode and validate output in code. One bad JSON blob can break a pipeline.",
    examples: [
      { name: "Docparser", url: "https://www.docparser.com", note: "Look at: rules-based + AI field extraction from PDFs" },
      { name: "Zapier Tables", url: "https://zapier.com", note: "Look at: structured data feeding automations" }
    ]
  },
  {
    id: "image", label: "Image workflow", description: "Vision + multimodal.",
    weights: { coding: 0.5, reasoning: 1, agent: 1, writing: 1, long_context: 0.5, multimodal: 3, structured: 1, speed: 1, cost: 1, privacy: 0.5 },
    tagline: "Understand photos — or generate new visuals.",
    plain: "Two jobs: (1) look at an image and describe it — 'what's broken in this photo?' (2) make new images — thumbnails, mockups. Check whether the model READS images, MAKES images, or both — most only read.",
    costNote: "Image tokens cost more than text. Generating images is billed per image — preview pricing before building a gallery feature.",
    privacyNote: "Photos of people/places are sensitive — avoid training-on-your-data terms.",
    watchOut: "Vision models misread small text and counts. Test on YOUR photos, not stock demos.",
    examples: [
      { name: "Figma AI", url: "https://www.figma.com", note: "Look at: mockup + asset generation inside a design tool" },
      { name: "Canva Magic Studio", url: "https://www.canva.com", note: "Look at: background edit, text-to-image for non-designers" }
    ]
  },
  {
    id: "website", label: "Website design & build", description: "Generate and polish high-end marketing sites and landing pages.",
    weights: { coding: 2.5, reasoning: 1.5, agent: 1.5, writing: 2, long_context: 1, multimodal: 1.5, structured: 1, speed: 1, cost: 1.5, privacy: 0.5 },
    tagline: "Describe the site — get a stunning high-end design.",
    plain: "Think: 'a dark, premium landing page for my coffee brand' → real HTML/CSS with layout, copy, and images. You need strong code (Tailwind/CSS), good taste in copy (writing), and vision to critique screenshots of the result. Then YOU polish in a visual editor.",
    costNote: "One page-gen = one big output. Cost per page is small; the real cost is your time polishing — pick the model with the best first draft.",
    privacyNote: "Low risk — it's marketing copy and layouts, not secrets.",
    watchOut: "AI layouts look generic until a human art-directs. Generate 3 options, pick one, refine — don't ship draft one.",
    examples: [
      { name: "Vercel v0 — UI generator", url: "https://v0.dev", note: "Look at: prompt → shadcn-style components you can paste into Next.js" },
      { name: "Framer — site builder", url: "https://www.framer.com", note: "Look at: AI-generated sections you refine visually" },
      { name: "Awwwards — what 'great' looks like", url: "https://www.awwwards.com", note: "Browse: the bar your landing page is competing against" }
    ]
  },
  {
    id: "game", label: "Game design & dev", description: "Game logic, dialogue, sprites and prototyping.",
    weights: { coding: 2.5, reasoning: 2, agent: 1, writing: 2, long_context: 1.5, multimodal: 1.5, structured: 1, speed: 1, cost: 1, privacy: 0.5 },
    tagline: "Prototype game mechanics, dialogue, and art fast.",
    plain: "Think: NPC dialogue that reacts to the player, quest text, simple game code (movement, scoring), placeholder sprites. Coding + writing + image-gen all matter — no single model leads all three, so expect a combo.",
    costNote: "Dialogue at runtime = per-player API cost. Prototype on frontier models, ship on the cheapest one players can't tell apart.",
    privacyNote: "Player chat may be moderated — keep logs and a block path, especially for kids' games.",
    watchOut: "AI art has a style; AI code has bugs. Playtest early — fun beats clever.",
    examples: [
      { name: "itch.io — indie games", url: "https://itch.io", note: "Browse: tiny games that won on vibes — your prototype's competition" },
      { name: "Roblox — UGC platform", url: "https://www.roblox.com", note: "Look at: AI-assisted creation for player-made worlds" }
    ]
  },
  {
    id: "voice", label: "Voice application", description: "Audio + speed + structured.",
    weights: { coding: 0.5, reasoning: 1, agent: 1.5, writing: 1, long_context: 0.5, multimodal: 1.5, structured: 1.5, speed: 3, cost: 1.5, privacy: 0.5 },
    tagline: "Talk to it — it talks back. Fast.",
    plain: "Think: phone bot that books appointments, or a study buddy you talk to. The killer spec is LATENCY — over ~1 second feels broken. Audio understanding + quick structured actions (book, cancel, look up) beat deep reasoning.",
    costNote: "Voice = always-on streaming + transcription + model. Per-minute cost rules everything.",
    privacyNote: "Voice recordings are biometric-ish — get consent, store minimally.",
    watchOut: "Test on real phone audio with background noise, not your quiet desk mic.",
    examples: [
      { name: "ElevenLabs", url: "https://elevenlabs.io", note: "Look at: natural text-to-speech voices for apps" },
      { name: "Retell AI — voice agents", url: "https://www.retellai.com", note: "Look at: phone-call agents with low-latency pipelines" }
    ]
  },
  {
    id: "local", label: "Local / private deployment", description: "Privacy/self-host dominant.",
    weights: { coding: 1.5, reasoning: 1.5, agent: 1, writing: 1, long_context: 1, multimodal: 0.5, structured: 1.5, speed: 1, cost: 1.5, privacy: 3 },
    tagline: "Run the model on YOUR machine — nothing leaves.",
    plain: "Think: company docs or patient data you legally can't upload anywhere. Open-weight models (Llama, Qwen) run on your GPU or server. Tradeoff: YOU handle the hardware, and quality trails the big APIs.",
    costNote: "No per-message bill — but you buy/rent the GPU. One good card beats a year of API bills at high volume.",
    privacyNote: "This IS the privacy option — data never leaves your network. Verify the license allows your use.",
    watchOut: "VRAM is the wall — a 70B model needs a serious GPU. Start with the biggest model that fits YOUR card.",
    examples: [
      { name: "Ollama — run models locally", url: "https://ollama.com", note: "Look at: one-command local models on your laptop" },
      { name: "LM Studio", url: "https://lmstudio.ai", note: "Look at: point-and-click local chat + local server" }
    ]
  },
  {
    id: "research", label: "Research workflow", description: "Reasoning, synthesis, long context.",
    weights: { coding: 0.5, reasoning: 3, agent: 1, writing: 2, long_context: 2.5, multimodal: 0.5, structured: 1, speed: 0.5, cost: 1, privacy: 0.5 },
    tagline: "Read 20 sources, give me the real answer.",
    plain: "Think: literature review, competitor teardowns, 'what do these 10 papers agree on?' Needs deep reasoning + long memory + honest citations. Speed doesn't matter; being right does.",
    costNote: "Few queries, big inputs — pay for the smartest model, it still rounds to lunch money.",
    privacyNote: "Unpublished research is valuable — keep it off services that train on inputs.",
    watchOut: "Trace every claim to a source. Reasoning models sound brilliant while citing thin air.",
    examples: [
      { name: "Perplexity", url: "https://www.perplexity.ai", note: "Look at: cited answers over web sources" },
      { name: "Elicit — research assistant", url: "https://elicit.com", note: "Look at: paper screening + summarization workflow" }
    ]
  },
  {
    id: "value", label: "Best value overall", description: "Quality per dollar.",
    weights: { coding: 1.5, reasoning: 1.5, agent: 1.5, writing: 1, long_context: 1, multimodal: 0.5, structured: 1.5, speed: 1.5, cost: 3, privacy: 0.5 },
    tagline: "Maximum smarts per dollar.",
    plain: "Think: you have users and a budget. This finds the model where one more dollar stops buying noticeably better answers. Usually a mid-size model or a self-hosted one — not the flagship, not the toy.",
    costNote: "This IS the cost dimension — blended input+output price vs quality. Recompute when providers cut prices (they do, often).",
    privacyNote: "Value picks are usually API models — privacy is average, not special.",
    watchOut: "Cheapest-first breaks on hard tasks. Set a quality floor first, then minimize cost above it.",
    examples: [
      { name: "OpenRouter — price leaderboard", url: "https://openrouter.ai", note: "Look at: live per-model pricing to sanity-check value claims" }
    ]
  },
];

export function getModel(slug: string): Model | undefined {
  return DEMO_MODELS.find((m) => m.slug === slug);
}

/**
 * Builder workflows — beginner "do this first" steps per task.
 * Guidance (interpretation), not model facts. Shown in the BuilderBox.
 */
export const TASK_BUILDER: Record<string, { tryPrompt: string; steps: string[]; budgetTip: string }> = {
  saas: {
    tryPrompt: "A subscription app where freelancers send invoices and get paid faster",
    steps: [
      "Write one sentence: who pays, for what, and the one AI feature (e.g. 'draft invoice reminders').",
      "Prototype that ONE feature with the top-ranked model below — ignore everything else.",
      "Put it behind a fake pay button and show 3 real users before writing billing code.",
      "Only then add auth, billing, and swap to the cheapest model that still passes your test."
    ],
    budgetTip: "Start on Best, move to Budget once you have paying users."
  },
  coding: {
    tryPrompt: "A to-do app in React and I keep messing up state",
    steps: [
      "Paste your error message + the 20 lines around it — that's 90% of good help.",
      "Ask for the fix AND a one-line why, so you learn instead of copy-pasting blind.",
      "Ask it to write a test for the fix before you move on.",
      "When it repeats, save that answer as your own snippet library."
    ],
    budgetTip: "Everyday fixes: Budget. Nasty architecture bugs: Best for one session."
  },
  support: {
    tryPrompt: "Answer 'where is my order' from our help docs",
    steps: [
      "Paste your 5 most-asked questions + the correct answers — that's your starter brain.",
      "Connect one tool first (e.g. order lookup) before adding more.",
      "Let it draft answers for a week while a human approves every send.",
      "Flip to auto-send only on the questions it got right 10 times in a row."
    ],
    budgetTip: "Support lives on volume — Budget tier almost always wins here."
  },
  rag: {
    tryPrompt: "Ask questions over my 30-page rental contract",
    steps: [
      "Upload ONE document and ask 5 questions you already know the answers to.",
      "Demand page/section citations on every answer — no citation, no trust.",
      "Only then add document 2 through 50.",
      "Re-test the same 5 questions monthly — models and prices change."
    ],
    budgetTip: "Long inputs cost most — compare input-price per million first."
  },
  writing: {
    tryPrompt: "Product descriptions for a candle shop, cozy tone",
    steps: [
      "Give 2 examples of writing you love — tone comes from examples, not adjectives.",
      "Generate 3 versions, steal the best lines from each.",
      "Human-edit facts (prices, dates, claims) — AI invents these confidently.",
      "Save your winning prompt as a template for the next batch."
    ],
    budgetTip: "Cheapest model whose tone you like wins. Always."
  },
  extract: {
    tryPrompt: "Pull vendor, date, total from these 3 invoices as JSON",
    steps: [
      "Define your exact fields first (name + format, e.g. date as YYYY-MM-DD).",
      "Test on 5 messy real examples — coffee stains and all.",
      "Turn on strict-schema/JSON mode and validate output in code.",
      "Spot-check 1 in 20 forever — silent drift is the killer."
    ],
    budgetTip: "Volume × unit cost is the business case — Budget tier by default."
  },
  image: {
    tryPrompt: "A logo-ish thumbnail for my bakery videos, warm and simple",
    steps: [
      "Describe the USE (thumbnail at 1280×720) before the style.",
      "Generate 6, pick 1 direction, iterate on that one only.",
      "Check text spelling and hands/fingers — classic AI fails.",
      "Export and finish in a real editor (Canva/Figma) — don't ship raw."
    ],
    budgetTip: "Per-image billing — batch your experiments, don't drip-generate."
  },
  website: {
    tryPrompt: "Dark premium landing page for my coffee brand, hero + pricing + FAQ",
    steps: [
      "Write your headline + 3 sections on paper first — AI can't invent your message.",
      "Generate the page (v0/Framer or the top model below) and screenshot it.",
      "Compare against one Awwwards site you admire — steal layout ideas, not code.",
      "Polish copy + spacing by hand. Ship draft 3, never draft 1."
    ],
    budgetTip: "Cost per page is trivial — pay for the best first draft, save on your time."
  },
  game: {
    tryPrompt: "A cozy fishing mini-game: cast, wait, catch, score",
    steps: [
      "Define the loop in one line: cast → wait → catch → score. That's your game.",
      "Get movement + scoring working with grey boxes before ANY art or dialogue.",
      "Add one AI thing (NPC barks, quest text) — playtest with a friend.",
      "Placeholder art first, real art last. Fun beats pretty."
    ],
    budgetTip: "Prototype on Best, ship runtime dialogue on the cheapest model players accept."
  },
  voice: {
    tryPrompt: "A bot that books haircut appointments by phone",
    steps: [
      "Script the happy path (book) + the 2 escapes ('human please', silence).",
      "Test on a real phone call with background noise — not your desk mic.",
      "Measure reply delay — over ~1s feels broken, simplify until it's under.",
      "Record + review the first 50 calls before widening hours."
    ],
    budgetTip: "Per-minute costs rule — Budget tier + short replies."
  },
  local: {
    tryPrompt: "Chat over private company docs that can't leave our server",
    steps: [
      "Check your GPU's VRAM first — that decides your max model size.",
      "Install Ollama/LM Studio and pull the top open-weight pick below.",
      "Test your 5 real questions locally before telling anyone.",
      "Keep one API model as backup for questions the local one fumbles."
    ],
    budgetTip: "Free per message — you already paid in hardware."
  },
  research: {
    tryPrompt: "What do recent reviews agree on about standing desks?",
    steps: [
      "Ask for claims WITH sources, then open 3 sources yourself.",
      "Ask 'what disagrees?' — consensus-only answers hide the truth.",
      "Re-run monthly on hard topics — knowledge goes stale.",
      "Save the source list, not just the summary."
    ],
    budgetTip: "Few big queries — just pay for the smartest model."
  },
  value: {
    tryPrompt: "Something good and cheap for everyday questions",
    steps: [
      "Set your quality floor: 5 questions it MUST nail.",
      "Test the cheap picks against that floor — stop at the first one that passes.",
      "Recheck quarterly — prices drop and rankings shuffle.",
      "Keep the flagship as fallback for the 5% of hard questions."
    ],
    budgetTip: "This whole task IS the budget filter — start here."
  }
};
