import type { Analysis } from "./schema";

/**
 * AI-analysis adapter interface. No provider hard-coded.
 * Env: ATLAS_AI_PROVIDER=mock|openai|anthropic|google|mistral|xai, ATLAS_AI_MODEL=..., *_API_KEY
 * Demo mode always works (mock). Real providers plug in here later.
 */
export interface AiInterpretationInput {
  modelsJson: string;
  pageExcerpt?: string;
  task?: string;
}

export interface AiInterpretation {
  summary: string;
  status: "interpretation";
  provider: string;
  model?: string;
  generatedAt: string;
}

export interface AiProvider {
  id: string;
  interpret(input: AiInterpretationInput): Promise<AiInterpretation>;
}

export const mockAiProvider: AiProvider = {
  id: "mock",
  async interpret({ task }) {
    return {
      summary: `Demo interpretation (no API key configured): rankings below come from the fictional demo harness with transparent weights${task ? ` for task “${task}”` : ""}. Replace with a configured provider to generate live prose — every claim will still carry its evidence label.`,
      status: "interpretation",
      provider: "mock",
      generatedAt: new Date().toISOString()
    };
  }
};

/** How to add a provider: implement AiProvider (~20 lines) and register here. See README. */
export function getAiProvider(): AiProvider {
  const which = (process.env.ATLAS_AI_PROVIDER ?? "mock").toLowerCase();
  // Future: case "openai": return new OpenAiProvider(process.env.OPENAI_API_KEY, ...)
  void which;
  return mockAiProvider;
}

export function aiConfigured(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.MISTRAL_API_KEY || process.env.XAI_API_KEY
  );
}
