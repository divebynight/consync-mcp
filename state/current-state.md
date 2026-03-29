# Current State

## Repo

- Name: `consync-mcp`
- Branch: `feature/shared-state-updates`
- Commit: `4bdf91a6024c681607178a8de6217a68142b74e3`
- Working tree: dirty

Tracked changes:

- Modified: `package.json`, `state/current-state.json`, `state/current-state.md`
- Deleted: none
- Untracked: 3 files

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

Last state update: `2026-03-29T19:40:51.425Z`

## Current Work

- Goal: Set up shared state and handoff workflow for Consync MCP.
- Next step: Review the new state and prompt files, then use the update or verify prompts after the next material repo change.
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
