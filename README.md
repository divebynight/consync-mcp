# consync-mcp

`consync-mcp` is a Node.js MCP server project that is currently backed by the original development harness.

The working implementation still lives in `dev-harness/`. The top-level `src/` directory is the intended long-term home for production code, but it is not fully migrated yet.

## Current status

- The real runnable server is still the harness server in `dev-harness/server.js`.
- `src/index.js` is a thin top-level shim so the standard npm entry point starts the existing server.
- No working logic has been moved out of `dev-harness/` yet.

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
node dev-harness/server.js
node dev-harness/test.js
node dev-harness/client.js read
node dev-harness/client.js append "## New note"
node dev-harness/client.js decide "show it"
node dev-harness/client.js agent "add ## hello from agent"
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
dev-harness/   Current working implementation and test harness
docs/          Project notes and architecture documentation
src/           Intended long-term application structure
```

## Migration approach

This repository is being cleaned up in small, low-risk steps:

1. Keep the current harness runnable.
2. Fix top-level project metadata and entry points.
3. Document the existing structure before moving code.
4. Migrate modules incrementally once path and runtime dependencies are explicit.

See `docs/architecture.md` for the current module breakdown and migration guidance.

## Whiteboard artifact

The project uses a shared Markdown whiteboard as a coordination artifact between tools and agents.

- Default runtime path: `dev-harness/artifacts/whiteboard.md`
- Optional explicit override: set `CONSYNC_WHITEBOARD_PATH` to point at a different live file
- Tracked template: `artifacts/whiteboard.example.md`

The contract and handling rules are documented in `docs/whiteboard-contract.md`.
