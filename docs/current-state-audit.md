# Current State Audit

## Status

- Audit date: 2026-03-29
- Scope: current local repository state only
- Verification style: code inspection plus command execution against temporary files outside the repository

## Current Structure Summary

Top-level directories and roles:

- `src/`: intended long-term implementation location, but only partly live today
- `dev-harness/`: current runtime server, CLI client, state loader, and test entrypoints
- `artifacts/`: root-level whiteboard template and ignored live whiteboard path
- `docs/`: architecture and whiteboard notes, plus local untracked draft docs

Overlapping implementation paths:

- `src/index.js` is only a launcher into `dev-harness/server.js`
- `src/services/*`, `src/schemas/tool-schema.js`, and `src/utils/*` contain real logic
- several `dev-harness/*` files are compatibility wrappers around `src/*`
- `dev-harness/server.js` and `dev-harness/state-loader.js` still contain live behavior not yet moved

## Actual Runtime Entry Points

Verified entrypoints:

- `npm start` -> `node src/index.js` -> `dev-harness/server.js`
- `npm run dev` -> same command as `npm start` by script definition
- `npm test` -> `node dev-harness/test.js`
- `node dev-harness/server.js` -> starts the server directly
- `node dev-harness/client.js <command>` -> runs client flows directly

Current runtime path today:

1. `src/index.js`
2. `dev-harness/server.js`
3. `src/utils/whiteboard-path.js`
4. `src/utils/debug.js`
5. `src/services/executor.js`, `src/services/agent.js`, `src/services/fake-model.js`
6. `dev-harness/state-loader.js`

Conclusion:

- `src/index.js` is a shim, not the real implementation
- `dev-harness/` is still the true runtime source of behavior for server startup, client flows, and tests

## Current Working Commands

Verified working:

- `npm test`
- `npm start`
- `node dev-harness/server.js`
- `node dev-harness/client.js read`
- `node dev-harness/client.js append "..."`
- `node dev-harness/client.js decide "show it"`
- `node dev-harness/client.js agent "add ..."`
- `node dev-harness/client.js exec '{"tool":"read_whiteboard","input":{}}'`

Verified behavior details:

- `npm test` passes all current assertions
- `npm start` successfully launches the HTTP server through the shim
- direct harness server startup still works
- read, append, decide, agent, and exec client flows all work against the running server

Not separately executed but fully determined from scripts:

- `npm run dev` is currently equivalent to `npm start`

## Current Available Features

Verified current feature surface:

- HTTP server listening on configurable host and port
- `POST /tool` endpoint
- tool: `read_whiteboard`
- tool: `append_whiteboard`
- request size limit on `/tool`
- optional bearer auth on `/tool`
- request ID logging via `X-Run-Id`
- rule-based decision builder for read/append/continue flows
- end-to-end agent-style CLI flow that decides and executes
- whiteboard state summary loader used by decision flows

## Current Config / Environment Variables

Verified env vars in use:

- `CONSYNC_SERVER_HOST`: bind host, default `127.0.0.1`
- `CONSYNC_SERVER_PORT`: bind port, default `3000`
- `CONSYNC_AUTH_TOKEN`: optional bearer token for `/tool`
- `CONSYNC_WHITEBOARD_PATH`: override for whiteboard file path

Current whiteboard path behavior:

- live path resolution order is override -> `CONSYNC_WHITEBOARD_PATH` -> legacy `dev-harness/artifacts/whiteboard.md`
- relative override paths resolve from repository root
- `artifacts/whiteboard.md` is the intended root live path but is not the default yet

## What Was Actually Verified

Verified by execution:

- test suite passes
- shim-based startup works
- direct harness startup works
- read and append round trips work through `/tool`
- client decide flow works
- client agent flow works
- direct JSON exec flow works
- auth rejects missing token with `401`
- auth accepts a valid bearer token with `200`

Verified by inspection:

- `src/index.js` is a thin wrapper
- `package.json` scripts still point into `dev-harness/`
- `dev-harness/debug.js`, `dev-harness/executor.js`, `dev-harness/fake-model.js`, and `dev-harness/tool-schema.js` are wrappers
- `dev-harness/server.js` and `dev-harness/state-loader.js` are still live implementations

## Assessment

Is the repo usable?

- Yes

Is the repo broken?

- No, not in its current narrow scope

Is it half-refactored?

- Yes

Is it fixable without major redesign?

- Yes

Why:

- runtime surface is small
- core behavior is already isolated into a handful of files
- the main remaining duplication is structural rather than conceptual

## What Must Be Preserved In The Refactor

- `npm start` and `npm test` behavior
- `/tool` endpoint contract
- `read_whiteboard` and `append_whiteboard`
- decision logic in `src/services/fake-model.js`
- CLI flows: `read`, `append`, `exec`, `decide`, `agent`
- env var behavior for host, port, auth token, and whiteboard path
- request ID logging

## What Can Likely Be Removed After Migration

- the entire `dev-harness/` directory
- wrapper files that only re-export `src/*`
- legacy path fallback to `dev-harness/artifacts/whiteboard.md`
- README language describing `src/` as non-live once migration is complete

## Refactor Risks

- whiteboard default path currently depends on `dev-harness/artifacts/whiteboard.md`
- tests currently live under `dev-harness/`
- CLI help text and usage strings currently point to `dev-harness/*`
- docs still describe the current transitional state and will become inaccurate during migration

## Recommendation

Proceed with refactor.

Reason:

- the current implementation is working and small enough to migrate safely
- no major redesign is required
- the remaining work is mainly moving live files into `src/`, updating path defaults, and re-verifying behavior