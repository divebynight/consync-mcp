const http = require("http");
const fs = require("fs");
const path = require("path");

const { logDebug, logError } = require("./debug");
const {
  resolveWhiteboardPath,
  validateWhiteboardPath
} = require("../src/utils/whiteboard-path");

const MAX_BODY_SIZE = 64 * 1024;
const DEFAULT_SERVER_HOST = "127.0.0.1";
const DEFAULT_SERVER_PORT = 3000;

function resolveServerPort() {
  const port = Number.parseInt(process.env.CONSYNC_SERVER_PORT || "", 10);

  if (Number.isInteger(port) && port > 0 && port <= 65535) {
    return port;
  }

  return DEFAULT_SERVER_PORT;
}

function resolveServerHost() {
  const host = process.env.CONSYNC_SERVER_HOST;

  if (typeof host === "string" && host.trim()) {
    return host.trim();
  }

  return DEFAULT_SERVER_HOST;
}

function resolveAuthToken() {
  const token = process.env.CONSYNC_AUTH_TOKEN;

  if (typeof token === "string" && token.trim()) {
    return token.trim();
  }

  return "";
}

function sanitizeRequestId(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
}

function createRequestId() {
  return Math.random().toString(36).slice(2, 10);
}

function resolveRequestId(req) {
  return sanitizeRequestId(req.headers["x-run-id"]) || createRequestId();
}

function isAuthorizedRequest(req, authToken) {
  if (!authToken) {
    return true;
  }

  const headerValue = req.headers.authorization;

  if (typeof headerValue !== "string" || !headerValue.startsWith("Bearer ")) {
    return false;
  }

  return headerValue.slice(7) === authToken;
}

const SERVER_HOST = resolveServerHost();
const SERVER_PORT = resolveServerPort();
const AUTH_TOKEN = resolveAuthToken();

function getWhiteboardPath() {
  return validateWhiteboardPath(resolveWhiteboardPath());
}

function readWhiteboard() {
  const whiteboardPath = getWhiteboardPath();

  if (!whiteboardPath) {
    throw new Error("Invalid whiteboard path");
  }

  return fs.readFileSync(whiteboardPath, "utf-8");
}

function appendWhiteboard(content) {
  const whiteboardPath = getWhiteboardPath();

  if (!whiteboardPath) {
    throw new Error("Invalid whiteboard path");
  }

  if (!content.trim()) {
    return "Appended";
  }

  fs.mkdirSync(path.dirname(whiteboardPath), { recursive: true });
  fs.appendFileSync(whiteboardPath, "\n" + content + "\n");
  return "Appended";
}

function normalizeInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { text: null };
  }

  if (typeof input.text === "string") {
    return { text: input.text };
  }

  if (typeof input.content === "string") {
    return { text: input.content };
  }

  return { text: null };
}

function sendJson(res, statusCode, payload, headers) {
  res.writeHead(statusCode, Object.assign({
    "Content-Type": "application/json"
  }, headers));
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (req.url === "/tool") {
    const runId = resolveRequestId(req);

    if (req.method !== "POST") {
      logError("server", "Rejected request: method not allowed", {
        runId,
        method: req.method,
        url: req.url
      });
      return sendJson(res, 405, { error: "Method Not Allowed" }, {
        Allow: "POST"
      });
    }

    const contentType = req.headers["content-type"] || "";

    logDebug("server", "Incoming /tool request", {
      runId,
      method: req.method,
      url: req.url,
      contentType,
      authEnabled: Boolean(AUTH_TOKEN)
    });

    if (!isAuthorizedRequest(req, AUTH_TOKEN)) {
      logError("server", "Rejected request: unauthorized", {
        runId,
        method: req.method,
        url: req.url
      });
      return sendJson(res, 401, { error: "Unauthorized" }, {
        "WWW-Authenticate": "Bearer"
      });
    }

    if (!contentType.toLowerCase().includes("application/json")) {
      logError("server", "Rejected request: unsupported media type", {
        runId,
        contentType
      });
      return sendJson(res, 415, { error: "Unsupported Media Type" });
    }

    let body = "";
    let bodySize = 0;
    let bodyTooLarge = false;

    req.on("data", chunk => {
      if (bodyTooLarge) {
        return;
      }

      bodySize += chunk.length;

      if (bodySize > MAX_BODY_SIZE) {
        bodyTooLarge = true;
        return;
      }

      body += chunk;
    });

    req.on("end", () => {
      if (bodyTooLarge) {
        logError("server", "Request body too large", {
          runId,
          bodySize,
          maxBodySize: MAX_BODY_SIZE
        });
        return sendJson(res, 413, { error: "Payload Too Large" });
      }

      try {
        const parsed = JSON.parse(body);

        logDebug("server", "Chosen tool", {
          runId,
          tool: parsed.tool
        });

        if (parsed.tool === "read_whiteboard") {
          const result = readWhiteboard();
          logDebug("server", "Whiteboard read succeeded", {
            runId,
            bytes: Buffer.byteLength(result)
          });
          return sendJson(res, 200, { result });
        }

        if (parsed.tool === "append_whiteboard") {
          const input = normalizeInput(parsed.input);

          if (typeof input.text !== "string") {
            logError("server", "Invalid append input", {
              runId,
              input: parsed.input
            });
            return sendJson(res, 400, { error: "Bad Request" });
          }

          logDebug("server", "Validated input", {
            runId,
            input
          });

          const isNoOp = !input.text.trim();
          const result = appendWhiteboard(input.text);

          logDebug("server", "Whiteboard append succeeded", {
            runId,
            appended: isNoOp ? "" : input.text,
            noOp: isNoOp
          });

          return sendJson(res, 200, { result });
        }

        logError("server", "Unknown tool", {
          runId,
          tool: parsed.tool
        });
        return sendJson(res, 400, { error: "Bad Request" });

      } catch (err) {
        logError("server", "Request handling failed", {
          runId,
          error: err.message
        });
        return sendJson(res, 400, { error: "Bad Request" });
      }
    });

    return;
  }

  sendJson(res, 404, { error: "Not Found" });
});

server.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(
    `Dev Harness Tool Server running on http://${SERVER_HOST}:${SERVER_PORT} (auth ${AUTH_TOKEN ? "enabled" : "disabled"})`
  );
});
