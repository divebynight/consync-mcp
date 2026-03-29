# Current State

## Repo

- Name: `consync-mcp`
- Branch: `rescue/wrong-repo-hardening`
- Commit: `af5acfdeabfb8bdc35f92fa18fe4608486d85268`
- Working tree: dirty

Tracked changes:

- Modified: `README.md`, `docs/architecture.md`, `docs/whiteboard-contract.md`, `package.json`, `src/index.js`, `src/services/agent.js`, `src/utils/whiteboard-path.js`
- Deleted: `dev-harness/*` tracked runtime files
- Untracked: new prompt files, new state files, new docs, `refactor-diff.txt`, and `src/client.js`, `src/server.js`, `src/state-loader.js`, `src/test.js`

## Runtime Truth

- Canonical implementation: `src/`
- Entry point: `src/index.js`
- Server: `src/server.js`
- Client CLI: `src/client.js`
- Test file: `src/test.js`
- Default live whiteboard path: `artifacts/whiteboard.md`

## Command Status

- `npm start`: verified
- `npm run dev`: inferred
  - same command as `npm start` in `package.json`
- `npm test`: verified
- `src/client.js` read/append/decide/agent/exec flows: verified
- bearer auth on `/tool`: verified

Latest verification refresh: `2026-03-29T18:49:42Z`

## Current Work

- Goal: set up lightweight shared state and handoff workflow
- Next step: use the prompt files in `.github/prompts/` to update or verify state after material repo changes
- Blockers:
  - working tree is still dirty from ongoing refactor and documentation changes
  - empty `dev-harness/` directories still exist locally even though runtime behavior has moved to `src/`

## State Files

- Machine truth: `state/current-state.json`
- Human summary: `state/current-state.md`
- Human relay: `state/handoff.md`

## Prompt Files

- `.github/prompts/update-current-state.prompt.md`
- `.github/prompts/verify-runtime-and-update-state.prompt.md`
- `.github/prompts/generate-chatgpt-handoff.prompt.md`

Keep this file concise. When state changes materially, update the JSON first and then refresh this summary.