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
