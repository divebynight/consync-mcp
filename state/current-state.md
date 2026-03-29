# Current State

## Repo

- Name: `consync-mcp`
- Branch: `feature/shared-state-updates`
- Commit: `7cb4bbb83fb85713b6372c30c7a57f69d35d3c86`
- Working tree: dirty

Tracked changes:

- Modified: `state/current-state.json`, `state/current-state.md`
- Deleted: none
- Untracked: none

## Runtime Truth

- Canonical implementation: `src/`
- Entry point: `src/index.js`
- Server: `src/server.js`
- Client CLI: `src/client.js`
- Test file: `src/test.js`
- Default live whiteboard path: `artifacts/whiteboard.md`

## Command Status

- `npm start`: passed
- `npm run dev`: inferred
- `npm test`: passed
- whiteboard read: passed
- whiteboard append: passed
- bearer auth on `/tool`: passed

Last state update: `2026-03-29T20:51:56.928Z`

## Current Work

- Goal: Add a single low-friction review loop entry point that updates state, verifies runtime, and generates the ChatGPT handoff in one command.
- Next step: Use npm run review:handoff as the primary review loop, then decide whether the state files should remain tracked repo files or become generated artifacts.
- Blockers:
  - Working tree is currently dirty from ongoing refactor and documentation changes.
  - Empty dev-harness directory shells still exist locally even though runtime code no longer depends on them.

## State Files

- Machine truth: `state/current-state.json`
- Human summary: `state/current-state.md`
- Human relay: `state/handoff.md`

## Prompt Files

- `.github/prompts/update-current-state.prompt.md`
- `.github/prompts/verify-runtime-and-update-state.prompt.md`
- `.github/prompts/generate-chatgpt-handoff.prompt.md`

Keep this file concise. When state changes materially, update the JSON first and then refresh this summary.
