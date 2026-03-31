Agent Handoff
STATUS: RUNTIME_TRUTH_CONFIRMED

GOAL:
Confirm the active runtime structure so future work uses the canonical paths and ignores legacy assumptions.

USER_NOTES:
Keep the handoff frictionless by default. Updating and passing context between ChatGPT and Copilot should require as few commands, copies, and manual captures as possible unless I explicitly intervene.

DIRECTION:
Use this file as the single handoff artifact. Update it in place and return the full updated markdown. Keep it concise, deterministic, and overwrite-oriented. Use NONE if a field does not apply.

PROMPT:
Review the current repository and confirm the active runtime structure.

What to do:
- Identify the canonical source directory (likely src/).
- Identify the true entry point (index.js or equivalent).
- Confirm whether any legacy directories (like dev-harness/) are still in use or can be ignored.
- Do not modify code.
- Do not refactor anything.
- Only inspect and report.

Return:
- A short "Runtime Truth" summary listing:
  - entry point
  - server file
  - client file (if any)
  - test file (if any)
  - any legacy folders that should be ignored

Then update RESULT and STATE with only the minimum information needed for the next step.

RESULT:
Runtime Truth:
- entry point: src/index.js
- server file: src/server.js
- client file: src/client.js
- test file: src/test.js
- legacy folders to ignore: dev-harness/ is not present in the repo and is not part of the active runtime

STATE:
- Canonical source directory is src/
- package.json main points to src/index.js
- src/index.js boots the server by requiring src/server.js
- src/client.js is the active client CLI
- src/test.js is the active test entry

NEXT:
Decide whether the next task is cleanup of legacy references or new feature work on the src-based runtime.