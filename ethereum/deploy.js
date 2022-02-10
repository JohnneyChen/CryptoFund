const HDWallet = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
require("dotenv").config();

const campaignFactory = require("./build/CampaignFactory.json");

const provider = new HDWallet(
  process.env.METAMASK_ACCOUNT,
  process.env.INFURA_NODE
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  const contract = new web3.eth.Contract(JSON.parse(campaignFactory.interface));

  const res = await contract
    .deploy({ data: campaignFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  console.log(`deployed at ${res.options.address}`);

  provider.engine.stop();
};

deploy();
