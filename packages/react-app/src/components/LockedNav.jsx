import { Button, Col, Menu, Row } from "antd";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import  {useUnlockState} from "../hooks";




/*
  ~ What it does? ~
  Displays a UI that reveals content based on whether a user is a member or not.
  ~ How can I use? ~
  <LockedNav
    address={address}
    publicLock={publicLock}
    location={location}
  />

  ~ Features ~
  - address={address} passes active user's address to the component to check whether they are members or not
  - publicLock={publicLock} passes the specific lock to check for the user's membership
  - location={location} passes the current app network to the <ContentPaywall /> to determine the network to connect to
*/


const LockedNav = ({ publicLock, address, location }) => {
    // const [hasValidKey, setHasValidKey] = useState(false);
    
  const hasValidKey = useUnlockState(publicLock, address);
  
  // useEffect(() => {
  //   const isMember = async () => {
  //     if (publicLock) {
  //       const hasKey = await publicLock.getHasValidKey(address);
  //       setHasValidKey(hasKey);
  //     }
  //   }
  //   isMember();
  // }, [address, publicLock]);

  const previewNav = (
    <>
      <Menu style={{ textAlign: "center", marginTop: 20 }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">App Home</Link>
        </Menu.Item>
        <Menu.Item key="/dashboard">
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="/settings">
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    </>
  );

  const lockedNav = (
    <>
    <Menu style={{ textAlign: "center", marginTop: 20 }} selectedKeys={[location.pathname]} mode="horizontal">
      <Menu.Item key="/">
        <Link to="/">App Home</Link>
      </Menu.Item>
      <Menu.Item key="/dashboard">
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="/debug">
        <Link to="/debug">Debug Contracts</Link>
      </Menu.Item>
      <Menu.Item key="/hints">
        <Link to="/hints">Hints</Link>
      </Menu.Item>
      <Menu.Item key="/settings">
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Item key="/mainnetdai">
        <Link to="/mainnetdai">Mainnet DAI</Link>
      </Menu.Item>
      <Menu.Item key="/subgraph">
        <Link to="/subgraph">Subgraph</Link>
      </Menu.Item>
    </Menu>
    </>
  );

  return (
    <>
      <Row>
        <Col span={24}>
          { hasValidKey && hasValidKey !== false
            ? lockedNav
            : previewNav
          }
        </Col>
      </Row>
    </>
  );
};

export default LockedNav;
