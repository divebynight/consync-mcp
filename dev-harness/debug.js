let currentRunId = null;

function createRunId() {
  return Math.random().toString(36).slice(2, 8);
}

function setRunId(runId) {
  currentRunId = typeof runId === "string" && runId ? runId : null;
}

function getRunId() {
  return currentRunId;
}

function formatPrefix(scope, data) {
  const timestamp = new Date().toISOString();
  const runId = data && typeof data.runId === "string"
    ? data.runId
    : (currentRunId || "local");
  return `[${timestamp}] [run:${runId}] [${scope}]`;
}

function writeLog(writer, scope, message, data) {
  const payload = data && Object.prototype.hasOwnProperty.call(data, "runId")
    ? Object.assign({}, data)
    : data;

  if (payload && Object.prototype.hasOwnProperty.call(payload, "runId")) {
    delete payload.runId;
  }

  writer(`${formatPrefix(scope, data)} ${message}`);

  if (payload !== undefined) {
    writer(JSON.stringify(payload, null, 2));
  }
}

function logDebug(scope, message, data) {
  writeLog(console.log, scope, message, data);
}

function logError(scope, message, data) {
  writeLog(console.error, scope, message, data);
}

module.exports = {
  createRunId,
  setRunId,
  getRunId,
  logDebug,
  logError
};