const fs = require("fs");
const path = require("path");

const HANDOFF_PATH = path.resolve(__dirname, "..", "state", "handoff.md");

function main() {
  try {
    process.stdout.write(fs.readFileSync(HANDOFF_PATH, "utf8"));
  } catch (error) {
    process.stderr.write("No handoff available. Run npm run review:handoff first.\n");
    process.exit(1);
  }
}

main();