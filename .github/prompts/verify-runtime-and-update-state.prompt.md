---
agent: agent
description: Verify the current runtime behavior and refresh the shared state snapshot files.
---

Verify the current Consync runtime and update the shared-state files.

Tasks:

1. Read the current shared-state files:
   - `state/current-state.json`
   - `state/current-state.md`
   - `state/handoff.md`
2. Verify current behavior conservatively:
   - run `npm test`
   - verify `npm start` or `node src/server.js`
   - verify whiteboard read and append flows using a temporary whiteboard path
   - verify auth behavior only if the server currently supports bearer auth
3. Update `state/current-state.json` with current verification results.
4. Update `state/current-state.md` to match the machine snapshot.
5. Update `state/handoff.md` only if the active relay needs a new concise note.

Rules:

- Use temporary files or paths for verification when possible.
- Preserve current behavior.
- Do not add new features during verification.
- Distinguish verified behavior from inferred behavior.
- Keep notes short and useful.

Output:

- Short pass/fail summary and what state files were updated.