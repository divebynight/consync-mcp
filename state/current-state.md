# Current State

## Repo

- Name: `consync-mcp`
- Branch: `feature/clean-up-state-docs`
- Commit: `233b2764a0f9d8c148d82d7b678ddb7d4ee82c5b`
- Live working tree: dirty

Live tracked changes:

- Modified: `scripts/generate-chatgpt-handoff.js`, `scripts/status.js`, `scripts/update-current-state.js`, `state/current-state.json`, `state/current-state.md`, `state/handoff.md`
- Deleted: none
- Untracked: none

Pre-refresh snapshot:

- Working tree: dirty
- Modified: `scripts/generate-chatgpt-handoff.js`, `scripts/status.js`, `scripts/update-current-state.js`, `state/current-state.json`, `state/current-state.md`, `state/handoff.md`
- Deleted: none
- Untracked: none

Generated outputs updated by refresh:

- `state/current-state.json`, `state/current-state.md`, `state/handoff.md`

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

Last state update: `2026-03-30T02:50:34.397Z`

## Current Work

- Goal: Refine refresh reporting so the handoff and status views separate pre-refresh repo dirtiness from generated state-file updates.
- Next step: Use npm run review:handoff to refresh state, then read pre-refresh state separately from generated output updates in the status and handoff views.
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
