# Publish playbook — @tessera-llm/mastra

This scaffold lives inside the monorepo at `packages/tessera-mastra/` per
founder direction (cherry-pick to the public `tessera-llm/tessera-mastra`
repo + npm publish from there). Same workflow shape as
`tessera-vercel-ai`, `tessera-langchain`, `tessera-llamaindex`.

## Cherry-pick to public repo

```bash
# From /root/Skin/tessera-ai/
gh repo create tessera-llm/tessera-mastra --public --description "Drop-in cost optimization for the Mastra agent framework"
cd /root/Skin
git clone git@github.com:tessera-llm/tessera-mastra.git tessera-mastra
cp -r tessera-ai/packages/tessera-mastra/* tessera-mastra/
cd tessera-mastra
git add .
git commit -m "feat: initial scaffold from tessera-ai/packages/tessera-mastra"
git push origin main
```

The scaffold needs the same CI workflow scaffolding as the sibling repos —
clone `tessera-langchain/.github/workflows/publish-node.yml` (or the
vercel-ai equivalent) into the new repo before tagging the first release.

## Publish v0.1.0

1. **Repo secret configured** (one-time setup):
   - `NPM_TOKEN` — npm automation token with publish access to `@tessera-llm/mastra`
   Set via `gh secret set NPM_TOKEN --repo tessera-llm/tessera-mastra` or in
   Settings → Secrets → Actions.

2. **Verify version in two places** (must match — already aligned in scaffold):
   - `package.json` → `"version": "0.1.0"`
   - `src/index.ts` → `export const VERSION = "0.1.0";`

3. **CHANGELOG.md** already includes the 0.1.0 block.

4. **Commit + push** (if changes after cherry-pick).

5. **Create + push release tag:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```
   The `v*` tag triggers `publish-node.yml` → npm publish.

6. **Verify after publish:**
   ```bash
   curl -sI https://registry.npmjs.org/@tessera-llm/mastra/0.1.0
   ```
   Should return 200 OK. npm usually indexes within 10-30 seconds.

7. **GitHub Release object:**
   ```bash
   gh release create v0.1.0 --title "v0.1.0 — first public release" --notes-file <(awk '/^## \[0\.1\.0\]/{flag=1} /^## \[/&&!/0\.1\.0/{flag=0} flag' CHANGELOG.md)
   ```

8. **Announce + cross-link:**
   - Update README in `tessera-sdk`, `tessera-langchain`, `tessera-llamaindex`,
     `tessera-vercel-ai` to mention the new sibling.
   - Update the `/dev` page on `tesseraai.io` framework matrix to include
     Mastra.
   - Submit to awesome-mastra lists if any (per the playbook).

## Versioning policy

Semver. Wire format compatibility across minor versions (0.X.Y). Breaking
changes only on major bumps. The wire shape this package commits to is the
`{ baseURL, headers }` object returned by `tessera*Config` — that contract
holds across patches.
