import React, { useState, useEffect } from "react";
import { Layout, Menu } from "antd";
// import { utils } from "ethers";
import { SyncOutlined, LaptopOutlined, NotificationOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Address, Balance, Events, Contract, SearchInput } from "../components";
import { Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import { Explore, Create, Subgraph } from ".";
import { read } from "fs";
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
  localChainId,
  userSigner,
  contractConfig,
  name,
  readContracts,
  writeContracts,
  targetNetwork,
  tx,
  ...props
}) {
  const { Sider, Content } = Layout;
  const history = useHistory();
  // const [notifications, setNotifications] = useState();
  // const chainId = 42;
  // const userAddress = "0xca7632327567796e51920f6b16373e92c7823854";
  // // const userCAIP = `eip155:${localChainId}:${address}`;
  // const userCAIP = `eip155:${chainId}:${userAddress}`;
  // useEffect(() => {
  //   const test = async () => {
  //     if (readContracts && readContracts.MembersHub) {
  //       let tags = await readContracts.MembersHub.getTags();
  //       console.log("yyyyy", tags);
  //     }
  //   };
  //   test();
  // }, [readContracts]);

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
            <Menu.Item key="/debug">
              <Link to="/dashboard/debug">
                <SettingOutlined /> <span>Debug</span>{" "}
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout
          style={{
            padding: "0 24px 24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "20px 12px 20px 12px" }}>
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
                {/* <Contract
                  name={name}
                  signer={userSigner}
                  provider={localProvider}
                  address={address}
                  blockExplorer={blockExplorer}
                  contractConfig={contractConfig}
                /> */}
              </Route>
              <Route path="/dashboard/profile">
                <div style={{ textAlign: "center" }}>
                  <Subgraph tx={tx} writeContracts={writeContracts} mainnetProvider={mainnetProvider} />
                </div>
              </Route>
              <Route path="/dashboard/explore">
                <Explore userSigner={userSigner} address={address} targetNetwork={targetNetwork} />
              </Route>
              <Route path="/dashboard/create">
                <Create writeContracts={writeContracts} userSigner={userSigner} />
              </Route>
              <Route path="/dashboard/debug">
                <div style={{ textAlign: "center" }}>
                  <Contract
                    name={name}
                    chainId={localChainId}
                    signer={userSigner}
                    provider={localProvider}
                    address={address}
                    blockExplorer={blockExplorer}
                    contractConfig={contractConfig}
                  />
                </div>
              </Route>
            </Switch>
            {/* {props.children} */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
