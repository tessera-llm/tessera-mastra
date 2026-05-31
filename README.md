# `@tessera-llm/mastra`

**Drop-in cost optimization for the [Mastra](https://mastra.ai) agent framework.** One line of config routes every Mastra Agent's LLM calls through the [Tessera](https://tesseraai.io) optimization proxy: auto-route to cheaper-equivalent models, exact + provider-prompt-cache hits, prompt compression with per-stack quality canary, batch arbitrage on async-tolerant calls. Free Sandbox tier: **60M tokens/month, no card**. Paid tiers: **flat monthly subscription by token volume — keep 100% of savings**.

<!-- COMPANION-PACKAGES-START -->
Companion to [`tessera-sdk`](https://github.com/tessera-llm/tessera-sdk) (vanilla provider SDKs), [`tessera-langchain`](https://github.com/tessera-llm/tessera-langchain) (LangChain integration), [`tessera-vercel-ai`](https://github.com/tessera-llm/tessera-vercel-ai) (Vercel AI SDK integration), [`tessera-llamaindex`](https://github.com/tessera-llm/tessera-llamaindex) (LlamaIndex integration), [`tessera-pydantic-ai`](https://pypi.org/project/tessera-pydantic-ai/) (Pydantic AI integration), [`tessera-crewai`](https://pypi.org/project/tessera-crewai/) (CrewAI multi-agent integration), and [`tessera-autogen`](https://pypi.org/project/tessera-autogen/) (AutoGen 0.4+ multi-agent integration). Same proxy, same mechanic stack, Mastra-shaped API.
<!-- COMPANION-PACKAGES-END -->

[![npm version](https://img.shields.io/npm/v/@tessera-llm/mastra.svg)](https://www.npmjs.com/package/@tessera-llm/mastra) [![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

---

## What it looks like

```ts
import { Agent } from "@mastra/core/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { tesseraOpenAIConfig } from "@tessera-llm/mastra";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  ...tesseraOpenAIConfig({ apiKey: process.env.TESSERA_API_KEY! }),
});

export const supportAgent = new Agent({
  name: "Support",
  instructions: "Triage incoming support tickets in two sentences.",
  model: openai("gpt-4o"),
});
```

Three changes in your code: one import, three lines in the constructor call. Every `agent.generate()` and `agent.stream()` call lands on the Tessera proxy with auto-route + auto-cache + auto-compress + auto-batch applied.

Or use the convenience factory (skips the explicit `createOpenAI` import):

```ts
import { Agent } from "@mastra/core/agent";
import { tesseraOpenAI } from "@tessera-llm/mastra";

const openai = await tesseraOpenAI({
  openaiApiKey: process.env.OPENAI_API_KEY!,
  tesseraApiKey: process.env.TESSERA_API_KEY!,
});

export const supportAgent = new Agent({
  name: "Support",
  instructions: "Triage incoming support tickets in two sentences.",
  model: openai("gpt-4o"),
});
```

Mastra's [model router](https://mastra.ai/models) accepts AI SDK provider modules natively, so any provider returned by Tessera's factory works as a drop-in for the `model:` field on `new Agent({...})`.

---

## Install

```bash
npm install @tessera-llm/mastra @mastra/core
# Plus whichever provider package you use:
npm install @ai-sdk/openai          # or @ai-sdk/anthropic / @ai-sdk/mistral / @ai-sdk/groq / @ai-sdk/cohere
```

The `@ai-sdk/*` and `@mastra/core` packages are peer dependencies. Install only the providers you actually use. The Mastra core SDK is whatever version you already have on the project.

Get a free Tessera API key (60M tokens/mo, no card) at **[tesseraai.io/dev](https://tesseraai.io/dev)**. Sign-up takes ~30 seconds and returns an instant `tk_…` key plus magic-link dashboard access.

---

## Provider support

| Provider | @ai-sdk package | Tessera config function | Convenience factory |
|---|---|---|---|
| OpenAI | `@ai-sdk/openai` | `tesseraOpenAIConfig` | `tesseraOpenAI` |
| Anthropic | `@ai-sdk/anthropic` | `tesseraAnthropicConfig` | `tesseraAnthropic` |
| Mistral | `@ai-sdk/mistral` | `tesseraMistralConfig` | `tesseraMistral` |
| Groq | `@ai-sdk/groq` | `tesseraGroqConfig` | `tesseraGroq` |
| Cohere | `@ai-sdk/cohere` | `tesseraCohereConfig` | `tesseraCohere` |

Generic dispatcher available too: `tesseraConfig("openai", { apiKey: "tk_..." })` returns the right `{ baseURL, headers }` object regardless of provider. Useful when the provider is parameterized at runtime.

---

## Worked example

Real customer-support agent on `gpt-4o`, 5B tokens/month, OpenAI list prices:

| Stage | Cost / mo | Saved |
|---|---:|---:|
| Baseline (OpenAI direct via Mastra) | $24,000 | n/a |
| + Tessera (route, cache, prompt-cache headers, compress, M9 ceiling, batch) | $9,400 | $14,600 |
| Tessera subscription (Scale tier, flat) | $3,999 | n/a |
| **You net pay** | **$13,399** | **$10,601 / mo saved** |

**Verify the savings math yourself.** Every billable line traces back to two immutable cost figures pinned to a multi-source pricing catalog snapshot captured at request time. Two engineers, three hours, can re-derive any month from raw inputs. Full procedure at [tesseraai.io/trust](https://tesseraai.io/trust).

Quality canary across the full mechanic stack: mean-score 0.96 (floor 0.95). 0.95 SLA held all 30 days. Full breakdown: [worked example with mechanic-level numbers + canary results](https://tesseraai.io/blog/cut-openai-bill-48-percent-without-quality-regression).

---

## What Tessera does on every Agent call

Same mechanic stack as the main [`tessera-sdk`](https://github.com/tessera-llm/tessera-sdk). Each mechanic is opt-in per workload, observable per request, and bypasses when its quality canary drops below the per-stack 0.95 floor.

| Mechanic | What it does | Typical savings |
|---|---|---|
| **Auto-route** <sub>(m1)</sub> | Route to a cheaper-equivalent model gated by a daily promptfoo canary on your eval set | 15–35% on routed calls |
| **Auto-cache** <sub>(m2)</sub> | sha256 cache on the canonical request body, 7-day TTL, Cloudflare edge KV | 5–40% depending on prompt repetition |
| **Auto-compress** <sub>(m3)</sub> | Per-role heuristic compression (system + user toggles independent). Preserves code fences and JSON shapes. | 5–15% on prompt tokens |
| **Prompt cache** <sub>(m6)</sub> | Inject provider-native cache headers: OpenAI cached-input (50% off), Anthropic `cache_control: ephemeral` (90% off cache reads) | 50–90% on cached prefixes |
| **Context prune** <sub>(m7)</sub> | Conservative trim on long conversations (system + last 8 turns; TF-IDF rerank on RAG attachments) | 5–25% on multi-turn workloads |
| **Output-length ceiling** <sub>(m9)</sub> | Daily compute fits p90 of completion length per workload, injects `maxTokens = p90 × 1.3` | 5–15% on completion cost |
| **Batch arbitrage** <sub>(m10)</sub> | Route async-tolerant Agent calls to provider Batch APIs (OpenAI Batch + Anthropic Message Batches both 50% off) | 50% on batch-eligible traffic |
| **Cross-provider failover** <sub>(m11)</sub> | When primary upstream returns 5xx / connection error / timeout, retry on OpenRouter (opt-in, default OFF) | Reliability primitive, n/a cost |
| **Per-provider circuit breaker** | Rolling 5xx-rate state machine per upstream. When a provider degrades, auto-route skips its intra-provider alternative mappings until the half-open probe succeeds. | n/a (keeps the savings stack honest) |

---

## Pricing

- **Free Sandbox**: 60M tokens/month, 30 requests/minute, full mechanic stack active (route · cache · compress · batch). No card. Forever.
- **Paid tiers** — flat monthly subscription by token volume: Starter $199 (≤1B), Growth $999 (≤5B), Scale $3,999 (≤20B), Enterprise custom (20B+). You keep 100% of measured savings.

Existing customers of `tessera-sdk`, `tessera-langchain`, `tessera-llamaindex`, or `tessera-vercel-ai` keep their `rate_locked_pct` (if any) on this package too. Same `tk_…` key, same billing record.

---

## FAQ

### Q: How is this different from the other tessera-* packages?

Same proxy. Same mechanics. Same billing. The five packages target different code surfaces:

- **`tessera-sdk`**: patches the underlying provider client constructors (OpenAI, Anthropic, etc.) directly via `tessera.activate(key)`. Use when calling provider SDKs without a framework.
- **`tessera-langchain`**: wires into LangChain ChatModel constructors. Use when you're on LangChain.
- **`tessera-llamaindex`**: wires into LlamaIndex `LLM` adapter constructors. Use when you're on LlamaIndex.
- **`tessera-vercel-ai`**: wires into the Vercel AI SDK provider factories. Use when you're on `ai` core + `@ai-sdk/*` without Mastra.
- **`tessera-mastra`** *(this package)*: same Vercel AI SDK provider factory shape, Mastra-shaped README and E2E gate. Use when you're on Mastra Agents.

Pick whichever fits your codebase. Side-by-side install is supported: all five resolve to the same proxy and same billing record.

### Q: Does this break my Agent tools / structured outputs / streaming / RAG?

No. The Vercel AI SDK provider object that Mastra accepts is unchanged in shape (`agent.generate()`, `agent.stream()`, `generateObject`, schema-constrained tool calls, and RAG retrieval workflows all work unchanged). Auto-route gates on tool-calling capability so an agent using tools never gets routed to a non-tool-capable model.

### Q: Does this work with Mastra's string-shorthand model ID (`"openai/gpt-4o"`)?

Not directly. Mastra's string shorthand uses environment variables like `OPENAI_API_KEY` against the provider's canonical endpoint. Tessera needs a custom `baseURL` + custom `x-tessera-api-key` header, which the string shorthand doesn't surface. Use the AI SDK provider factory form (shown in the examples above); Mastra accepts it as a first-class alternative to the string shorthand.

### Q: What happens if Tessera's proxy is down?

Your Agent gets HTTP errors instead of LLM responses. On the proxy side, a per-provider circuit breaker tracks rolling 5xx rates and skips degraded providers in auto-route decisions. Cross-provider failover (m11) is opt-in and re-routes to OpenRouter when the primary upstream is down. See the workload toggle in the dashboard.

### Q: What happens to my OpenAI / Anthropic rate limits?

They pass through. Tessera does not aggregate quotas across customers. Your provider rate limits apply normally; the proxy enforces only the Tessera tier limits (30 rpm Free Sandbox, 60 rpm Production by default; higher on request).

### Q: Are you storing my prompts and completions?

No. We log only token counts, cost deltas, mechanics_stack, and provider response status. Prompts and completions are never persisted. Full data handling on [`tesseraai.io/security`](https://tesseraai.io/security).

### Q: Why are there two API surfaces (`tesseraOpenAIConfig` vs `tesseraOpenAI`)?

The config function returns the kwargs object you spread into `createOpenAI(...)`: explicit, easy to combine with other settings (organization, custom fetch, etc.). The convenience factory imports `createOpenAI` for you and pre-merges. Use whichever you find more readable. Both ship in the same package.

---

## Links

- **Dashboard + free signup:** [tesseraai.io/dev](https://tesseraai.io/dev)
- **How it works (per-mechanic deep dives):** [tesseraai.io/how-it-works](https://tesseraai.io/how-it-works)
- **Security + data handling:** [tesseraai.io/security](https://tesseraai.io/security)
- **Worked-numbers blog post:** [Customer-support workload, 48% saved, quality held](https://tesseraai.io/blog/cut-openai-bill-48-percent-without-quality-regression)
- **Mastra docs:** [mastra.ai](https://mastra.ai)

---

## About Tessera

Tessera is the **substrate layer** for **LLM cost optimization**, also called the **Optimize Layer** in our product surface. A thin proxy that sits in your application's **request-path**, applies a conservative cascade of optimization mechanics, and measures every saved dollar against an **audit-immutable** baseline. We charge a **flat monthly subscription by token volume**; you keep **100% of measured savings**. No per-token gateway fee; the category we operate in is "**LLM cost optimizer**," distinct from per-token **AI gateways** and observability dashboards.

Where observability tools tell you what you spent and AI gateways re-shape the request without measuring the cost delta, Tessera is the layer that does both, and shows you every measured saved dollar. The **verified-savings ledger** at [`ledger.tesseraai.io`](https://ledger.tesseraai.io) shows every original-vs-actual cost pair, snapshot-pinned to a `pricing_catalog` version captured at request time. Mid-contract price changes don't retroactively alter past savings. This is the **FinOps**-friendly model for AI inference: every line of the bill traces to a code-enforced rule.

Apache-2.0. Operated by Fintechagency OÜ (Tallinn, Estonia, registry code 16638667). Issues: [github.com/tessera-llm/tessera-mastra/issues](https://github.com/tessera-llm/tessera-mastra/issues).

- Developer entry: [tesseraai.io/dev](https://tesseraai.io/dev)
- Mechanic reference: [tesseraai.io/how-it-works](https://tesseraai.io/how-it-works)
- Dashboard: [ledger.tesseraai.io](https://ledger.tesseraai.io)
- Engineering blog: [tesseraai.io/blog](https://tesseraai.io/blog)
