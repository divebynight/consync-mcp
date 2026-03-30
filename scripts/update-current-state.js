const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..");
const STATE_DIR = path.join(REPO_ROOT, "state");
const STATE_JSON_PATH = path.join(STATE_DIR, "current-state.json");
const STATE_MD_PATH = path.join(STATE_DIR, "current-state.md");
const PACKAGE_JSON_PATH = path.join(REPO_ROOT, "package.json");
const GENERATED_OUTPUTS_UPDATED = [
  "state/current-state.json",
  "state/current-state.md",
  "state/handoff.md"
];

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

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
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

function defaultFeatureState() {
  return {
    serverStart: {
      status: "pending",
      notes: ""
    },
    devStart: {
      status: "pending",
      notes: ""
    },
    testSuite: {
      status: "pending",
      notes: ""
    },
    whiteboardRead: {
      status: "pending",
      notes: ""
    },
    whiteboardAppend: {
      status: "pending",
      notes: ""
    },
    authChecks: {
      status: "pending",
      notes: ""
    }
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

function buildStateSnapshot(existingState) {
  const packageJson = readJson(PACKAGE_JSON_PATH, {});
  const branch = runCommand("git branch --show-current");
  const commit = runCommand("git rev-parse HEAD");
  const workingTree = getWorkingTree();
  const existingFeatures = existingState && existingState.features ? existingState.features : {};
  const currentFeatures = Object.assign(defaultFeatureState(), existingFeatures);
  const currentWork = existingState && existingState.currentWork
    ? existingState.currentWork
    : { goal: "", nextStep: "", blockers: [] };
  const existingRepo = existingState && existingState.repo ? existingState.repo : {};
  const preRefreshWorkingTree = normalizeWorkingTree(
    existingRepo.preRefreshWorkingTree || workingTree
  );

  return {
    repo: {
      name: packageJson.name || path.basename(REPO_ROOT),
      branch,
      commit,
      workingTree,
      preRefreshWorkingTree,
      generatedOutputsUpdated: GENERATED_OUTPUTS_UPDATED
    },
    runtime: {
      entryPoint: "src/index.js",
      serverFile: "src/server.js",
      clientFile: "src/client.js",
      testFile: "src/test.js",
      liveWhiteboardPath: "artifacts/whiteboard.md"
    },
    commands: {
      start: packageJson.scripts && packageJson.scripts.start ? "npm start" : "",
      dev: packageJson.scripts && packageJson.scripts.dev ? "npm run dev" : "",
      test: packageJson.scripts && packageJson.scripts.test ? "npm test" : "",
      status: packageJson.scripts && packageJson.scripts.status ? "npm run status" : "",
      handoffPrint: packageJson.scripts && packageJson.scripts["handoff:print"] ? "npm run handoff:print" : "",
      reviewHandoff: packageJson.scripts && packageJson.scripts["review:handoff"] ? "npm run review:handoff" : ""
    },
    features: currentFeatures,
    currentWork,
    meta: {
      lastUpdated: new Date().toISOString(),
      updatedBy: "copilot"
    }
  };
}

function formatFeatureStatus(state, key) {
  const feature = state.features[key];

  if (!feature) {
    return "pending";
  }

  return feature.status || "pending";
}

function buildMarkdown(state) {
  const modified = state.repo.workingTree.modified;
  const deleted = state.repo.workingTree.deleted;
  const untracked = state.repo.workingTree.untracked;
  const preRefresh = normalizeWorkingTree(state.repo.preRefreshWorkingTree);
  const generatedOutputsUpdated = Array.isArray(state.repo.generatedOutputsUpdated)
    ? state.repo.generatedOutputsUpdated
    : [];
  const blockers = Array.isArray(state.currentWork.blockers) ? state.currentWork.blockers : [];

  const lines = [
    "# Current State",
    "",
    "## Repo",
    "",
    `- Name: \`${state.repo.name}\``,
    `- Branch: \`${state.repo.branch || "unknown"}\``,
    `- Commit: \`${state.repo.commit || "unknown"}\``,
    `- Live working tree: ${state.repo.workingTree.clean ? "clean" : "dirty"}`,
    "",
    "Live tracked changes:",
    "",
    `- Modified: ${modified.length ? modified.map(filePath => `\`${filePath}\``).join(", ") : "none"}`,
    `- Deleted: ${deleted.length ? deleted.map(filePath => `\`${filePath}\``).join(", ") : "none"}`,
    `- Untracked: ${untracked.length ? `${untracked.length} files` : "none"}`,
    "",
    "Pre-refresh snapshot:",
    "",
    `- Working tree: ${preRefresh.clean ? "clean" : "dirty"}`,
    `- Modified: ${preRefresh.modified.length ? preRefresh.modified.map(filePath => `\`${filePath}\``).join(", ") : "none"}`,
    `- Deleted: ${preRefresh.deleted.length ? preRefresh.deleted.map(filePath => `\`${filePath}\``).join(", ") : "none"}`,
    `- Untracked: ${preRefresh.untracked.length ? `${preRefresh.untracked.length} files` : "none"}`,
    "",
    "Generated outputs updated by refresh:",
    "",
    `- ${generatedOutputsUpdated.length ? generatedOutputsUpdated.map(filePath => `\`${filePath}\``).join(", ") : "none"}`,
    "",
    "## Runtime Truth",
    "",
    `- Canonical implementation: \`src/\``,
    `- Entry point: \`${state.runtime.entryPoint}\``,
    `- Server: \`${state.runtime.serverFile}\``,
    `- Client CLI: \`${state.runtime.clientFile}\``,
    `- Test file: \`${state.runtime.testFile}\``,
    `- Default live whiteboard path: \`${state.runtime.liveWhiteboardPath}\``,
    "",
    "## Command Status",
    "",
    `- \`npm start\`: ${formatFeatureStatus(state, "serverStart")}`,
    `- \`npm run dev\`: ${formatFeatureStatus(state, "devStart")}`,
    `- \`npm test\`: ${formatFeatureStatus(state, "testSuite")}`,
    `- whiteboard read: ${formatFeatureStatus(state, "whiteboardRead")}`,
    `- whiteboard append: ${formatFeatureStatus(state, "whiteboardAppend")}`,
    `- bearer auth on \`/tool\`: ${formatFeatureStatus(state, "authChecks")}`,
    "",
    `Last state update: \`${state.meta.lastUpdated}\``,
    "",
    "## Current Work",
    "",
    `- Goal: ${state.currentWork.goal || ""}`,
    `- Next step: ${state.currentWork.nextStep || ""}`,
    "- Blockers:"
  ];

  if (blockers.length === 0) {
    lines.push("  - none");
  } else {
    blockers.forEach(blocker => {
      lines.push(`  - ${blocker}`);
    });
  }

  lines.push(
    "",
    "## State Files",
    "",
    "- Machine truth: `state/current-state.json`",
    "- Human summary: `state/current-state.md`",
    "- Human relay: `state/handoff.md`",
    "",
    "## Prompt Files",
    "",
    "- `.github/prompts/update-current-state.prompt.md`",
    "- `.github/prompts/verify-runtime-and-update-state.prompt.md`",
    "- `.github/prompts/generate-chatgpt-handoff.prompt.md`",
    "",
    "Keep this file concise. When state changes materially, update the JSON first and then refresh this summary."
  );

  return lines.join("\n") + "\n";
}

function writeStateFiles(state) {
  ensureDirectory(STATE_DIR);
  fs.writeFileSync(STATE_JSON_PATH, JSON.stringify(state, null, 2) + "\n", "utf8");
  fs.writeFileSync(STATE_MD_PATH, buildMarkdown(state), "utf8");
}

function main() {
  ensureDirectory(STATE_DIR);
  const existingState = readJson(STATE_JSON_PATH, {});
  const state = buildStateSnapshot(existingState);
  writeStateFiles(state);
  console.log("Updated state/current-state.json and state/current-state.md");
}

if (require.main === module) {
  main();
}

module.exports = {
  GENERATED_OUTPUTS_UPDATED,
  STATE_JSON_PATH,
  STATE_MD_PATH,
  buildMarkdown,
  buildStateSnapshot,
  getWorkingTree,
  normalizeWorkingTree,
  readJson,
  writeStateFiles
};