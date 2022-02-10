const fs = require("fs-extra");
const solc = require("solc");
const path = require("path");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const contractPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(contractPath, "utf8");

const outputs = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in outputs) {
  fs.outputJsonSync(
    path.resolve(__dirname, "build", `${contract.replace(":", "")}.json`),
    outputs[contract]
  );
}
