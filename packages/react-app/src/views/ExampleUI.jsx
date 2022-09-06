// import { Layout } from 'antd';
// import { SyncOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { utils } from "ethers";
import { SyncOutlined, LaptopOutlined, NotificationOutlined, UserOutlined, ProfileOutlined } from "@ant-design/icons";
import { Address, Balance, Events } from "../components";

export default function ExampleUI({
  address,
  mainnetProvider,
  blockExplorer,
  localProvider,
  userSigner,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  // const [newPurpose, setNewPurpose] = useState("loading...");
  const { Header, Footer, Sider, Content } = Layout;

  // const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
  //   const key = String(index + 1);
  //   return {
  //     key: `sub${key}`,
  //     icon: React.createElement(icon),
  //     label: `subnav ${key}`,
  //   };
  // });

  const links = [
    {
      icon: NotificationOutlined,
      label: "Dashboard",
      route: "/dashboard",
    },
    {
      icon: UserOutlined,
      label: "Profile",
      route: "/profile",
    },
    {
      icon: SyncOutlined,
      label: "Explore",
      route: "/explore",
    },
    {
      icon: LaptopOutlined,
      label: "Broadcast",
      route: "/create",
    },
  ].map((link, index) => {
    const key = String(index + 1);
    return {
      key: key,
      icon: React.createElement(link.icon),
      label: link.label,
    };
  });

  return (
    <Layout>
      {/* <Header>Header</Header> */}
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={links}
          />
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
          {/* <Breadcrumb
            style={{
              margin: '16px 0',
            }}
          >
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb> */}
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 500,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
      {/* <Footer>Footer</Footer> */}
    </Layout>
  );
}
