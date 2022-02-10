import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const factory = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  process.env.CAMPAIGN_FACTORY_ADDRESS
);

export default factory;
