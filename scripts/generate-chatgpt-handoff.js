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

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return "";
  }
}

function findQuestion(handoffText) {
  const lines = handoffText.split(/\r?\n/);
  const questionIndex = lines.findIndex(line => line.trim() === "## Question");

  if (questionIndex === -1) {
    return "- None";
  }

  const collected = [];

  for (let index = questionIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.startsWith("## ")) {
      break;
    }

    if (line.trim()) {
      collected.push(line);
    }
  }

  return collected.length > 0 ? collected.join("\n") : "- None";
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

function buildWorkingTreeLines(repo) {
  const lines = [
    `- Branch: ${repo.branch || "unknown"}`,
    `- Commit: ${repo.commit || "unknown"}`,
    `- Clean: ${repo.workingTree && repo.workingTree.clean ? "yes" : "no"}`
  ];

  if (repo.workingTree) {
    lines.push(`- Modified: ${repo.workingTree.modified.length}`);
    lines.push(`- Deleted: ${repo.workingTree.deleted.length}`);
    lines.push(`- Untracked: ${repo.workingTree.untracked.length}`);
  }

  return lines;
}

function main() {
  const state = readJson(STATE_JSON_PATH, {
    repo: { workingTree: { modified: [], deleted: [], untracked: [] } },
    runtime: {},
    features: {},
    currentWork: { goal: "", nextStep: "", blockers: [] }
  });
  const handoffText = readText(STATE_HANDOFF_PATH);

  const lines = [
    "# ChatGPT Handoff",
    "",
    "## Goal",
    `- ${state.currentWork.goal || "No current goal recorded."}`,
    `- Next: ${state.currentWork.nextStep || "No next step recorded."}`,
    "",
    "## Runtime truth",
    `- Canonical implementation: src/`,
    `- Entry point: ${state.runtime.entryPoint || "src/index.js"}`,
    `- Server: ${state.runtime.serverFile || "src/server.js"}`,
    `- Client: ${state.runtime.clientFile || "src/client.js"}`,
    `- Test: ${state.runtime.testFile || "src/test.js"}`,
    `- Whiteboard: ${state.runtime.liveWhiteboardPath || "artifacts/whiteboard.md"}`,
    "",
    "## Verification",
    ...buildVerificationLines(state.features || {}),
    "",
    "## Working tree",
    ...buildWorkingTreeLines(state.repo),
    "",
    "## Blockers",
    ...formatList(state.currentWork.blockers || [], "- None"),
    "",
    "## Question",
    findQuestion(handoffText)
  ];

  process.stdout.write(lines.join("\n") + "\n");
}

main();