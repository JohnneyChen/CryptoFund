import React from "react";
import { Container } from "semantic-ui-react";
import Head from "next/head";

import Header from "./header";

export default ({ children }) => {
  return (
    <Container>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
        />
      </Head>
      <Header />
      {children}
    </Container>
  );
};
