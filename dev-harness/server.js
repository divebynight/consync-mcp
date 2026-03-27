const http = require("http");
const fs = require("fs");
const path = require("path");

const { logDebug, logError } = require("./debug");

const ROOT = path.join(__dirname, "artifacts");

function getWhiteboardPath() {
  return path.join(ROOT, "whiteboard.md");
}

function readWhiteboard() {
  return fs.readFileSync(getWhiteboardPath(), "utf-8");
}

function appendWhiteboard(content) {
  fs.appendFileSync(getWhiteboardPath(), "\n" + content + "\n");
  return "Appended";
}

function normalizeInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  if (typeof input.text === "string") {
    return { text: input.text };
  }

  if (typeof input.content === "string") {
    return { text: input.content };
  }

  return {};
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/tool") {
    let body = "";
    const runId = req.headers["x-run-id"] || "local";

    logDebug("server", "Incoming /tool request", {
      runId,
      method: req.method,
      url: req.url
    });

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
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
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ result }));
        }

        if (parsed.tool === "append_whiteboard") {
          const input = normalizeInput(parsed.input);
          logDebug("server", "Validated input", {
            runId,
            input
          });
          const result = appendWhiteboard(input.text || "");
          logDebug("server", "Whiteboard append succeeded", {
            runId,
            appended: input.text || ""
          });
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ result }));
        }

        logError("server", "Unknown tool", {
          runId,
          tool: parsed.tool
        });
        res.writeHead(400);
        res.end("Unknown tool");

      } catch (err) {
        logError("server", "Request handling failed", {
          runId,
          error: err.message
        });
        res.writeHead(500);
        res.end("Invalid request");
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(3000, () => {
  console.log("Dev Harness Tool Server running on http://localhost:3000");
});
