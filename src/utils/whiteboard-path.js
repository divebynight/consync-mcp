const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const LEGACY_WHITEBOARD_PATH = path.join(REPO_ROOT, "dev-harness", "artifacts", "whiteboard.md");
const EXAMPLE_WHITEBOARD_PATH = path.join(REPO_ROOT, "artifacts", "whiteboard.example.md");

function resolveFromRoot(targetPath) {
  if (!targetPath) {
    return null;
  }

  return path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(REPO_ROOT, targetPath);
}

function resolveWhiteboardPath(overridePath) {
  return resolveFromRoot(overridePath)
    || resolveFromRoot(process.env.CONSYNC_WHITEBOARD_PATH)
    || LEGACY_WHITEBOARD_PATH;
}

module.exports = {
  EXAMPLE_WHITEBOARD_PATH,
  LEGACY_WHITEBOARD_PATH,
  REPO_ROOT,
  resolveWhiteboardPath
};