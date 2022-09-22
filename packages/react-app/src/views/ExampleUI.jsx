// import { Layout } from 'antd';
// import { SyncOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
// import { utils } from "ethers";
import { SyncOutlined, LaptopOutlined, NotificationOutlined, UserOutlined } from "@ant-design/icons";
import { Address, Balance, Events, Contract, SearchInput } from "../components";
import { Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import { Explore, Create } from ".";
// import * as EpnsAPI from "@epnsproject/sdk-restapi";
// import { NotificationItem, chainNameType } from "@epnsproject/sdk-uiweb";
// import { EmbedSDK } from "@epnsproject/sdk-uiembed";
// const count = 3;
// const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat,picture&noinfo`;

export default function ExampleUI({
  address,
  mainnetProvider,
  blockExplorer,
  localProvider,
  userSigner,
  contractConfig,
  name,
  localChainId,
  readContracts,
  writeContracts,
  // ...props
}) {
  const { Sider, Content } = Layout;
  const history = useHistory();
  // const [notifications, setNotifications] = useState();
  // const chainId = 42;
  // const userAddress = "0xca7632327567796e51920f6b16373e92c7823854";
  // // const userCAIP = `eip155:${localChainId}:${address}`;
  // const userCAIP = `eip155:${chainId}:${userAddress}`;

  return (
    <Layout>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            // defaultSelectedKeys={["/dashboard"]}
            style={{
              height: "100%",
              borderRight: 0,
            }}
          >
            <Menu.Item key="/dashboard">
              <Link to="/dashboard">
                <LaptopOutlined /> <span>Dashboard</span>{" "}
              </Link>
            </Menu.Item>
            <Menu.Item key="/explore">
              <Link to="/dashboard/explore">
                <SyncOutlined /> <span>Explore</span>{" "}
              </Link>
            </Menu.Item>
            <Menu.Item key="/create">
              <Link to="/dashboard/create">
                <NotificationOutlined /> <span>Broadcast</span>{" "}
              </Link>
            </Menu.Item>
            <Menu.Item key="/profile">
              <Link to="/dashboard/profile">
                <UserOutlined /> <span>Profile</span>{" "}
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout
          style={{
            padding: "0 24px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 12px 20px 12px" }}>
            <div>
              <SearchInput placeholder={"Search"} width={400} />
            </div>
            {address && (
              <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={18} />
            )}
          </div>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 500,
            }}
          >
            <Switch>
              <Route exact path="/dashboard">
                <Contract
                  name={name}
                  signer={userSigner}
                  provider={localProvider}
                  address={address}
                  blockExplorer={blockExplorer}
                  contractConfig={contractConfig}
                />
              </Route>
              <Route path="/dashboard/profile">PROFILE</Route>
              <Route path="/dashboard/explore">
                <Explore />
              </Route>
              <Route path="/dashboard/create">
                <Create />
              </Route>
            </Switch>
            {/* {props.children} */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
