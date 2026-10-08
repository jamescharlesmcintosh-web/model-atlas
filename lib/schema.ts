import { z } from "zod";

/** Verification status used on every fact. Visible labels in UI. */
export const VerificationStatusSchema = z.enum([
  "verified",       // directly supported by cited source
  "derived",        // calculated from visible source data + transparent formula
  "interpretation", // AI-generated conclusion from available evidence
  "inferred",       // reasonable inference, not directly stated
  "unknown",        // no reliable information
  "conflicting",    // sources disagree
  "demo"            // fictional demo value — never real
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low", "insufficient"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const CitationKindSchema = z.enum([
  "official", "model-card", "technical-report", "pricing",
  "benchmark", "leaderboard", "independent", "community",
  "derived", "interpretation", "missing", "demo"
]);
export type CitationKind = z.infer<typeof CitationKindSchema>;

export const SourceCitationSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  excerpt: z.string().max(1200).optional(),
  retrievedAt: z.string(),
  kind: CitationKindSchema,
  publisher: z.string().optional(),
});
export type SourceCitation = z.infer<typeof SourceCitationSchema>;

export const FieldEvidenceSchema = z.object({
  status: VerificationStatusSchema,
  confidence: z.number().min(0).max(1),
  sourceIds: z.array(z.string()).default([]),
  note: z.string().optional(),
});
export type FieldEvidence = z.infer<typeof FieldEvidenceSchema>;

export const CapabilityCategorySchema = z.enum([
  "reasoning_general", "reasoning_math_science", "coding", "debugging_review",
  "agent_tool_use", "function_calling", "structured_json", "long_context",
  "writing_editing", "research_synthesis", "vision", "image_gen_edit",
  "audio", "video", "multilingual", "speed", "cost_efficiency", "privacy_hosting"
]);
export type CapabilityCategory = z.infer<typeof CapabilityCategorySchema>;

export const CAPABILITY_LABELS: Record<CapabilityCategory, string> = {
  reasoning_general: "General reasoning",
  reasoning_math_science: "Math & science",
  coding: "Coding",
  debugging_review: "Debugging & review",
  agent_tool_use: "Agentic / tool use",
  function_calling: "Function calling",
  structured_json: "Structured JSON",
  long_context: "Long-context docs",
  writing_editing: "Writing & editing",
  research_synthesis: "Research & synthesis",
  vision: "Vision understanding",
  image_gen_edit: "Image gen / edit",
  audio: "Audio",
  video: "Video",
  multilingual: "Multilingual",
  speed: "Speed / latency",
  cost_efficiency: "Cost efficiency",
  privacy_hosting: "Privacy / self-host"
};

export const ModelCapabilitySchema = z.object({
  category: CapabilityCategorySchema,
  score: z.number().min(0).max(100).nullable(),
  confidence: ConfidenceLevelSchema,
  explanation: z.string(),
  explanationStatus: VerificationStatusSchema.default("interpretation"),
  sourceIds: z.array(z.string()).default([]),
});
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;

/** Transparent 10-dimension composite scores (radar + ranking). */
export const ScoreDimensionSchema = z.enum([
  "coding", "reasoning", "agent", "writing", "long_context",
  "multimodal", "structured", "speed", "cost", "privacy"
]);
export type ScoreDimension = z.infer<typeof ScoreDimensionSchema>;

export const SCORE_LABELS: Record<ScoreDimension, string> = {
  coding: "Coding",
  reasoning: "Reasoning",
  agent: "Agent / tool use",
  writing: "Writing",
  long_context: "Long context",
  multimodal: "Multimodal",
  structured: "Structured outputs",
  speed: "Speed",
  cost: "Cost efficiency",
  privacy: "Privacy / self-host"
};

export const ModelScoreSchema = z.object({
  dimension: ScoreDimensionSchema,
  score: z.number().min(0).max(100).nullable(),
  confidence: ConfidenceLevelSchema,
  explanation: z.string().optional(),
});
export type ModelScore = z.infer<typeof ModelScoreSchema>;

export const ModelPricingSchema = z.object({
  inputPer1M: z.number().nullable().default(null),
  outputPer1M: z.number().nullable().default(null),
  currency: z.string().default("USD"),
  note: z.string().optional(),
  evidence: FieldEvidenceSchema.optional(),
});
export type ModelPricing = z.infer<typeof ModelPricingSchema>;

export const BenchmarkOriginSchema = z.enum(["provider", "independent", "community", "demo"]);
export type BenchmarkOrigin = z.infer<typeof BenchmarkOriginSchema>;

export const BenchmarkDatapointSchema = z.object({
  id: z.string(),
  benchmarkName: z.string(),
  category: z.string(),
  score: z.number(),
  maxScore: z.number().nullable().default(null),
  unit: z.string().default("score"),
  modelSlug: z.string(),
  evaluationDate: z.string().optional(),
  methodology: z.string().optional(),
  origin: BenchmarkOriginSchema,
  sourceUrl: z.string(),
  sourceTitle: z.string().optional(),
  reliability: ConfidenceLevelSchema.default("low"),
  caveats: z.string().optional(),
  isDemo: z.boolean().default(true),
});
export type BenchmarkDatapoint = z.infer<typeof BenchmarkDatapointSchema>;

export const ModelTypeSchema = z.enum([
  "proprietary-api", "open-weight", "self-hostable",
  "multimodal", "reasoning", "coding-focused", "chat", "embedding",
  "image-generation", "audio", "video"
]);
export type ModelType = z.infer<typeof ModelTypeSchema>;

export const DataQualitySchema = z.enum(["strong", "partial", "sparse", "none"]);
export type DataQuality = z.infer<typeof DataQualitySchema>;

export const ModelSchema = z.object({
  slug: z.string(),
  name: z.string(),
  exactVersion: z.string().optional(),
  provider: z.string(),
  family: z.string().optional(),
  releaseDate: z.string().optional(),
  releaseDateEvidence: FieldEvidenceSchema.optional(),
  modelTypes: z.array(ModelTypeSchema).default([]),
  oneLiner: z.string(),
  oneLinerStatus: VerificationStatusSchema.default("interpretation"),
  bestFor: z.array(z.string()).default([]),
  avoidFor: z.array(z.string()).default([]),
  contextWindow: z.number().nullable().default(null),
  effectiveContextWindow: z.number().nullable().default(null),
  modalities: z.array(z.string()).default([]),
  openWeight: z.boolean().nullable().default(null),
  selfHostable: z.boolean().nullable().default(null),
  apiIds: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  capabilities: z.array(ModelCapabilitySchema).default([]),
  scores: z.array(ModelScoreSchema).default([]),
  pricing: ModelPricingSchema.optional(),
  speedNote: z.string().optional(),
  citations: z.array(SourceCitationSchema).default([]),
  fieldEvidence: z.record(FieldEvidenceSchema).default({}),
  dataQuality: DataQualitySchema.default("sparse"),
  confidenceOverall: z.number().min(0).max(100),
  confidenceExplanation: z.string(),
  alternatives: z.array(z.string()).default([]),
  tradeoffs: z.string().optional(),
  officialSourceUrl: z.string().optional(),
  /** Live-directory links (models.dev sync). Undefined for demo models. */
  providerDocUrl: z.string().optional(),
  providerNpm: z.string().optional(),
  modelsDevUrl: z.string().optional(),
  isDemo: z.boolean().default(true),
  lastChecked: z.string(),
  lastSourceUpdate: z.string().optional(),
});
export type Model = z.infer<typeof ModelSchema>;

export const SourcePageSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  retrievedAt: z.string(),
  statusCode: z.number().optional(),
  excerpt: z.string().optional(),
  blockedReason: z.string().optional(),
  isDemo: z.boolean().default(false),
});
export type SourcePage = z.infer<typeof SourcePageSchema>;

export const RecommendationSchema = z.object({
  id: z.string(),
  label: z.string(),
  modelSlug: z.string(),
  reason: z.string(),
  reasonStatus: VerificationStatusSchema.default("interpretation"),
  sourceIds: z.array(z.string()).default([]),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const TaskProfileSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  weights: z.record(ScoreDimensionSchema, z.number().min(0).max(3)),
  /** Beginner-friendly layer (optional, never affects scoring) */
  tagline: z.string().optional(),
  plain: z.string().optional(),
  costNote: z.string().optional(),
  privacyNote: z.string().optional(),
  watchOut: z.string().optional(),
  examples: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    note: z.string()
  })).default([]),
});
export type TaskProfile = z.infer<typeof TaskProfileSchema>;

export const AnalysisSchema = z.object({
  id: z.string(),
  sourceUrl: z.string(),
  sourceTitle: z.string().optional(),
  createdAt: z.string(),
  lastAnalyzed: z.string(),
  isDemo: z.boolean().default(true),
  models: z.array(ModelSchema),
  recommendations: z.array(RecommendationSchema).default([]),
  warnings: z.array(z.string()).default([]),
  sourcePages: z.array(SourcePageSchema).default([]),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const ComparisonSelectionSchema = z.object({
  modelSlugs: z.array(z.string()).min(2).max(4),
});
export type ComparisonSelection = z.infer<typeof ComparisonSelectionSchema>;

export const AnalyzeUrlRequestSchema = z.object({
  url: z.string().url().max(2048),
});
export type AnalyzeUrlRequest = z.infer<typeof AnalyzeUrlRequestSchema>;

export const SearchModelsQuerySchema = z.object({
  q: z.string().min(1).max(200),
});
export type SearchModelsQuery = z.infer<typeof SearchModelsQuerySchema>;

export const BenchmarkImportSchema = z.object({
  format: z.enum(["json", "csv"]),
  payload: z.string().max(500000),
});
export type BenchmarkImport = z.infer<typeof BenchmarkImportSchema>;
