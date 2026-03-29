const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const STATE_JSON_PATH = path.join(REPO_ROOT, "state", "current-state.json");
const STATE_HANDOFF_PATH = path.join(REPO_ROOT, "state", "handoff.md");

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function formatList(items, emptyFallback) {
  if (!items || items.length === 0) {
    return [emptyFallback];
  }

  return items.map(item => `- ${item}`);
}

function buildVerificationLines(features) {
  return [
    `- npm start: ${features.serverStart ? features.serverStart.status : "pending"}`,
    `- npm run dev: ${features.devStart ? features.devStart.status : "pending"}`,
    `- npm test: ${features.testSuite ? features.testSuite.status : "pending"}`,
    `- whiteboard read: ${features.whiteboardRead ? features.whiteboardRead.status : "pending"}`,
    `- whiteboard append: ${features.whiteboardAppend ? features.whiteboardAppend.status : "pending"}`,
    `- auth checks: ${features.authChecks ? features.authChecks.status : "pending"}`
  ];
}

function getFailingChecks(features) {
  return Object.entries(features || {})
    .filter(([, value]) => value && value.status === "failed")
    .map(([key]) => key);
}

function formatCheckName(key) {
  const labels = {
    serverStart: "npm start",
    devStart: "npm run dev",
    testSuite: "npm test",
    whiteboardRead: "whiteboard read",
    whiteboardAppend: "whiteboard append",
    authChecks: "auth checks"
  };

  return labels[key] || key;
}

function buildWorkingTreeLines(repo) {
  const workingTree = repo.workingTree || { modified: [], deleted: [], untracked: [] };
  const lines = [
    `- Branch: ${repo.branch || "unknown"}`,
    `- Commit: ${repo.commit || "unknown"}`,
    `- Clean: ${workingTree.clean ? "yes" : "no"}`
  ];

  lines.push(`- Modified: ${workingTree.modified.length}`);
  lines.push(`- Deleted: ${workingTree.deleted.length}`);
  lines.push(`- Untracked: ${workingTree.untracked.length}`);

  return lines;
}

function buildHandoff(state) {
  const failingChecks = getFailingChecks(state.features || {});
  const reviewStatus = failingChecks.length > 0 ? "FAILED" : "PASSED";

  return [
    "# ChatGPT Handoff",
    "",
    `Status: ${reviewStatus}`,
    "",
    "## Goal",
    `- ${state.currentWork.goal || "No current goal recorded."}`,
    `- Next: ${state.currentWork.nextStep || "No next step recorded."}`,
    "",
    "## Runtime truth",
    "- Canonical implementation: src/",
    `- Entry point: ${state.runtime.entryPoint || "src/index.js"}`,
    `- Server: ${state.runtime.serverFile || "src/server.js"}`,
    `- Client: ${state.runtime.clientFile || "src/client.js"}`,
    `- Test: ${state.runtime.testFile || "src/test.js"}`,
    `- Whiteboard: ${state.runtime.liveWhiteboardPath || "artifacts/whiteboard.md"}`,
    "",
    "## Commands",
    "- Read-only: npm run status",
    "- Read-only: npm run handoff:print",
    "- Mutating: npm run review:handoff",
    "",
    "## Verification",
    ...buildVerificationLines(state.features || {}),
    ...(failingChecks.length > 0
      ? ["", "## Failing checks", ...failingChecks.map(check => `- ${formatCheckName(check)}`)]
      : []),
    "",
    "## Working tree",
    ...buildWorkingTreeLines(state.repo || { workingTree: { modified: [], deleted: [], untracked: [] } }),
    "",
    "## Blockers",
    ...formatList(state.currentWork.blockers || [], "- None")
  ].join("\n") + "\n";
}

function main() {
  const state = readJson(STATE_JSON_PATH, {
    repo: { workingTree: { modified: [], deleted: [], untracked: [] } },
    runtime: {},
    features: {},
    currentWork: { goal: "", nextStep: "", blockers: [] }
  });
  const handoffText = buildHandoff(state);

  fs.writeFileSync(STATE_HANDOFF_PATH, handoffText, "utf8");
  process.stdout.write(handoffText);
}

main();