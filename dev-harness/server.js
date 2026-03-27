const http = require("http");
const fs = require("fs");
const path = require("path");

const { logDebug, logError } = require("./debug");
const {
  resolveWhiteboardPath,
  validateWhiteboardPath
} = require("../src/utils/whiteboard-path");

const MAX_BODY_SIZE = 64 * 1024;

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
    if (req.method !== "POST") {
      return sendJson(res, 405, { error: "Method Not Allowed" }, {
        Allow: "POST"
      });
    }

    const contentType = req.headers["content-type"] || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return sendJson(res, 415, { error: "Unsupported Media Type" });
    }

    let body = "";
    let bodySize = 0;
    let bodyTooLarge = false;
    const runId = req.headers["x-run-id"] || "local";

    logDebug("server", "Incoming /tool request", {
      runId,
      method: req.method,
      url: req.url,
      contentType
    });

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

server.listen(3000, () => {
  console.log("Dev Harness Tool Server running on http://localhost:3000");
});
