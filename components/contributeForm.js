import React, { Component } from "react";
import { Form, Button, Message, Input } from "semantic-ui-react";
import { withRouter } from "next/router";

import web3 from "../ethereum/web3";
import getCampaign from "../ethereum/campaign";

class ContributeForm extends Component {
  state = {
    contribution: "",
    errorMessage: "",
    isLoading: false,
  };

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: "", isLoading: true });

    try {
      const accounts = await web3.eth.getAccounts();

      const campaign = getCampaign(this.props.address);
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.contribution, "ether"),
      });

      this.props.router.reload();
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ isLoading: false });
  };

  render() {
    return (
      <Form error={!!this.state.errorMessage} onSubmit={this.onSubmit}>
        <Form.Field>
          <label>Contribute to this Campaign</label>
          <Input
            onChange={(e) => this.setState({ contribution: e.target.value })}
            label="ether"
            labelPosition="right"
          />
        </Form.Field>
        <Message
          error
          header="Oh No! Something Went Wrong"
          content={this.state.errorMessage}
        />{" "}
        <Button loading={this.state.isLoading} primary content="Contribute" />
      </Form>
    );
  }
}

export default withRouter(ContributeForm);
