import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Menu } from "semantic-ui-react";

export default () => {
  const router = useRouter();
  const getClassName = (href) => {
    return `item ${router.asPath === href ? "active" : ""}`;
  };

  return (
    <Menu style={{ marginTop: "10px" }}>
      <Link href="/">
        <a className="item">CryptoFund</a>
      </Link>
      <Menu.Menu position="right">
        <Link href="/">
          <a className={getClassName("/")}>Campaigns</a>
        </Link>
        <Link href="/campaigns/new">
          <a className={getClassName("/campaigns/new")}>+</a>
        </Link>
      </Menu.Menu>
    </Menu>
  );
};
