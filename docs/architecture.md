# Architecture

## Current state

The repository is in a transitional state.

The only working runtime implementation currently lives in `dev-harness/`. The top-level `src/` tree exists as the destination structure for a future migration, but it does not yet contain the active server implementation.

## Current runtime flow

1. `src/index.js` acts as the top-level entry point.
2. `src/index.js` delegates directly to `dev-harness/server.js`.
3. `dev-harness/server.js` exposes the local HTTP tool endpoint.
4. `src/services/executor.js` sends tool requests to that server.
5. `src/services/agent.js` and `src/services/fake-model.js` build decisions.
6. `dev-harness/state-loader.js` reads whiteboard state from `dev-harness/artifacts/whiteboard.md`.

## Core modules

- `dev-harness/server.js`
- `dev-harness/state-loader.js`
- `src/services/executor.js`
- `src/services/agent.js`
- `src/services/fake-model.js`
- `src/schemas/tool-schema.js`
- `src/utils/debug.js`

These files contain the current functional behavior and should be treated as the migration source of truth.

## Harness-specific or support modules

- `dev-harness/client.js`
- `dev-harness/test.js`
- `dev-harness/debug.js`
- `dev-harness/agent.js`
- `dev-harness/executor.js`
- `dev-harness/fake-model.js`
- `dev-harness/tool-schema.js`
- `dev-harness/artifacts/whiteboard.md`

These are useful for local development and validation, but they do not define the long-term project structure by themselves.

## Migration constraints

The main blocker to moving code out of `dev-harness/` is path coupling.

`dev-harness/server.js` and `dev-harness/state-loader.js` both rely on `__dirname`-based paths that assume `artifacts/whiteboard.md` exists beside the harness code. Moving those files without first making storage paths explicit would break current behavior.

## Recommended migration order

1. Keep `dev-harness/` intact while path-coupled runtime files stay in place.
2. Extract pure logic and transport modules into `src/`, leaving compatibility wrappers in `dev-harness/`.
3. Move path-coupled storage and server modules last, after introducing an explicit storage location.

## Short-term goal

Maintain a stable, runnable project with a clear top-level entry point while preserving the original harness behavior unchanged.