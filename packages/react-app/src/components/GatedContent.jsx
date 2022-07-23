import { Button, Card, Col, Input, Row, DatePicker, Select, Space, TimePicker } from "antd";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import ContentPaywall from "./ContentPaywall";
import { CreateLock, UnlockVariables } from "../components";
import  {useUnlockState} from "../hooks";



/*
  ~ What it does? ~
  Displays a UI that reveals content based on whether a user is a member or not.
  ~ How can I use? ~
  <GatedContent
    address={address}
    publicLock={publicLock}
    targetNetwork={targetNetwork}
  />

  ~ Features ~
  - address={address} passes active user's address to the component to check whether they are members or not
  - publicLock={publicLock} passes the specific lock to check for the user's membership
  - targetNetwork={targetNetwork} passes the current app network to the <ContentPaywall /> to determine the network to connect to
*/


const GatedContent = ({ publicLock, price, unlock, address, targetNetwork }) => {
  const hasValidKey = useUnlockState(publicLock, address);

  const previewContent = (
    <>
      <div style={{ padding: 8, marginTop: 32, maxWidth: 592, margin: "auto" }}>
        <Card title="Preview Content">
          <div style={{ padding: 8 }}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            debitis nisi quos. Placeat quos alias harum accusantium soluta,
            fugiat error nemo, illo dicta illum labore hic aliquid aspernatur?
            <ContentPaywall
              shape={"round"}
              size={"large"}
              displayText={"Become a member to view full content"}
              targetNetwork={targetNetwork}
              publicLock={publicLock}
            />
          </div>
        </Card>
      </div>
    </>
  );

  const gatedContent = (
    <>
      <div style={{ padding: 8, marginTop: 32, maxWidth: 592, margin: "auto" }}>
          <Card title="Gated Content">
            <div style={{ padding: 8 }}>
              YOU NOW HAVE ACCESS TO THE GATED CONTENT
          </div>
          <UnlockVariables
            targetNetwork={targetNetwork}
          />
          <CreateLock
            price={price}
            unlock={unlock}
          />  
          </Card>
      </div>
    </>
  );

  return (
    <>
      <Row>
        <Col span={24}>
          { hasValidKey && hasValidKey !== false
            ? gatedContent
            : previewContent
          }
        </Col>
      </Row>
    </>
  );
};

export default GatedContent;
