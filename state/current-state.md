# Current State

## Repo

- Name: `consync-mcp`
- Branch: `feature/shared-state-updates`
- Commit: `21a46b57fcbc2a642a9f1f35e0bb2ab983d55547`
- Working tree: dirty

Tracked changes:

- Modified: `package.json`, `scripts/generate-chatgpt-handoff.js`, `scripts/update-current-state.js`, `state/current-state.json`, `state/current-state.md`
- Deleted: none
- Untracked: 2 files

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

Last state update: `2026-03-29T21:08:36.225Z`

## Current Work

- Goal: Add read-only status and handoff display commands while keeping npm run review:handoff as the canonical mutating refresh path.
- Next step: Use npm run status or npm run handoff:print for inspection, and use npm run review:handoff when the tracked state files should be refreshed.
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
