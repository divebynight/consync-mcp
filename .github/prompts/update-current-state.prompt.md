---
agent: agent
description: Inspect the repo and update the shared current-state JSON and Markdown files.
---

Inspect the current Consync repo state and update the shared snapshot files.

Tasks:

1. Read:
   - `state/current-state.json`
   - `state/current-state.md`
   - `state/handoff.md`
   - `package.json`
   - `README.md`
   - `docs/post-refactor-verification.md` if it exists
2. Read the current git state:
   - current branch
   - current commit
   - working tree status
3. Update `state/current-state.json` with the latest repo/runtime/task snapshot.
4. Update `state/current-state.md` so it stays aligned with the JSON snapshot.
5. Only update `state/handoff.md` if the active relay context materially changed.

Rules:

- Keep files compact.
- Overwrite stale snapshot content instead of appending logs.
- Mark status as `verified`, `inferred`, or `pending`.
- Do not run broader feature work.
- Do not add dependencies.

Output:

- Brief summary of what changed in the state files.