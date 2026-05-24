/**
 * @tessera-llm/mastra — drop-in cost optimization for the Mastra agent
 * framework (https://mastra.ai).
 *
 * Mastra accepts AI SDK provider modules directly via `new Agent({ model:
 * openai("gpt-4o") })`. This package returns the same shape `@ai-sdk/*`
 * `createX` factories return — Tessera's proxy URL pre-merged + the
 * `x-tessera-api-key` header injected — so any Mastra Agent calling
 * generateText / streamText / generateObject lands on Tessera's auto-route
 * + auto-cache + auto-compress + auto-batch substrate proxy.
 *
 * Two API surfaces:
 *
 *   1. tesseraOpenAIConfig / tesseraAnthropicConfig / tesseraMistralConfig /
 *      tesseraGroqConfig / tesseraCohereConfig — returns the constructor
 *      options object for the corresponding @ai-sdk/* provider factory.
 *      Pass-through pattern. Recommended for codepaths already calling
 *      createOpenAI / createAnthropic / etc. directly.
 *
 *      Example:
 *        import { Agent } from "@mastra/core/agent";
 *        import { createOpenAI } from "@ai-sdk/openai";
 *        import { tesseraOpenAIConfig } from "@tessera-llm/mastra";
 *
 *        const openai = createOpenAI({
 *          apiKey: process.env.OPENAI_API_KEY!,
 *          ...tesseraOpenAIConfig({ apiKey: process.env.TESSERA_API_KEY! }),
 *        });
 *
 *        export const agent = new Agent({
 *          name: "Helper",
 *          instructions: "You are a helpful assistant.",
 *          model: openai("gpt-4o"),
 *        });
 *
 *   2. tesseraOpenAI / tesseraAnthropic / tesseraMistral / tesseraGroq /
 *      tesseraCohere — convenience factories that internally call the
 *      corresponding @ai-sdk/* createX factory with Tessera config merged
 *      in. Returns the provider function (modelId) => model — pass directly
 *      to a Mastra Agent.
 *
 *      Example:
 *        import { Agent } from "@mastra/core/agent";
 *        import { tesseraOpenAI } from "@tessera-llm/mastra";
 *
 *        const openai = await tesseraOpenAI({
 *          openaiApiKey: process.env.OPENAI_API_KEY!,
 *          tesseraApiKey: process.env.TESSERA_API_KEY!,
 *        });
 *
 *        export const agent = new Agent({
 *          name: "Helper",
 *          instructions: "You are a helpful assistant.",
 *          model: openai("gpt-4o"),
 *        });
 *
 * The convenience factories dynamically import @ai-sdk/* so peer-dependent
 * imports never blow up when the corresponding provider package is not
 * installed. Install only the @ai-sdk/* packages you actually use.
 *
 * See https://tesseraai.io/dev for the dashboard, free tier, and full
 * mechanic documentation.
 */

export const TESSERA_BASE_URL = "https://api.tesseraai.io";
export const VERSION = "0.1.0";

export type ProviderName =
  | "openai"
  | "anthropic"
  | "mistral"
  | "groq"
  | "cohere";

export interface TesseraConfigInput {
  apiKey: string;
  extraHeaders?: Record<string, string>;
  baseUrl?: string;
}

function validateApiKey(apiKey: string): string {
  if (typeof apiKey !== "string" || apiKey.length === 0) {
    throw new Error(
      "tessera*Config({ apiKey }) requires a non-empty string. " +
        "Get a free key from https://tesseraai.io/dev"
    );
  }
  return apiKey;
}

function proxyEndpoint(provider: ProviderName): string {
  return `${TESSERA_BASE_URL}/v1/${provider}`;
}

function buildHeaders(
  apiKey: string,
  extra?: Record<string, string>
): Record<string, string> {
  return { ...(extra ?? {}), "x-tessera-api-key": apiKey };
}

/**
 * The shape every @ai-sdk/* `createX` factory accepts (minus apiKey, which
 * the caller already supplies). Tessera config returns exactly this shape.
 * Mastra accepts AI SDK provider modules constructed from these options
 * via `new Agent({ model: provider("model-id") })`.
 */
export interface AiSdkProviderInit {
  baseURL: string;
  headers: Record<string, string>;
}

// ── Config functions (pass-through pattern) ─────────────────────────────

export function tesseraOpenAIConfig(input: TesseraConfigInput): AiSdkProviderInit {
  const apiKey = validateApiKey(input.apiKey);
  return {
    baseURL: input.baseUrl ?? proxyEndpoint("openai"),
    headers: buildHeaders(apiKey, input.extraHeaders),
  };
}

export function tesseraAnthropicConfig(input: TesseraConfigInput): AiSdkProviderInit {
  const apiKey = validateApiKey(input.apiKey);
  return {
    baseURL: input.baseUrl ?? proxyEndpoint("anthropic"),
    headers: buildHeaders(apiKey, input.extraHeaders),
  };
}

export function tesseraMistralConfig(input: TesseraConfigInput): AiSdkProviderInit {
  const apiKey = validateApiKey(input.apiKey);
  return {
    baseURL: input.baseUrl ?? proxyEndpoint("mistral"),
    headers: buildHeaders(apiKey, input.extraHeaders),
  };
}

export function tesseraGroqConfig(input: TesseraConfigInput): AiSdkProviderInit {
  const apiKey = validateApiKey(input.apiKey);
  return {
    baseURL: input.baseUrl ?? proxyEndpoint("groq"),
    headers: buildHeaders(apiKey, input.extraHeaders),
  };
}

export function tesseraCohereConfig(input: TesseraConfigInput): AiSdkProviderInit {
  const apiKey = validateApiKey(input.apiKey);
  return {
    baseURL: input.baseUrl ?? proxyEndpoint("cohere"),
    headers: buildHeaders(apiKey, input.extraHeaders),
  };
}

/**
 * Generic dispatcher — returns the right init for the given provider.
 */
export function tesseraConfig(
  provider: ProviderName,
  input: TesseraConfigInput
): AiSdkProviderInit {
  switch (provider) {
    case "openai":
      return tesseraOpenAIConfig(input);
    case "anthropic":
      return tesseraAnthropicConfig(input);
    case "mistral":
      return tesseraMistralConfig(input);
    case "groq":
      return tesseraGroqConfig(input);
    case "cohere":
      return tesseraCohereConfig(input);
    default: {
      const _exhaustive: never = provider;
      throw new Error(
        `Unknown provider ${_exhaustive}. Supported: openai, anthropic, mistral, groq, cohere`
      );
    }
  }
}

// ── Convenience factories ───────────────────────────────────────────────
//
// These wrap the corresponding @ai-sdk/* `createX` factory with Tessera
// routing pre-merged. Returns the provider function (modelId) => model —
// the exact shape Mastra's `new Agent({ model: ... })` accepts. The
// peer-dep package is imported dynamically so users only have to install
// the @ai-sdk/* packages for providers they actually use.

export interface TesseraOpenAIFactoryInput {
  /** Your OpenAI API key (sk-...). Stays in your env, forwarded upstream. */
  openaiApiKey: string;
  /** Your Tessera API key (tk_...). Get one at tesseraai.io/dev. */
  tesseraApiKey: string;
  /** Additional headers to merge with the Tessera auth header. */
  extraHeaders?: Record<string, string>;
  /** Override the upstream proxy URL (defaults to api.tesseraai.io/v1/openai). */
  baseUrl?: string;
  /** OpenAI organization id, passed through to @ai-sdk/openai. */
  organization?: string;
}

export async function tesseraOpenAI(input: TesseraOpenAIFactoryInput): Promise<unknown> {
  const { createOpenAI } = await import("@ai-sdk/openai");
  const cfg = tesseraOpenAIConfig({
    apiKey: input.tesseraApiKey,
    extraHeaders: input.extraHeaders,
    baseUrl: input.baseUrl,
  });
  return createOpenAI({
    apiKey: input.openaiApiKey,
    baseURL: cfg.baseURL,
    headers: cfg.headers,
    ...(input.organization ? { organization: input.organization } : {}),
  });
}

export interface TesseraAnthropicFactoryInput {
  anthropicApiKey: string;
  tesseraApiKey: string;
  extraHeaders?: Record<string, string>;
  baseUrl?: string;
}

export async function tesseraAnthropic(input: TesseraAnthropicFactoryInput): Promise<unknown> {
  const { createAnthropic } = await import("@ai-sdk/anthropic");
  const cfg = tesseraAnthropicConfig({
    apiKey: input.tesseraApiKey,
    extraHeaders: input.extraHeaders,
    baseUrl: input.baseUrl,
  });
  return createAnthropic({
    apiKey: input.anthropicApiKey,
    baseURL: cfg.baseURL,
    headers: cfg.headers,
  });
}

export interface TesseraMistralFactoryInput {
  mistralApiKey: string;
  tesseraApiKey: string;
  extraHeaders?: Record<string, string>;
  baseUrl?: string;
}

export async function tesseraMistral(input: TesseraMistralFactoryInput): Promise<unknown> {
  const { createMistral } = await import("@ai-sdk/mistral");
  const cfg = tesseraMistralConfig({
    apiKey: input.tesseraApiKey,
    extraHeaders: input.extraHeaders,
    baseUrl: input.baseUrl,
  });
  return createMistral({
    apiKey: input.mistralApiKey,
    baseURL: cfg.baseURL,
    headers: cfg.headers,
  });
}

export interface TesseraGroqFactoryInput {
  groqApiKey: string;
  tesseraApiKey: string;
  extraHeaders?: Record<string, string>;
  baseUrl?: string;
}

export async function tesseraGroq(input: TesseraGroqFactoryInput): Promise<unknown> {
  const { createGroq } = await import("@ai-sdk/groq");
  const cfg = tesseraGroqConfig({
    apiKey: input.tesseraApiKey,
    extraHeaders: input.extraHeaders,
    baseUrl: input.baseUrl,
  });
  return createGroq({
    apiKey: input.groqApiKey,
    baseURL: cfg.baseURL,
    headers: cfg.headers,
  });
}

export interface TesseraCohereFactoryInput {
  cohereApiKey: string;
  tesseraApiKey: string;
  extraHeaders?: Record<string, string>;
  baseUrl?: string;
}

export async function tesseraCohere(input: TesseraCohereFactoryInput): Promise<unknown> {
  const { createCohere } = await import("@ai-sdk/cohere");
  const cfg = tesseraCohereConfig({
    apiKey: input.tesseraApiKey,
    extraHeaders: input.extraHeaders,
    baseUrl: input.baseUrl,
  });
  return createCohere({
    apiKey: input.cohereApiKey,
    baseURL: cfg.baseURL,
    headers: cfg.headers,
  });
}
