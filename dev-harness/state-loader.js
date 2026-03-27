const fs = require("fs");
const path = require("path");

const { getRunId, logDebug } = require("./debug");

const DEFAULT_WHITEBOARD_PATH = path.join(__dirname, "artifacts", "whiteboard.md");

function summarize(content, exists) {
  return {
    whiteboard: {
      content,
      exists,
      lineCount: content ? content.split(/\r?\n/).length : 0,
      charCount: content.length
    }
  };
}

function loadState(overridePath) {
  const whiteboardPath = overridePath || DEFAULT_WHITEBOARD_PATH;
  const runId = getRunId();

  if (!fs.existsSync(whiteboardPath)) {
    const state = summarize("", false);

    if (runId) {
      logDebug("state-loader", "Loaded state summary", {
        runId,
        whiteboardExists: state.whiteboard.exists,
        lineCount: state.whiteboard.lineCount,
        charCount: state.whiteboard.charCount
      });
    }

    return state;
  }

  const content = fs.readFileSync(whiteboardPath, "utf-8");
  const state = summarize(content, true);

  if (runId) {
    logDebug("state-loader", "Loaded state summary", {
      runId,
      whiteboardExists: state.whiteboard.exists,
      lineCount: state.whiteboard.lineCount,
      charCount: state.whiteboard.charCount
    });
  }

  return state;
}

module.exports = {
  loadState
};