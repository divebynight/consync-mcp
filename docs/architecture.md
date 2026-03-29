# Architecture

## Runtime layout

The repository now uses a single implementation tree under `src/`.

The active runtime entry point is `src/index.js`, which starts the HTTP server in `src/server.js`.

## Current runtime flow

1. `src/index.js` acts as the top-level entry point.
2. `src/server.js` exposes the local HTTP tool endpoint.
4. `src/services/executor.js` sends tool requests to that server.
5. `src/services/agent.js` and `src/services/fake-model.js` build decisions.
6. `src/state-loader.js` reads whiteboard state from the resolved runtime path.

## Core modules

- `src/server.js`
- `src/state-loader.js`
- `src/client.js`
- `src/test.js`
- `src/services/executor.js`
- `src/services/agent.js`
- `src/services/fake-model.js`
- `src/schemas/tool-schema.js`
- `src/utils/debug.js`

These files contain the current functional behavior.

## Design notes

- runtime logic remains intentionally small
- the server exposes only one endpoint, `POST /tool`
- current tools remain `read_whiteboard` and `append_whiteboard`
- the decision logic remains rule-based and deterministic
- tests remain lightweight and use Node's built-in `assert`

## Storage

- default live whiteboard path: `artifacts/whiteboard.md`
- tracked template path: `artifacts/whiteboard.example.md`
- explicit overrides still win via `CONSYNC_WHITEBOARD_PATH`

## Operational commands

- `npm start`
- `npm run dev`
- `npm test`
- `node src/server.js`
- `node src/client.js <command>`

## Audit and verification records

- `docs/current-state-audit.md`
- `docs/refactor-plan.md`
- `docs/post-refactor-verification.md`
