const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { validateDecision } = require("./executor");
const { decideWithFakeModel } = require("./fake-model");
const { loadState } = require("./state-loader");
const {
  LEGACY_WHITEBOARD_PATH,
  resolveWhiteboardPath,
  validateWhiteboardPath
} = require("../src/utils/whiteboard-path");

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

function createTempWhiteboard(content) {
  const dirPath = fs.mkdtempSync(path.join(os.tmpdir(), "dev-harness-"));
  const filePath = path.join(dirPath, "whiteboard.md");

  if (content !== null) {
    fs.writeFileSync(filePath, content, "utf-8");
  }

  return filePath;
}

function withEnv(name, value, fn) {
  const previousValue = process.env[name];

  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }

  try {
    fn();
  } finally {
    if (previousValue === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previousValue;
    }
  }
}

test("fake-model read request returns read_whiteboard", () => {
  const decision = decideWithFakeModel("show it", {
    whiteboard: { content: "", exists: false, lineCount: 0, charCount: 0 }
  });

  assert.strictEqual(decision.tool, "read_whiteboard");
});

test("fake-model append request returns append_whiteboard", () => {
  const decision = decideWithFakeModel("add ## hello", {
    whiteboard: { content: "", exists: false, lineCount: 0, charCount: 0 }
  });

  assert.strictEqual(decision.tool, "append_whiteboard");
  assert.strictEqual(decision.input.text, "## hello");
});

test("fake-model continue on non-empty state returns append_whiteboard", () => {
  const decision = decideWithFakeModel("continue", {
    whiteboard: { content: "# existing", exists: true, lineCount: 1, charCount: 10 }
  });

  assert.strictEqual(decision.tool, "append_whiteboard");
  assert.strictEqual(decision.debug.usedState, true);
});

test("fake-model continue on empty state returns null tool", () => {
  const decision = decideWithFakeModel("continue", {
    whiteboard: { content: "", exists: false, lineCount: 0, charCount: 0 }
  });

  assert.strictEqual(decision.tool, null);
  assert.strictEqual(decision.debug.matchedRule, "continue-empty");
});

test("executor validation rejects unknown tool", () => {
  assert.throws(() => {
    validateDecision({ tool: "unknown_tool", input: {} });
  }, /unknown tool/);
});

test("executor validation rejects append without text", () => {
  assert.throws(() => {
    validateDecision({ tool: "append_whiteboard", input: {} });
  }, /missing required input field "text"/);
});

test("executor validation rejects null tool", () => {
  assert.throws(() => {
    validateDecision({ tool: null, input: {} });
  }, /No executable tool selected by agent/);
});

test("state-loader returns safe defaults if whiteboard missing", () => {
  const dirPath = fs.mkdtempSync(path.join(os.tmpdir(), "dev-harness-missing-"));
  const missingPath = path.join(dirPath, "whiteboard.md");
  const state = loadState(missingPath);

  assert.strictEqual(state.whiteboard.exists, false);
  assert.strictEqual(state.whiteboard.content, "");
  assert.strictEqual(state.whiteboard.lineCount, 0);
  assert.strictEqual(state.whiteboard.charCount, 0);
});

test("state-loader returns content summary if whiteboard exists", () => {
  const filePath = createTempWhiteboard("# Test\n\n## Notes");
  const state = loadState(filePath);

  assert.strictEqual(state.whiteboard.exists, true);
  assert.strictEqual(state.whiteboard.content, "# Test\n\n## Notes");
  assert.strictEqual(state.whiteboard.lineCount, 3);
  assert.strictEqual(state.whiteboard.charCount, "# Test\n\n## Notes".length);
});

test("whiteboard path defaults to the legacy tracked artifact", () => {
  withEnv("CONSYNC_WHITEBOARD_PATH", undefined, () => {
    assert.strictEqual(resolveWhiteboardPath(), LEGACY_WHITEBOARD_PATH);
  });
});

test("whiteboard path uses CONSYNC_WHITEBOARD_PATH when set", () => {
  withEnv("CONSYNC_WHITEBOARD_PATH", "artifacts/whiteboard.md", () => {
    assert.strictEqual(
      resolveWhiteboardPath(),
      path.resolve(__dirname, "..", "artifacts", "whiteboard.md")
    );
  });
});

test("validateWhiteboardPath accepts valid file paths", () => {
  const filePath = createTempWhiteboard("# Test");

  assert.strictEqual(validateWhiteboardPath(filePath), path.normalize(filePath));
});

test("validateWhiteboardPath accepts non-existent file paths", () => {
  const filePath = path.join(os.tmpdir(), `consync-whiteboard-${Date.now()}.md`);

  assert.strictEqual(validateWhiteboardPath(filePath), path.normalize(filePath));
});

test("validateWhiteboardPath rejects directory paths", () => {
  const dirPath = fs.mkdtempSync(path.join(os.tmpdir(), "consync-whiteboard-dir-"));

  assert.strictEqual(validateWhiteboardPath(dirPath), null);
});

test("validateWhiteboardPath rejects null and empty paths", () => {
  assert.strictEqual(validateWhiteboardPath(null), null);
  assert.strictEqual(validateWhiteboardPath(""), null);
  assert.strictEqual(validateWhiteboardPath("   "), null);
});

test("validateWhiteboardPath rejects non-string paths", () => {
  assert.strictEqual(validateWhiteboardPath(42), null);
});

if (!process.exitCode) {
  console.log("All tests passed");
}