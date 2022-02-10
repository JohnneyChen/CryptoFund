const ganache = require("ganache-cli");
const assert = require("assert");
const Web3 = require("web3");

const campaignFactory = require("../ethereum/build/CampaignFactory.json");
const campaignContract = require("../ethereum/build/Campaign.json");

const web3 = new Web3(ganache.provider());

let factory;
let accounts;
let campaign;
let campaignAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(campaignFactory.interface))
    .deploy({ data: campaignFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods
    .createCampaign(100)
    .send({ from: accounts[0], gas: "1000000" });

  campaignAddress = await factory.methods.deployedCampaigns(0).call();

  campaign = await new web3.eth.Contract(
    JSON.parse(campaignContract.interface),
    campaignAddress
  );
});

describe("Factory", () => {
  it("deploys factory and campaign contract", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("assigns campaign sender as manager", async () => {
    const manager = await campaign.methods.manager().call();

    assert.equal(manager, accounts[0]);
  });
});

describe("Campaign", () => {
  describe("Approvers", () => {
    it("adds contributers with sufficent amount to approvers", async () => {
      await campaign.methods
        .contribute()
        .send({ from: accounts[1], value: "500", gas: "1000000" });

      const isApprover = await campaign.methods.approvers(accounts[1]).call();
      const approversCount = await campaign.methods.approversCount().call();

      assert(isApprover);
      assert.equal(approversCount, 1);
    });

    it("doesnt adds contributers with insufficent amount to approvers", async () => {
      try {
        await campaign.methods
          .contribute()
          .send({ from: accounts[1], value: "50", gas: "1000000" });
      } catch (err) {
        assert.ok(err);

        const isApprover = await campaign.methods.approvers(accounts[1]).call();
        const approversCount = await campaign.methods.approversCount().call();

        assert(!isApprover);
        assert.equal(approversCount, 0);
      }
    });
  });

  describe("Request", () => {
    const requestSetup = async () => {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: web3.utils.toWei("10", "ether"),
        gas: "1000000",
      });

      await campaign.methods
        .createRequest(
          "Test Request",
          web3.utils.toWei("5", "ether"),
          accounts[5]
        )
        .send({ from: accounts[0], gas: "1000000" });
    };

    it("manager can create a request", async () => {
      await campaign.methods
        .createRequest("Test Request", "1000", accounts[5])
        .send({ from: accounts[0], gas: "1000000" });

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.description, "Test Request");
      assert.equal(request.value, 1000);
      assert.equal(request.recipient, accounts[5]);
    });

    it("approvers cant create a request", async () => {
      try {
        await campaign.methods
          .createRequest(
            "Test Request",
            web3.utils.toWei("5", "ether"),
            accounts[5]
          )
          .send({ from: accounts[1], gas: "1000000" });
      } catch (err) {
        assert.ok(err);
      }
    });

    it("approvers can approve request", async () => {
      await requestSetup();

      await campaign.methods
        .approveRequest(0)
        .send({ from: accounts[1], gas: "1000000" });

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.approvalCount, 1);
    });

    it("multiple approval by same approvers doesnt change request approval number", async () => {
      await requestSetup();

      await campaign.methods
        .approveRequest(0)
        .send({ from: accounts[1], gas: "1000000" });

      try {
        await campaign.methods
          .approveRequest(0)
          .send({ from: accounts[1], gas: "1000000" });
      } catch (err) {
        assert.ok(err);
      }

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.approvalCount, 1);
    });

    it("non-approvers cant approve request", async () => {
      await requestSetup();

      try {
        await campaign.methods
          .approveRequest(0)
          .send({ from: accounts[2], gas: "1000000" });
      } catch (err) {
        assert.ok(err);
      }

      const request = await campaign.methods.requests(0).call();

      assert.equal(request.approvalCount, 0);
    });

    it("manager can approve request with over 50% approval", async () => {
      await requestSetup();
      await campaign.methods
        .approveRequest(0)
        .send({ from: accounts[1], gas: "1000000" });

      const request = await campaign.methods.requests(0).call();
      const approvers = await campaign.methods.approversCount().call();

      await campaign.methods
        .finalizeRequest(0)
        .send({ from: accounts[0], gas: "1000000" });

      let newAccountBalance = await web3.eth.getBalance(accounts[5]);
      newAccountBalance = web3.utils.fromWei(newAccountBalance, "ether");
      newAccountBalance = parseFloat(newAccountBalance);

      assert(newAccountBalance > 104);
    });

    it("approver cant approve request with over 50% approval", async () => {
      await requestSetup();
      let accountBalance = await web3.eth.getBalance(accounts[5]);
      accountBalance = web3.utils.fromWei(accountBalance, "ether");
      accountBalance = parseFloat(accountBalance);

      await campaign.methods
        .approveRequest(0)
        .send({ from: accounts[1], gas: "1000000" });

      const request = await campaign.methods.requests(0).call();
      const approvers = await campaign.methods.approversCount().call();

      try {
        await campaign.methods
          .finalizeRequest(0)
          .send({ from: accounts[1], gas: "1000000" });
      } catch (err) {
        assert.ok(err);
      }

      let newAccountBalance = await web3.eth.getBalance(accounts[5]);
      newAccountBalance = web3.utils.fromWei(newAccountBalance, "ether");
      newAccountBalance = parseFloat(newAccountBalance);

      assert(newAccountBalance === accountBalance);
    });
  });
});
