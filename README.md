# consync-mcp

`consync-mcp` is a small CommonJS Node.js MCP-style tool server for Consync.

The repository now has a single implementation structure under `src/`.

## Current status

- `src/index.js` is the package entry point.
- `src/server.js` contains the HTTP server implementation.
- `src/client.js` contains the local CLI commands.
- `src/test.js` contains the current lightweight test suite.

## Getting started

```bash
npm install
npm start
```

This starts the current harness-backed server through the top-level project entry point.

The shared whiteboard artifact is documented in `docs/whiteboard-contract.md`.

## Available commands

```bash
npm start
npm run dev
npm test
```

Direct harness commands are also still available while the project is being migrated:

```bash
node src/server.js
node src/test.js
node src/client.js read
node src/client.js append "## New note"
node src/client.js decide "show it"
node src/client.js agent "add ## hello from agent"
```

## Configuration

The server supports a small set of environment variables for local development and temporary tunnel exposure:

```text
CONSYNC_SERVER_HOST     Bind host for the HTTP server (default: 127.0.0.1)
CONSYNC_SERVER_PORT     Bind port for the HTTP server (default: 3000)
CONSYNC_AUTH_TOKEN      Optional bearer token for /tool requests
CONSYNC_WHITEBOARD_PATH Optional path override for the shared whiteboard file
```

### Local-only mode

For normal local development, keep the default loopback binding and leave authentication disabled:

```bash
CONSYNC_SERVER_HOST=127.0.0.1
CONSYNC_SERVER_PORT=3000
```

### Tunnel-exposed mode

For temporary exposure through a tunnel such as ngrok, keep the server bound to loopback and set a bearer token:

```bash
CONSYNC_SERVER_HOST=127.0.0.1
CONSYNC_SERVER_PORT=3000
CONSYNC_AUTH_TOKEN=replace-with-a-long-random-token
```

When `CONSYNC_AUTH_TOKEN` is set, requests to `/tool` must include:

```text
Authorization: Bearer <token>
```

The server logs a request ID for every request. That request ID is used only in server-side logs for tracing and is not returned to clients.

## Project layout

```text
src/           Runtime, client, tests, services, schemas, and utilities
docs/          Project notes, audit notes, and refactor records
artifacts/     Whiteboard template and optional live whiteboard path
```

## Runtime flow

1. `src/index.js` starts the server.
2. `src/server.js` exposes `POST /tool`.
3. `src/services/executor.js` sends tool requests to that server.
4. `src/services/agent.js` and `src/services/fake-model.js` build decisions.
5. `src/state-loader.js` reads whiteboard state.

The current current-state audit is captured in `docs/current-state-audit.md`.

See `docs/architecture.md` for the current module breakdown.

## Whiteboard artifact

The project uses a shared Markdown whiteboard as a coordination artifact between tools and agents.

- Default runtime path: `artifacts/whiteboard.md`
- Optional explicit override: set `CONSYNC_WHITEBOARD_PATH` to point at a different live file
- Tracked template: `artifacts/whiteboard.example.md`

The contract and handling rules are documented in `docs/whiteboard-contract.md`.
