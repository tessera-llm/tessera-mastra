# Changelog — @tessera-llm/mastra

All notable changes to this package are documented here. Versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Wire format
compatibility across minor versions (0.X.Y) — breaking changes only on
major bumps.

## [0.1.0] — 2026-05-21 — first public release

- 5 provider config functions (`tesseraOpenAIConfig`, `tesseraAnthropicConfig`,
  `tesseraMistralConfig`, `tesseraGroqConfig`, `tesseraCohereConfig`) returning
  the `{ baseURL, headers }` shape accepted by `@ai-sdk/*` `createX` factories.
- 5 convenience factories (`tesseraOpenAI`, `tesseraAnthropic`, `tesseraMistral`,
  `tesseraGroq`, `tesseraCohere`) returning the provider function `(modelId) =>
  model` that Mastra's `new Agent({ model: ... })` accepts as a first-class
  alternative to the `"provider/model"` string shorthand.
- Generic dispatcher `tesseraConfig(provider, input)` with exhaustive switch +
  unknown-provider rejection.
- Apache-2.0. Peer dependencies on `@mastra/core` and `@ai-sdk/*` are all
  optional — install only the providers you actually use.
- E2E gate covers all 5 provider convenience factories per the multi-framework
  distribution playbook locked 2026-05-19.
