const { decideWithFakeModel } = require("./fake-model");

function buildDecision(requestText, state) {
  if (typeof requestText !== "string" || !requestText.trim()) {
    throw new Error("Usage: provide a non-empty instruction");
  }

  return decideWithFakeModel(requestText, state);
}

module.exports = {
  buildDecision
};