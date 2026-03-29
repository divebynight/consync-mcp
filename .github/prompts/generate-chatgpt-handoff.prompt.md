---
agent: agent
description: Generate a compact, copy-ready ChatGPT handoff from the repo state files.
---

Generate a compact ChatGPT handoff for the current Consync repo state.

Read:

- `state/current-state.json`
- `state/current-state.md`
- `state/handoff.md`
- any directly relevant docs already referenced by those files

Produce:

- one compact markdown block that the user can copy into ChatGPT
- output only that handoff block unless the user explicitly asks for commentary

Include only the minimum useful context:

- repo purpose
- current architecture truth
- current goal
- verified behavior
- inferred or pending areas
- blockers
- next suggested step

Rules:

- Do not dump transcripts.
- Do not include stale history unless it still affects the current task.
- Prefer bullets over long narrative.
- Keep the handoff compact enough to be practical.

Required format:

```md
# ChatGPT Handoff

## Goal
...

## Runtime truth
...

## Verification
...

## Working tree
...

## Blockers
...

## Question
...
```

If the user explicitly asks for it, also update `state/handoff.md` with a short relay summary.