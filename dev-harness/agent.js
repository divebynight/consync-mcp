const { buildDecision } = require("../src/services/agent");
const { loadState } = require("./state-loader");

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