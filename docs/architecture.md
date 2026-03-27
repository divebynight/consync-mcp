# Architecture

## Current state

The repository is in a transitional state.

The only working runtime implementation currently lives in `dev-harness/`. The top-level `src/` tree exists as the destination structure for a future migration, but it does not yet contain the active server implementation.

## Current runtime flow

1. `src/index.js` acts as the top-level entry point.
2. `src/index.js` delegates directly to `dev-harness/server.js`.
3. `dev-harness/server.js` exposes the local HTTP tool endpoint.
4. `dev-harness/executor.js` sends tool requests to that server.
5. `dev-harness/agent.js` and `dev-harness/fake-model.js` build decisions.
6. `dev-harness/state-loader.js` reads whiteboard state from `dev-harness/artifacts/whiteboard.md`.

## Core modules

- `dev-harness/server.js`
- `dev-harness/executor.js`
- `dev-harness/agent.js`
- `dev-harness/fake-model.js`
- `dev-harness/state-loader.js`
- `dev-harness/tool-schema.js`

These files contain the current functional behavior and should be treated as the migration source of truth.

## Harness-specific or support modules

- `dev-harness/client.js`
- `dev-harness/test.js`
- `dev-harness/debug.js`
- `dev-harness/artifacts/whiteboard.md`

These are useful for local development and validation, but they do not define the long-term project structure by themselves.

## Migration constraints

The main blocker to moving code out of `dev-harness/` is path coupling.

`dev-harness/server.js` and `dev-harness/state-loader.js` both rely on `__dirname`-based paths that assume `artifacts/whiteboard.md` exists beside the harness code. Moving those files without first making storage paths explicit would break current behavior.

## Recommended migration order

1. Keep `dev-harness/` intact while top-level metadata and entry points are corrected.
2. Move pure logic modules first, starting with schema and decision logic.
3. Move orchestration modules after imports are stable.
4. Move path-coupled storage and server modules last, after introducing an explicit storage location.

## Short-term goal

Maintain a stable, runnable project with a clear top-level entry point while preserving the original harness behavior unchanged.