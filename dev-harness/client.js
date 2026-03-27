const { buildDecision } = require("./agent");
const { createRunId, setRunId, logDebug, logError } = require("./debug");
const { executeDecision } = require("./executor");
const { loadState } = require("./state-loader");

function parseDecisionJson(rawJson) {
  try {
    return JSON.parse(rawJson);
  } catch (error) {
    throw new Error(`Malformed JSON: ${error.message}`);
  }
}

function printJson(label, value) {
  console.log(`${label}:`);
  console.log(JSON.stringify(value, null, 2));
}

async function runDecision(decision, runId) {
  const result = await executeDecision(decision, { runId });

  printJson("Decision", decision);
  console.log("");
  printJson("Result", result);
}

function loadDecisionState(runId) {
  return loadState();
}

async function main(runId) {
  const command = process.argv[2];

  logDebug("client", "Starting command", {
    runId,
    command,
    args: process.argv.slice(3)
  });

  if (command === "read") {
    await runDecision({ tool: "read_whiteboard", input: {} }, runId);
    return;
  }

  if (command === "append") {
    const text = process.argv.slice(3).join(" ");
    logDebug("client", "Preparing append decision", {
      runId,
      text
    });
    await runDecision({
      tool: "append_whiteboard",
      input: { text }
    }, runId);
    return;
  }

  if (command === "exec") {
    const rawJson = process.argv.slice(3).join(" ");
    logDebug("client", "Parsing exec decision JSON", {
      runId,
      rawJson
    });
    const decision = parseDecisionJson(rawJson);
    await runDecision(decision, runId);
    return;
  }

  if (command === "decide") {
    const requestText = process.argv.slice(3).join(" ");
    const state = loadDecisionState(runId);
    logDebug("client", "Building decision", {
      runId,
      userInput: requestText
    });
    const decision = buildDecision(requestText, state);
    printJson("Decision", decision);
    return;
  }

  if (command === "agent") {
    const requestText = process.argv.slice(3).join(" ");
    const state = loadDecisionState(runId);
    logDebug("client", "Running agent flow", {
      runId,
      userInput: requestText
    });
    const decision = buildDecision(requestText, state);
    logDebug("client", "Decision ready", {
      runId,
      decision
    });
    await runDecision(decision, runId);
    return;
  }

  console.log("Usage:");
  console.log("  node dev-harness/client.js read");
  console.log('  node dev-harness/client.js append "## New note"');
  console.log("  node dev-harness/client.js exec '{\"tool\":\"read_whiteboard\",\"input\":{}}'");
  console.log('  node dev-harness/client.js decide "show it"');
  console.log('  node dev-harness/client.js agent "add ## hello from agent"');
}

const runId = createRunId();
setRunId(runId);

main(runId).catch(err => {
  logError("client", "Command failed", {
    runId,
    error: err.message
  });
  console.error("Client error:", err.message);
  process.exit(1);
});