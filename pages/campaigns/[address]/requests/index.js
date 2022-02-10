import React, { Component } from "react";
import { withRouter } from "next/router";
import Link from "next/link";

import getCampaign from "../../../../ethereum/campaign";
import Layout from "../../../../components/layout";
import { Table, Button } from "semantic-ui-react";
import RequestRow from "../../../../components/requestRow";
import web3 from "../../../../ethereum/web3";

class RequestsView extends Component {
  static async getInitialProps({ query }) {
    const campaign = getCampaign(query.address);

    const requestsCount = parseInt(
      await campaign.methods.getRequestsLength().call()
    );

    const requests = await Promise.all(
      Array(requestsCount)
        .fill()
        .map((element, index) => {
          return campaign.methods.requests(index).call();
        })
    );
    const approversCount = await campaign.methods.approversCount().call();
    const manager = await campaign.methods.manager().call();

    const accounts = await web3.eth.getAccounts();
    const isManager = accounts.length ? manager === accounts[0] : false;

    return {
      requests,
      approversCount,
      address: query.address,
      campaign,
      manager,
      isManager,
    };
  }

  renderRows() {
    return this.props.requests.map((request, index) => {
      return (
        <RequestRow
          request={request}
          approversCount={this.props.approversCount}
          index={index}
          key={index}
          manager={this.props.manager}
          address={this.props.address}
        ></RequestRow>
      );
    });
  }

  render() {
    return (
      <Layout>
        <h3>Requests</h3>
        {this.props.isManager ? (
          <Link href={`/campaigns/${this.props.address}/requests/new`}>
            <Button
              primary
              icon="add circle"
              content="New Request"
              floated="right"
              style={{ marginBottom: "10px" }}
            ></Button>
          </Link>
        ) : null}

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Recipient</Table.HeaderCell>
              <Table.HeaderCell>Approval Count</Table.HeaderCell>
              <Table.HeaderCell>Approve</Table.HeaderCell>
              <Table.HeaderCell>Finalize</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.renderRows()}</Table.Body>
        </Table>
      </Layout>
    );
  }
}

export default withRouter(RequestsView);
