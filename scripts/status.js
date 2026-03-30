const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..");
const STATE_JSON_PATH = path.join(REPO_ROOT, "state", "current-state.json");
const STATE_HANDOFF_PATH = path.join(REPO_ROOT, "state", "handoff.md");

function runCommand(command) {
  try {
    return execSync(command, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    return "";
  }
}

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

function parseLines(value) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function getWorkingTree() {
  const modifiedAndDeleted = parseLines(runCommand("git diff --name-only"));
  const deleted = parseLines(runCommand("git diff --name-only --diff-filter=D"));
  const deletedSet = new Set(deleted);
  const modified = modifiedAndDeleted.filter(filePath => !deletedSet.has(filePath));
  const untracked = parseLines(runCommand("git ls-files --others --exclude-standard | sort"));

  return {
    clean: modified.length === 0 && deleted.length === 0 && untracked.length === 0,
    modified,
    deleted,
    untracked
  };
}

function normalizeWorkingTree(value) {
  if (!value) {
    return {
      clean: true,
      modified: [],
      deleted: [],
      untracked: []
    };
  }

  return {
    clean: Boolean(value.clean),
    modified: Array.isArray(value.modified) ? value.modified : [],
    deleted: Array.isArray(value.deleted) ? value.deleted : [],
    untracked: Array.isArray(value.untracked) ? value.untracked : []
  };
}

function findVerificationSummary(state) {
  const features = state.features || {};
  const checks = [
    ["npm start", features.serverStart],
    ["npm run dev", features.devStart],
    ["npm test", features.testSuite],
    ["whiteboard read", features.whiteboardRead],
    ["whiteboard append", features.whiteboardAppend],
    ["auth checks", features.authChecks]
  ];

  const summary = checks.map(([label, value]) => `${label}:${value && value.status ? value.status : "pending"}`);
  const hasFailure = checks.some(([, value]) => value && value.status === "failed");
  const hasPending = checks.some(([, value]) => !value || value.status === "pending");
  const overall = hasFailure ? "FAILED" : hasPending ? "PENDING" : "PASSED";

  return `${overall} (${summary.join(", ")})`;
}

function findHandoffStatus(handoffText) {
  const line = handoffText.split(/\r?\n/).find(entry => entry.startsWith("Status: "));
  return line ? line.slice("Status: ".length).trim() : "unavailable";
}

function main() {
  const state = readJson(STATE_JSON_PATH, {});
  const workingTree = getWorkingTree();
  const preRefreshWorkingTree = normalizeWorkingTree(state.repo && state.repo.preRefreshWorkingTree);
  const branch = runCommand("git branch --show-current") || (state.repo && state.repo.branch) || "unknown";
  const handoffStatus = findHandoffStatus(readText(STATE_HANDOFF_PATH));
  const generatedOutputsUpdated = state.repo && Array.isArray(state.repo.generatedOutputsUpdated)
    ? state.repo.generatedOutputsUpdated
    : [];

  const lines = [
    "# Repo Status",
    "",
    `- Branch: ${branch}`,
    `- Live working tree: ${workingTree.clean ? "clean" : "dirty"}`,
    `- Live modified: ${workingTree.modified.length}`,
    `- Live deleted: ${workingTree.deleted.length}`,
    `- Live untracked: ${workingTree.untracked.length}`,
    `- Latest pre-refresh working tree: ${preRefreshWorkingTree.clean ? "clean" : "dirty"}`,
    `- Latest pre-refresh modified: ${preRefreshWorkingTree.modified.length}`,
    `- Latest pre-refresh deleted: ${preRefreshWorkingTree.deleted.length}`,
    `- Latest pre-refresh untracked: ${preRefreshWorkingTree.untracked.length}`,
    `- Generated outputs updated by refresh: ${generatedOutputsUpdated.length ? generatedOutputsUpdated.join(", ") : "none"}`,
    `- Latest verification: ${findVerificationSummary(state)}`,
    `- Latest handoff: ${handoffStatus}`
  ];

  process.stdout.write(lines.join("\n") + "\n");
}

main();