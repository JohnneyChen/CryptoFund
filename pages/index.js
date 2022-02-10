import React, { Component } from "react";
import Link from "next/link";
import { Button, Card } from "semantic-ui-react";

import Layout from "../components/layout";
import factory from "../ethereum/factory";

class CampaignIndex extends Component {
  static async getInitialProps() {
    const campaigns = await factory.methods.getDeployedCampaigns().call();

    return { campaigns };
  }

  renderCampaigns() {
    const items = this.props.campaigns.map((address) => {
      return {
        header: address,
        description: (
          <Link href={`/campaigns/${address}`}>
            <a>View Campaign</a>
          </Link>
        ),
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Available Campaigns</h3>
        <Link href="/campaigns/new">
          <Button
            floated="right"
            primary
            icon="add circle"
            content="Create Campaign"
            size="massive"
          ></Button>
        </Link>
        {this.renderCampaigns()}
      </Layout>
    );
  }
}

export default CampaignIndex;
