import React, { Component } from "react";
import { Form, Button, Message, Input, TextArea } from "semantic-ui-react";
import { withRouter } from "next/router";

import web3 from "../../../../ethereum/web3";
import getCampaign from "../../../../ethereum/campaign";
import Layout from "../../../../components/layout";

class ContributeForm extends Component {
  state = {
    recipient: "",
    value: "",
    description: "",
    errorMessage: "",
    isLoading: false,
  };

  static getInitialProps({ query }) {
    return { address: query.address };
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: "", isLoading: true });

    try {
      const accounts = await web3.eth.getAccounts();
      const { address } = this.props;
      const { description, value, recipient } = this.state;

      const campaign = getCampaign(address);
      await campaign.methods
        .createRequest(description, web3.utils.toWei(value, "ether"), recipient)
        .send({
          from: accounts[0],
        });

      this.props.router.push(`/campaigns/${address}/requests`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ isLoading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Create a New Request</h3>
        <Form error={!!this.state.errorMessage} onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Description</label>
            <TextArea
              onChange={(e) => this.setState({ description: e.target.value })}
            ></TextArea>
          </Form.Field>
          <Form.Field>
            <label>Recipient</label>
            <Input
              onChange={(e) => this.setState({ recipient: e.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Amount to Vendor</label>
            <Input
              onChange={(e) => this.setState({ value: e.target.value })}
              label="ether"
              labelPosition="right"
            />
          </Form.Field>
          <Message
            error
            header="Oh No! Something Went Wrong"
            content={this.state.errorMessage}
          />{" "}
          <Button
            loading={this.state.isLoading}
            primary
            content="New Request"
          />
        </Form>
      </Layout>
    );
  }
}

export default withRouter(ContributeForm);
