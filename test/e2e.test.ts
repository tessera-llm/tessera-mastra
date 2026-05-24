/**
 * E2E shape compatibility tests — verify each convenience factory
 * actually works against the real @ai-sdk/* package it dynamically imports,
 * AND that the result is the shape Mastra's `new Agent({ model: ... })`
 * expects (a function (modelId) => model object).
 *
 * Gated by the @ai-sdk/* packages being installed as devDependencies. CI
 * installs them on every push so the gate always runs. If a future
 * @ai-sdk/* release changes its createX signature in a breaking way OR
 * Mastra changes its model-acceptance contract, these tests fail BEFORE
 * we ship a release that breaks customers.
 *
 * Locked 2026-05-21 — same pattern as @tessera-llm/vercel-ai e2e.test.ts.
 * Per the multi-framework distribution playbook, every convenience
 * factory must be verified by an import-and-construct check; assumed-
 * shape signatures are the dominant historical regression class.
 */

import { describe, it, expect } from "vitest";
import {
  tesseraOpenAI,
  tesseraAnthropic,
  tesseraMistral,
  tesseraGroq,
  tesseraCohere,
  TESSERA_BASE_URL,
} from "../src/index.js";

describe("convenience factory E2E — all 5 providers", () => {
  it("tesseraOpenAI returns a callable @ai-sdk/openai provider", async () => {
    const provider = (await tesseraOpenAI({
      openaiApiKey: "sk-fake",
      tesseraApiKey: "tk_test",
    })) as (modelId: string) => { modelId: string };
    expect(typeof provider).toBe("function");
    const model = provider("gpt-4o");
    expect(model.modelId).toBe("gpt-4o");
  });

  it("tesseraAnthropic returns a callable @ai-sdk/anthropic provider", async () => {
    const provider = (await tesseraAnthropic({
      anthropicApiKey: "sk-ant-fake",
      tesseraApiKey: "tk_test",
    })) as (modelId: string) => { modelId: string };
    expect(typeof provider).toBe("function");
    const model = provider("claude-sonnet-4-5-20250929");
    expect(model.modelId).toBe("claude-sonnet-4-5-20250929");
  });

  it("tesseraMistral returns a callable @ai-sdk/mistral provider", async () => {
    const provider = (await tesseraMistral({
      mistralApiKey: "fake-mistral-key",
      tesseraApiKey: "tk_test",
    })) as (modelId: string) => { modelId: string };
    expect(typeof provider).toBe("function");
    const model = provider("mistral-large-latest");
    expect(model.modelId).toBe("mistral-large-latest");
  });

  it("tesseraGroq returns a callable @ai-sdk/groq provider", async () => {
    const provider = (await tesseraGroq({
      groqApiKey: "gsk-fake",
      tesseraApiKey: "tk_test",
    })) as (modelId: string) => { modelId: string };
    expect(typeof provider).toBe("function");
    const model = provider("llama-3.3-70b-versatile");
    expect(model.modelId).toBe("llama-3.3-70b-versatile");
  });

  it("tesseraCohere returns a callable @ai-sdk/cohere provider", async () => {
    const provider = (await tesseraCohere({
      cohereApiKey: "fake-cohere",
      tesseraApiKey: "tk_test",
    })) as (modelId: string) => { modelId: string };
    expect(typeof provider).toBe("function");
    const model = provider("command-r-plus-08-2024");
    expect(model.modelId).toBe("command-r-plus-08-2024");
  });

  it("TESSERA_BASE_URL matches expected production endpoint", () => {
    expect(TESSERA_BASE_URL).toBe("https://api.tesseraai.io");
  });
});
