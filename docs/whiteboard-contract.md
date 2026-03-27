# Whiteboard Contract

## Purpose

`whiteboard.md` is a shared coordination artifact.

It is not incidental scratch data. It is used as shared state between tools and agents, including local harness flows and external agent-driven workflows.

## Current behavior

Today the running code reads and appends whiteboard content through the harness tool server.

- `read_whiteboard` returns the current contents
- `append_whiteboard` appends text to the end of the file
- decision-building logic can inspect whiteboard state and react to whether it is empty or populated

## Path contract

The live whiteboard path is resolved in this order:

1. An explicit override passed by code
2. The `CONSYNC_WHITEBOARD_PATH` environment variable
3. The legacy compatibility default at `dev-harness/artifacts/whiteboard.md`

Relative `CONSYNC_WHITEBOARD_PATH` values are resolved from the repository root.

## Recommended local model

For now, use a hybrid compatibility model:

- keep the legacy tracked harness whiteboard as the default fallback so current behavior does not break
- define an explicit live-path override for safer shared-state usage
- provide a tracked template for future local or shared whiteboard instances

This keeps the project stable while avoiding a forced migration of all existing flows.

## Tracked vs live files

- `dev-harness/artifacts/whiteboard.md`: current compatibility default used by the existing runtime
- `artifacts/whiteboard.example.md`: tracked example/template
- `artifacts/whiteboard.md`: recommended local live whiteboard path when using `CONSYNC_WHITEBOARD_PATH=artifacts/whiteboard.md`

`artifacts/whiteboard.md` is ignored in git so mutable shared state does not get committed accidentally.

## Operational guidance

If you want to keep using the legacy path, no configuration is required.

If you want a non-committed live whiteboard in the repo root, run the server with:

```bash
CONSYNC_WHITEBOARD_PATH=artifacts/whiteboard.md npm start
```

To seed that file, start from `artifacts/whiteboard.example.md`.

## Current limitations

- concurrent writes are simple append operations with no locking
- the file is plain Markdown shared by convention, not by schema enforcement
- the fallback path still points into `dev-harness/` for compatibility

Those constraints are intentional for now to avoid broad refactoring.