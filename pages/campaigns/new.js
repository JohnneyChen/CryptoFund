import React, { Component } from "react";
import { Form, Input, Message, Button } from "semantic-ui-react";
import { withRouter } from "next/router";

import Layout from "../../components/layout";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";

class NewCampaign extends Component {
  state = {
    minimumContribution: "",
    errorMessage: "",
    isLoading: false,
  };

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: "", isLoading: true });

    try {
      const accounts = await web3.eth.getAccounts();

      await factory.methods
        .createCampaign(this.state.minimumContribution)
        .send({ from: accounts[0] });

      this.props.router.push("/");
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ isLoading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Create a New Campaign</h3>
        <Form error={!!this.state.errorMessage} onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Minimum Contribution</label>
            <Input
              onChange={(e) =>
                this.setState({ minimumContribution: e.target.value })
              }
              label="wei"
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
            content="Create Campaign"
          />
        </Form>
      </Layout>
    );
  }
}

export default withRouter(NewCampaign);
