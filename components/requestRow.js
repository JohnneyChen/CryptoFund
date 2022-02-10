import React, { Component } from "react";
import { Table, Button } from "semantic-ui-react";
import { withRouter } from "next/router";

import web3 from "../ethereum/web3";
import getCampaign from "../ethereum/campaign";

class RequestRow extends Component {
  state = {
    isFinalizing: false,
    isApproving: false,
  };

  isFinalizable() {
    return (
      !this.props.request.complete &&
      this.props.request.approvalCount > this.props.approversCount / 2
    );
  }

  isApprovable() {
    return !this.props.request.complete;
  }

  renderApprovalButton() {
    return (
      <Table.Cell>
        <Button
          color="green"
          content="Approve"
          icon="check"
          loading={this.state.isApproving}
          onClick={this.approveRequest}
        ></Button>
      </Table.Cell>
    );
  }

  renderFinalizeButton() {
    return (
      <Table.Cell>
        <Button
          color="teal"
          content="Finalize"
          icon="paper plane"
          loading={this.state.isFinalizing}
          onClick={this.finalizeRequest}
        ></Button>
      </Table.Cell>
    );
  }

  finalizeRequest = async () => {
    const accounts = await web3.eth.getAccounts();
    const campaign = getCampaign(this.props.address);

    if (this.isFinalizable()) {
      this.setState({ isFinalizing: true });

      try {
        await campaign.methods.finalizeRequest(this.props.index).send({
          from: accounts[0],
        });
        this.props.router.reload();
      } catch (err) {}

      this.setState({ isFinalizing: false });
    }
  };

  approveRequest = async () => {
    const accounts = await web3.eth.getAccounts();
    const campaign = getCampaign(this.props.address);

    if (this.isApprovable()) {
      this.setState({ isApproving: true });

      try {
        await campaign.methods.approveRequest(this.props.index).send({
          from: accounts[0],
        });
        this.props.router.reload();
      } catch (err) {}

      this.setState({ isApproving: false });
    }
  };

  render() {
    const { request, approversCount, index } = this.props;

    return (
      <Table.Row disabled={request.complete} positive={this.isFinalizable()}>
        <Table.Cell>{index}</Table.Cell>
        <Table.Cell>{request.description}</Table.Cell>
        <Table.Cell>{web3.utils.fromWei(request.value, "ether")}</Table.Cell>
        <Table.Cell>{request.recipient}</Table.Cell>
        <Table.Cell>{`${request.approvalCount}/${approversCount}`}</Table.Cell>
        {this.isApprovable() ? (
          this.renderApprovalButton()
        ) : (
          <Table.Cell></Table.Cell>
        )}
        {this.isFinalizable() ? (
          this.renderFinalizeButton()
        ) : (
          <Table.Cell></Table.Cell>
        )}
      </Table.Row>
    );
  }
}

export default withRouter(RequestRow);
