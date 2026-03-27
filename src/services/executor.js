const http = require("http");

const { logDebug, logError } = require("../utils/debug");
const toolSchema = require("../schemas/tool-schema");

const DEFAULT_SERVER_PORT = 3000;
const DEFAULT_SERVER_HOST = "127.0.0.1";

function resolveServerPort() {
  const port = Number.parseInt(process.env.CONSYNC_SERVER_PORT || "", 10);

  if (Number.isInteger(port) && port > 0 && port <= 65535) {
    return port;
  }

  return DEFAULT_SERVER_PORT;
}

function resolveAuthToken() {
  const token = process.env.CONSYNC_AUTH_TOKEN;

  if (typeof token === "string" && token.trim()) {
    return token.trim();
  }

  return "";
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function validateDecision(decision) {
  if (!isPlainObject(decision)) {
    throw new Error("Invalid decision: decision must be an object");
  }

  const { tool, input, reason } = decision;

  if (tool === null || tool === undefined || tool === "") {
    throw new Error("No executable tool selected by agent");
  }

  const definition = toolSchema[tool];

  if (!definition) {
    throw new Error(`Invalid decision: unknown tool \"${tool}\"`);
  }

  if (!isPlainObject(input)) {
    throw new Error("Invalid decision: input must be an object");
  }

  for (const key of definition.required) {
    if (!(key in input)) {
      throw new Error(`Invalid decision: missing required input field \"${key}\"`);
    }
  }

  if (reason !== undefined && typeof reason !== "string") {
    throw new Error("Invalid decision: reason must be a string when provided");
  }

  return true;
}

function normalizeDecision(decision) {
  if (!isPlainObject(decision)) {
    return decision;
  }

  if (decision.tool !== "append_whiteboard") {
    return decision;
  }

  const input = isPlainObject(decision.input) ? decision.input : decision.input;

  if (!isPlainObject(input)) {
    return Object.assign({}, decision, { input });
  }

  const text = input.text ?? input.content;

  return Object.assign({}, decision, {
    input: text === undefined ? {} : { text }
  });
}

function callTool(payload, options) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const runId = options && options.runId;
    const authToken = resolveAuthToken();
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
      "X-Run-Id": runId || "local"
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const req = http.request(
      {
        hostname: DEFAULT_SERVER_HOST,
        port: resolveServerPort(),
        path: "/tool",
        method: "POST",
        headers
      },
      res => {
        let body = "";

        res.on("data", chunk => {
          body += chunk;
        });

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`Tool request failed (${res.statusCode}): ${body}`));
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${body}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function executeDecision(decision, options) {
  const runId = options && options.runId;

  logDebug("executor", "Execution started", {
    runId,
    decision
  });

  let normalizedDecision;

  try {
    normalizedDecision = normalizeDecision(decision);
    validateDecision(normalizedDecision);
    logDebug("executor", "Validation passed", {
      runId,
      decision: normalizedDecision
    });
  } catch (error) {
    logError("executor", "Validation failed", {
      runId,
      error: error.message,
      decision
    });
    throw error;
  }

  logDebug("executor", "Sending request to /tool", {
    runId,
    payload: {
      tool: normalizedDecision.tool,
      input: normalizedDecision.input
    }
  });

  try {
    const response = await callTool({
      tool: normalizedDecision.tool,
      input: normalizedDecision.input
    }, { runId });

    logDebug("executor", "Received tool response", {
      runId,
      response
    });

    return response;
  } catch (error) {
    logError("executor", "Request failed", {
      runId,
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  validateDecision,
  executeDecision
};