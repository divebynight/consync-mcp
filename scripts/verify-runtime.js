const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { execSync, spawn } = require("child_process");

const {
  STATE_JSON_PATH,
  buildStateSnapshot,
  readJson,
  writeStateFiles
} = require("./update-current-state");

const REPO_ROOT = path.resolve(__dirname, "..");

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function runTestSuite() {
  try {
    execSync(`${npmCommand()} test`, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return {
      status: "passed",
      notes: `Passed ${new Date().toISOString()} via npm test.`
    };
  } catch (error) {
    const output = `${error.stdout || ""}${error.stderr || ""}`.trim();
    const firstLine = output.split(/\r?\n/).find(Boolean) || error.message;

    return {
      status: "failed",
      notes: `Failed ${new Date().toISOString()} via npm test: ${firstLine}`
    };
  }
}

function startProcess(command, args, env) {
  return spawn(command, args, {
    cwd: REPO_ROOT,
    env: Object.assign({}, process.env, env),
    stdio: "ignore",
    detached: process.platform !== "win32"
  });
}

function stopProcess(child) {
  return new Promise(resolve => {
    if (!child || child.exitCode !== null) {
      resolve();
      return;
    }

    const finish = () => resolve();
    child.once("exit", finish);

    try {
      if (process.platform !== "win32") {
        process.kill(-child.pid, "SIGTERM");
      } else {
        child.kill("SIGTERM");
      }
    } catch (error) {
      child.removeListener("exit", finish);
      resolve();
      return;
    }

    setTimeout(() => {
      child.removeListener("exit", finish);
      resolve();
    }, 1000);
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requestTool(port, payload, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/tool",
        method: "POST",
        headers
      },
      res => {
        let responseBody = "";

        res.on("data", chunk => {
          responseBody += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 0,
            body: responseBody
          });
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function waitForServer(port) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    try {
      const response = await requestTool(port, {
        tool: "read_whiteboard",
        input: {}
      });

      if (response.statusCode > 0) {
        return true;
      }
    } catch (error) {
      // Keep polling until the server is ready or the attempts are exhausted.
    }

    await wait(200);
  }

  return false;
}

async function verifyServerRuntime() {
  const verifyPort = 3401;
  const whiteboardPath = path.join(os.tmpdir(), `consync-verify-${Date.now()}.md`);
  const child = startProcess(npmCommand(), ["start"], {
    CONSYNC_SERVER_PORT: String(verifyPort),
    CONSYNC_WHITEBOARD_PATH: whiteboardPath
  });

  let serverStarted = false;
  let whiteboardRead = false;
  let whiteboardAppend = false;
  let readNotes = "";
  let appendNotes = "";
  let serverNotes = "";

  try {
    serverStarted = await waitForServer(verifyPort);

    if (!serverStarted) {
      serverNotes = `Failed ${new Date().toISOString()}: npm start did not respond on port ${verifyPort}.`;
      return {
        serverStart: { status: "failed", notes: serverNotes },
        whiteboardRead: { status: "failed", notes: "Server did not start." },
        whiteboardAppend: { status: "failed", notes: "Server did not start." }
      };
    }

    const initialRead = await requestTool(verifyPort, {
      tool: "read_whiteboard",
      input: {}
    });

    whiteboardRead = initialRead.statusCode === 200;
    readNotes = whiteboardRead
      ? `Passed ${new Date().toISOString()} via /tool read on temporary whiteboard path.`
      : `Failed ${new Date().toISOString()} via /tool read: ${initialRead.body}`;

    const appendText = "## verify-runtime";
    const appendResponse = await requestTool(verifyPort, {
      tool: "append_whiteboard",
      input: { text: appendText }
    });

    const verifyRead = await requestTool(verifyPort, {
      tool: "read_whiteboard",
      input: {}
    });

    whiteboardAppend = appendResponse.statusCode === 200
      && verifyRead.statusCode === 200
      && verifyRead.body.includes(appendText);

    appendNotes = whiteboardAppend
      ? `Passed ${new Date().toISOString()} via append and follow-up read on temporary whiteboard path.`
      : `Failed ${new Date().toISOString()} while verifying append/read round trip.`;

    serverNotes = `Passed ${new Date().toISOString()} via npm start on temporary port ${verifyPort}.`;

    return {
      serverStart: { status: "passed", notes: serverNotes },
      whiteboardRead: { status: whiteboardRead ? "passed" : "failed", notes: readNotes },
      whiteboardAppend: { status: whiteboardAppend ? "passed" : "failed", notes: appendNotes }
    };
  } finally {
    await stopProcess(child);
  }
}

function supportsAuth() {
  const serverPath = path.join(REPO_ROOT, "src", "server.js");

  try {
    return fs.readFileSync(serverPath, "utf8").includes("CONSYNC_AUTH_TOKEN");
  } catch (error) {
    return false;
  }
}

async function verifyAuth() {
  if (!supportsAuth()) {
    return {
      status: "pending",
      notes: "Auth verification skipped because CONSYNC_AUTH_TOKEN support was not detected."
    };
  }

  const verifyPort = 3402;
  const token = "verify-script-token";
  const whiteboardPath = path.join(os.tmpdir(), `consync-verify-auth-${Date.now()}.md`);
  fs.writeFileSync(whiteboardPath, "# auth verify\n", "utf8");

  const child = startProcess(process.execPath, [path.join("src", "server.js")], {
    CONSYNC_SERVER_PORT: String(verifyPort),
    CONSYNC_WHITEBOARD_PATH: whiteboardPath,
    CONSYNC_AUTH_TOKEN: token
  });

  try {
    const ready = await waitForServer(verifyPort);

    if (!ready) {
      return {
        status: "failed",
        notes: `Failed ${new Date().toISOString()}: auth-enabled server did not start on port ${verifyPort}.`
      };
    }

    const unauthorized = await requestTool(verifyPort, {
      tool: "read_whiteboard",
      input: {}
    });
    const authorized = await requestTool(verifyPort, {
      tool: "read_whiteboard",
      input: {}
    }, token);

    const passed = unauthorized.statusCode === 401 && authorized.statusCode === 200;

    return {
      status: passed ? "passed" : "failed",
      notes: passed
        ? `Passed ${new Date().toISOString()}: /tool returned 401 without token and 200 with a valid bearer token.`
        : `Failed ${new Date().toISOString()}: unexpected auth response codes ${unauthorized.statusCode}/${authorized.statusCode}.`
    };
  } finally {
    await stopProcess(child);
  }
}

async function main() {
  const existingState = readJson(STATE_JSON_PATH, {});
  const state = buildStateSnapshot(existingState);

  state.features.testSuite = runTestSuite();
  state.features.devStart = {
    status: "inferred",
    notes: "npm run dev points to the same script as npm start in package.json."
  };

  const runtimeResults = await verifyServerRuntime();
  state.features.serverStart = runtimeResults.serverStart;
  state.features.whiteboardRead = runtimeResults.whiteboardRead;
  state.features.whiteboardAppend = runtimeResults.whiteboardAppend;
  state.features.authChecks = await verifyAuth();
  state.meta.lastUpdated = new Date().toISOString();

  writeStateFiles(state);

  const failed = Object.entries(state.features)
    .filter(([, value]) => value && value.status === "failed")
    .map(([key]) => key);

  if (failed.length > 0) {
    console.error(`Verification failed: ${failed.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  console.log("Verification passed and state/current-state.json was updated");
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});