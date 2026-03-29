# Copilot Instructions — Consync (v2)

## Project Context

Consync is evolving into a context engine for creative workflows.

- observes files
- analyzes media
- generates structure and meaning
- assists organization

## Rules

- Do not break existing behavior
- Extend incrementally
- Prefer real functionality over abstraction
- Keep tools small and composable
- Avoid over-engineering

## Architecture Truth

- `src/` is the canonical implementation location
- Do not reintroduce `dev-harness/`
- Entry point: `src/index.js`
- Server: `src/server.js`
- Client CLI: `src/client.js`
- Test entry: `src/test.js`
- Mutable whiteboard default: `artifacts/whiteboard.md`
- Tracked whiteboard example: `artifacts/whiteboard.example.md`

## Architecture Direction

System will support:
- directory scanning
- audio + image analysis
- session grouping
- metadata generation

## Code Guidelines

Current:
- CommonJS
- minimal deps

Future:
- TypeScript possible later

Do not migrate early.

## Safety

- Do not move files unless asked
- Do not add dependencies without approval
- Do not expand scope

## Shared State Model

Canonical shared-state files:

- `state/current-state.json`: machine-readable repo/runtime/task snapshot
- `state/current-state.md`: concise human-readable summary derived from current machine state
- `state/handoff.md`: short human relay notes only

Use this model consistently:

- update `state/current-state.json` first when repo, runtime, or task state materially changes
- keep `state/current-state.md` aligned with the JSON snapshot
- keep `state/handoff.md` short and overwrite-oriented, not an accumulating transcript
- prefer compact snapshots over append-only logs

## Behavior Rules

- Preserve working behavior during maintenance tasks
- Do not add dependencies without approval
- Do not expand scope during stabilization or state-maintenance work
- Distinguish `verified`, `inferred`, and `pending` status where relevant
- Update shared state when repo structure, runtime behavior, current work, or blockers materially change
- Prefer compact structured output over long narrative summaries

## Handoff Behavior

When asked to prepare information for ChatGPT or another system:

- do not make the user manually assemble context if it can be generated from repo state
- prefer a compact markdown block or a short update to `state/handoff.md`
- include only the minimum useful context needed to continue work
- prioritize current goal, runtime truth, verified behavior, blockers, and next step
- avoid dumping large transcripts or repeated background

## Prompt Workflow

Prompt files live in `.github/prompts/`.

Use them to:

- update current state snapshots
- verify runtime and update state
- generate compact ChatGPT handoff output

## Principle

Build through real usage, not theory.