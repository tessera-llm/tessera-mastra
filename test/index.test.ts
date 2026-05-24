import { describe, it, expect } from "vitest";
import {
  TESSERA_BASE_URL,
  tesseraOpenAIConfig,
  tesseraAnthropicConfig,
  tesseraMistralConfig,
  tesseraGroqConfig,
  tesseraCohereConfig,
  tesseraConfig,
} from "../src/index.js";

describe("tesseraOpenAIConfig", () => {
  it("returns the OpenAI proxy configuration", () => {
    const cfg = tesseraOpenAIConfig({ apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/openai`);
    expect(cfg.headers).toEqual({ "x-tessera-api-key": "tk_test" });
  });

  it("merges extra headers", () => {
    const cfg = tesseraOpenAIConfig({
      apiKey: "tk_test",
      extraHeaders: { "x-trace": "abc" },
    });
    expect(cfg.headers).toEqual({
      "x-trace": "abc",
      "x-tessera-api-key": "tk_test",
    });
  });

  it("accepts a custom base URL override", () => {
    const cfg = tesseraOpenAIConfig({
      apiKey: "tk_test",
      baseUrl: "https://staging.tesseraai.io/v1/openai",
    });
    expect(cfg.baseURL).toBe("https://staging.tesseraai.io/v1/openai");
  });

  it("rejects empty apiKey", () => {
    expect(() => tesseraOpenAIConfig({ apiKey: "" })).toThrow(/non-empty/);
  });
});

describe("tesseraAnthropicConfig", () => {
  it("returns the Anthropic proxy configuration", () => {
    const cfg = tesseraAnthropicConfig({ apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/anthropic`);
    expect(cfg.headers).toEqual({ "x-tessera-api-key": "tk_test" });
  });
});

describe("tesseraMistralConfig", () => {
  it("returns the Mistral proxy configuration", () => {
    const cfg = tesseraMistralConfig({ apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/mistral`);
    expect(cfg.headers).toEqual({ "x-tessera-api-key": "tk_test" });
  });
});

describe("tesseraGroqConfig", () => {
  it("returns the Groq proxy configuration", () => {
    const cfg = tesseraGroqConfig({ apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/groq`);
    expect(cfg.headers).toEqual({ "x-tessera-api-key": "tk_test" });
  });
});

describe("tesseraCohereConfig", () => {
  it("returns the Cohere proxy configuration", () => {
    const cfg = tesseraCohereConfig({ apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/cohere`);
    expect(cfg.headers).toEqual({ "x-tessera-api-key": "tk_test" });
  });
});

describe("tesseraConfig (generic dispatcher)", () => {
  it("routes openai", () => {
    const cfg = tesseraConfig("openai", { apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/openai`);
  });

  it("routes anthropic", () => {
    const cfg = tesseraConfig("anthropic", { apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/anthropic`);
  });

  it("routes mistral", () => {
    const cfg = tesseraConfig("mistral", { apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/mistral`);
  });

  it("routes groq", () => {
    const cfg = tesseraConfig("groq", { apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/groq`);
  });

  it("routes cohere", () => {
    const cfg = tesseraConfig("cohere", { apiKey: "tk_test" });
    expect(cfg.baseURL).toBe(`${TESSERA_BASE_URL}/v1/cohere`);
  });

  it("rejects unknown provider", () => {
    expect(() =>
      // @ts-expect-error — intentional invalid provider
      tesseraConfig("unknown", { apiKey: "tk_test" }),
    ).toThrow(/Unknown provider/);
  });
});
