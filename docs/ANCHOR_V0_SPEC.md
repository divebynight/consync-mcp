# Consync Anchor v0 Spec

> Status: Draft v0
> Owner: User
> Last Updated: 2026-03-29

---

## Goal

Implement a minimal, shared context layer for Consync using **anchors**.

An anchor is the smallest durable unit of context that captures:

* something happened
* it might matter later
* enough information exists to reconnect to it

This system should be usable by:

* User
* ChatGPT
* GitHub Copilot

---

## Scope

### In Scope

* Create anchors
* List anchors
* Retrieve a single anchor
* Link/update anchors (tags, paths, links, status)
* Store data in a simple file format

### Out of Scope (v0)

* Gravity scoring
* Session inference
* Artifact graph
* Codex/world modeling
* Embeddings or semantic search
* Screenshot/image processing
* Cross-device sync
* Database integration

---

## Storage

### File Location

```
artifacts/anchors.jsonl
```

### Format

* JSON Lines (one JSON object per line)
* Append-only for creation
* Rewrite file for updates (acceptable for v0)

### Rationale

* Simple
* Git-friendly
* Easy to inspect manually
* Easy for Node + MCP tools

---

## Data Model

### Minimal Anchor

```json
{
  "id": "anc_20260329_201530_001",
  "createdAt": "2026-03-29T20:15:30-05:00",
  "source": "user",
  "kind": "thought",
  "text": "Example anchor text",
  "status": "open"
}
```

### Full Anchor Schema

```json
{
  "id": "anc_20260329_201530_001",
  "createdAt": "2026-03-29T20:15:30-05:00",
  "updatedAt": "2026-03-29T20:15:30-05:00",
  "source": "user",
  "kind": "thought",
  "text": "Example anchor text",
  "paths": [],
  "tags": [],
  "links": [],
  "status": "open",
  "meta": {}
}
```

---

## Field Definitions

* `id`: unique anchor id
* `createdAt`: ISO timestamp
* `updatedAt`: ISO timestamp
* `source`: origin of anchor
* `kind`: type of anchor
* `text`: core human-readable content
* `paths`: related file paths
* `tags`: lightweight labels
* `links`: relationships to other entities
* `status`: lifecycle state
* `meta`: optional contextual metadata

---

## Allowed Values

### source

* `user`
* `chatgpt`
* `copilot`
* `system`

### kind

* `thought`
* `reminder`
* `file`
* `decision`
* `question`
* `idea`
* `reference`

### status

* `open`
* `resolved`
* `archived`

---

## Link Model

### Link Object

```json
{
  "type": "anchor",
  "target": "anc_20260329_201530_001",
  "label": "related"
}
```

### Allowed Types

* `anchor`
* `file`
* `session`
* `artifact`

---

## MCP Tools

---

### 1. create_anchor

Creates a new anchor.

#### Input

```json
{
  "text": "Find the source .blend file for robot render",
  "kind": "reminder",
  "tags": ["blender", "robot"],
  "paths": [],
  "source": "user",
  "meta": {}
}
```

#### Rules

* `text` is required
* trim whitespace
* reject empty text
* auto-generate `id`
* auto-fill timestamps
* default:

  * `source`: user
  * `kind`: thought
  * `status`: open

#### Output

```json
{
  "ok": true,
  "anchor": { ...full anchor object... }
}
```

---

### 2. list_anchors

Returns anchors (newest first).

#### Input (all optional)

```json
{
  "limit": 20,
  "status": "open",
  "tag": "consync",
  "kind": "thought",
  "source": "user",
  "textQuery": "gravity"
}
```

#### Behavior

* default limit: 20
* case-insensitive text search
* simple filtering only

#### Output

```json
{
  "ok": true,
  "count": 1,
  "anchors": [
    {
      "id": "anc_...",
      "createdAt": "...",
      "source": "user",
      "kind": "thought",
      "text": "...",
      "tags": [],
      "status": "open"
    }
  ]
}
```

---

### 3. get_anchor

Returns full anchor.

#### Input

```json
{
  "id": "anc_20260329_201530_001"
}
```

#### Output

```json
{
  "ok": true,
  "anchor": { ...full anchor object... }
}
```

---

### 4. link_anchor

Updates an existing anchor.

#### Input

```json
{
  "id": "anc_20260329_201530_001",
  "addTags": ["source-file"],
  "addPaths": ["/path/to/file.blend"],
  "addLinks": [
    {
      "type": "file",
      "target": "/path/to/file.blend",
      "label": "possible-source"
    }
  ],
  "status": "open"
}
```

#### Rules

* must find anchor by id
* merge without duplicates
* append new links only
* update `updatedAt`

#### Output

```json
{
  "ok": true,
  "anchor": { ...updated fields... }
}
```

---

## Repo Structure

```
consync-mcp/
  src/
    index.js
    tools/
      create-anchor.js
      list-anchors.js
      get-anchor.js
      link-anchor.js
    lib/
      anchors-store.js
      anchors-validate.js
      anchors-id.js
      anchors-search.js
  artifacts/
    anchors.jsonl
  docs/
    ANCHOR_V0_SPEC.md
```

---

## Implementation Notes

* Use CommonJS (require/module.exports)
* No database
* No frameworks
* Keep logic simple and readable
* Append for create, rewrite for update (acceptable for v0)
* Ensure file exists before writing
* Avoid over-engineering

---

## Acceptance Criteria

* Can create anchor with just text
* Can create anchor with tags
* Can create anchor with file paths
* Can list recent anchors
* Can filter anchors
* Can retrieve anchor by id
* Can update anchor (tags, paths, links, status)
* Data persists in `anchors.jsonl`
* Empty text is rejected
* Tools are simple and predictable

---

## Example Anchors

### Thought

```json
{
  "id": "anc_001",
  "createdAt": "...",
  "source": "chatgpt",
  "kind": "thought",
  "text": "Context needs smallest + largest scale definition",
  "tags": ["consync"],
  "status": "open"
}
```

### Reminder

```json
{
  "id": "anc_002",
  "createdAt": "...",
  "source": "user",
  "kind": "reminder",
  "text": "Robot render is phone home screen — find source blend file",
  "tags": ["blender", "robot"],
  "status": "open"
}
```

### Decision

```json
{
  "id": "anc_003",
  "createdAt": "...",
  "source": "copilot",
  "kind": "decision",
  "text": "Keep Anchor v0 inside consync-mcp",
  "tags": ["decision"],
  "status": "open"
}
```

---

## Summary

Anchor v0 provides:

* minimal capture
* durable context
* shared memory layer

It is the first step toward Consync as a context engine, without introducing complexity too early.

---


## Final Note

One small note before you go (this will save you time later):

When Copilot generates the code, we’ll want to:

Implement anchors-store first (file read/write)
Then create_anchor
Then list/get/link

Don’t try to build everything at once—we’ll keep it tight and iterative (same way you like debugging 👍)
