const { getRunId, logDebug, logError } = require("./debug");

function decideWithFakeModel(userInput, state) {
  const runId = getRunId();
  const shouldLog = Boolean(runId);
  const whiteboard = state && state.whiteboard ? state.whiteboard : {
    content: "",
    exists: false,
    lineCount: 0,
    charCount: 0
  };

  function debug(message, data) {
    if (shouldLog) {
      logDebug("fake-model", message, Object.assign({ runId }, data));
    }
  }

  function reportError(message, data) {
    if (shouldLog) {
      logError("fake-model", message, Object.assign({ runId }, data));
    }
  }

  if (typeof userInput !== "string" || !userInput.trim()) {
    const error = new Error("Unable to determine tool for input: ");
    reportError(error.message);
    throw error;
  }

  const rawText = userInput.trim();
  const normalized = rawText.toLowerCase();

  debug("Evaluating user input", {
    userInput: rawText
  });

  if (normalized === "continue" || normalized === "keep going" || normalized === "add more") {
    if (whiteboard.charCount > 0) {
      const decision = {
        tool: "append_whiteboard",
        input: {
          text: "## continued from existing state"
        },
        reason: "User asked to continue from the existing whiteboard state",
        confidence: 0.82,
        debug: {
          provider: "fake-model",
          matchedRule: "continue-existing",
          usedState: true
        }
      };

      debug("Matched continue rule with existing state", {
        tool: decision.tool,
        whiteboardExists: whiteboard.exists,
        lineCount: whiteboard.lineCount,
        charCount: whiteboard.charCount
      });

      return decision;
    }

    const decision = {
      tool: null,
      input: {},
      reason: "Input depends on existing whiteboard state, but the whiteboard is empty",
      confidence: 0.2,
      debug: {
        provider: "fake-model",
        matchedRule: "continue-empty",
        usedState: true
      }
    };

    debug("Matched continue rule with empty state", {
      tool: decision.tool,
      whiteboardExists: whiteboard.exists,
      lineCount: whiteboard.lineCount,
      charCount: whiteboard.charCount
    });

    return decision;
  }

  if (normalized.startsWith("add ") || normalized.startsWith("append ")) {
    const text = rawText.replace(/^(add|append)\s+/i, "").trim();

    if (!text) {
      const error = new Error("Unable to determine tool for input: missing append text");
      reportError(error.message, { userInput: rawText });
      throw error;
    }

    const decision = {
      tool: "append_whiteboard",
      input: {
        text
      },
      reason: "User asked to append text to the whiteboard",
      confidence: 0.96,
      debug: {
        provider: "fake-model",
        matchedRule: "append",
        usedState: false
      }
    };

    debug("Matched append rule", {
      tool: decision.tool
    });

    return decision;
  }

  if (normalized.includes("show") || normalized.includes("read") || normalized.includes("display")) {
    const decision = {
      tool: "read_whiteboard",
      input: {},
      reason: "User asked to see the whiteboard",
      confidence: 0.97,
      debug: {
        provider: "fake-model",
        matchedRule: "read",
        usedState: false
      }
    };

    debug("Matched read rule", {
      tool: decision.tool
    });

    return decision;
  }

  const error = new Error(`Unable to determine tool for input: ${rawText}`);
  reportError(error.message, {
    userInput: rawText
  });
  throw error;
}

module.exports = {
  decideWithFakeModel
};