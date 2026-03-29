# Whiteboard Contract

## Purpose

`whiteboard.md` is a shared coordination artifact.

It is not incidental scratch data. It is used as shared state between tools and agents, including local harness flows and external agent-driven workflows.

## Current behavior

Today the running code reads and appends whiteboard content through the `src/server.js` tool server.

- `read_whiteboard` returns the current contents
- `append_whiteboard` appends text to the end of the file
- decision-building logic can inspect whiteboard state and react to whether it is empty or populated

## Path contract

The live whiteboard path is resolved in this order:

1. An explicit override passed by code
2. The `CONSYNC_WHITEBOARD_PATH` environment variable
3. The default live path at `artifacts/whiteboard.md`

Relative `CONSYNC_WHITEBOARD_PATH` values are resolved from the repository root.

## Recommended local model

- keep mutable local state in `artifacts/whiteboard.md`
- use `CONSYNC_WHITEBOARD_PATH` when a different live file is needed
- use the tracked example file as a seed when starting fresh

## Tracked vs live files

- `artifacts/whiteboard.example.md`: tracked example/template
- `artifacts/whiteboard.md`: default local live whiteboard path

`artifacts/whiteboard.md` is ignored in git so mutable shared state does not get committed accidentally.

## Operational guidance

If you want a non-committed live whiteboard in the repo root, run the server with the default path or explicitly set:

```bash
CONSYNC_WHITEBOARD_PATH=artifacts/whiteboard.md npm start
```

To seed that file, start from `artifacts/whiteboard.example.md`.

## Current limitations

- concurrent writes are simple append operations with no locking
- the file is plain Markdown shared by convention, not by schema enforcement

Those constraints are intentional to keep the implementation simple.