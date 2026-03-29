# Refactor Plan

## Current-State Summary

- Runtime is still split between `src/` and `dev-harness/`
- `src/index.js` is only a launcher into the harness server
- shared logic already lives in `src/services`, `src/schemas`, and `src/utils`
- direct commands and tests still point into `dev-harness/`
- the last hard structural dependency is the legacy whiteboard default path

## Target Structure

Final target after this pass:

```text
src/
  client.js
  index.js
  server.js
  state-loader.js
  test.js
  schemas/
    tool-schema.js
  services/
    agent.js
    executor.js
    fake-model.js
  utils/
    debug.js
    whiteboard-path.js
artifacts/
  whiteboard.example.md
docs/
  current-state-audit.md
  post-refactor-verification.md
  refactor-plan.md
  whiteboard-contract.md
README.md
package.json
```

## Final Runtime Entry Point

- package entry: `src/index.js`
- actual server implementation: `src/server.js`

## Code To Move From `dev-harness/`

- `dev-harness/server.js` -> `src/server.js`
- `dev-harness/state-loader.js` -> `src/state-loader.js`
- `dev-harness/client.js` -> `src/client.js`
- `dev-harness/test.js` -> `src/test.js`

Already-real implementation staying in place:

- `src/services/agent.js`
- `src/services/executor.js`
- `src/services/fake-model.js`
- `src/schemas/tool-schema.js`
- `src/utils/debug.js`
- `src/utils/whiteboard-path.js`

## Package Scripts After Refactor

- `npm start` -> `node src/index.js`
- `npm run dev` -> `node src/index.js`
- `npm test` -> `node src/test.js`

Direct node commands after refactor:

- `node src/server.js`
- `node src/test.js`
- `node src/client.js read`
- `node src/client.js append "..."`
- `node src/client.js exec '{...}'`
- `node src/client.js decide "show it"`
- `node src/client.js agent "add ..."`

## Migration Steps

1. Add audit and plan docs before code changes.
2. Move server implementation into `src/server.js`.
3. Move state loader into `src/state-loader.js`.
4. Move client CLI into `src/client.js`.
5. Move tests into `src/test.js`.
6. Update imports and usage strings to point only at `src/*`.
7. Remove legacy fallback to `dev-harness/artifacts/whiteboard.md` and make the root artifact path the only default live path.
8. Update README and whiteboard docs to describe the new single structure.
9. Remove `dev-harness/` after verification shows no remaining dependency.
10. Run verification again and write the post-refactor report.

## Whiteboard Path Decision

Target behavior:

- override path still wins
- `CONSYNC_WHITEBOARD_PATH` still works
- default writable live path becomes `artifacts/whiteboard.md`
- tracked template remains `artifacts/whiteboard.example.md`

Compatibility note:

- if no live whiteboard exists yet, read/state behavior should stay predictable and not depend on `dev-harness/`

## Risks

- changing the default whiteboard path removes compatibility with previous harness-local defaults
- docs currently overstate how much still lives in `dev-harness/`
- direct node commands will change paths and need documentation updates
- verification must explicitly prove there is no remaining `dev-harness/` reference in runtime code or scripts

## Validation Checklist

- `npm test` passes
- `npm start` boots the server
- `node src/server.js` boots the server
- `node src/client.js read` works
- `node src/client.js append` works
- `node src/client.js decide` works
- `node src/client.js agent` works
- auth still returns `401` without token and `200` with token
- no code or scripts still import or execute `dev-harness/*`
- README reflects the real structure