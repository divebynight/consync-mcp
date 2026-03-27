const { decideWithFakeModel } = require("./fake-model");

function buildDecision(requestText, state) {
  if (typeof requestText !== "string" || !requestText.trim()) {
    throw new Error("Usage: node dev-harness/agent.js \"your instruction here\"");
  }

  return decideWithFakeModel(requestText, state);
}

module.exports = {
  buildDecision
};