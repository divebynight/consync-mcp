const { decideWithFakeModel } = require("./fake-model");
const { loadState } = require("./state-loader");

function buildDecision(requestText, state) {
  if (typeof requestText !== "string" || !requestText.trim()) {
    throw new Error("Usage: node dev-harness/agent.js \"your instruction here\"");
  }

  return decideWithFakeModel(requestText, state);
}

function run() {
  const requestText = process.argv.slice(2).join(" ");
  const state = loadState();
  const decision = buildDecision(requestText, state);
  console.log(JSON.stringify(decision, null, 2));
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  buildDecision
};