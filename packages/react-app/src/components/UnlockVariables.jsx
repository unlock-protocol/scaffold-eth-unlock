import { Button, Card, Col, Input, Row } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

/*
  ~ What it does? ~
  Displays an UI to save the deployed unlock protocol contract address 
    and the specific lock address to connect with to localstorage
  ~ How can I use? ~
  <UnlockVariables
    targetNetwork={targetNetwork}
  />
  ~ Features ~
  - Receives deployed unlock address of a specific network
  - Receives publicLock address a specific lock
  - Save them to local storage
*/


const UnlockVariables = ({ targetNetwork }) => {
  const routeHistory = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [deployedUnlockAddress, setDeployedUnlockAddress] = useState();// unlock rinkeby address is set as the default
  const [publicLockAddress, setPublicLockAddress] = useState();//DreadGang presale whitelist lock on rinkeby is set as default publicLock address

  const saveToLocalStorage = () => {
    const unlockData = {
      unlockAddress: deployedUnlockAddress,
      network: targetNetwork.name,
    };
    const publicLockData = {
      publicLockAddress: publicLockAddress,
    };
    const currentUnlockData = JSON.parse(window.localStorage.getItem("unlock"));
    const currentPublicLockData = JSON.parse(window.localStorage.getItem("publicLock"));

    !currentUnlockData ||
    currentUnlockData.unlockAddress && unlockData.unlockAddress ||
    !currentUnlockData.unlockAddress && unlockData.unlockAddress 
      ? window.localStorage.setItem("unlock", JSON.stringify(unlockData))
      : window.localStorage.setItem("unlock", JSON.stringify(currentUnlockData));
     
    !currentPublicLockData ||
    currentPublicLockData.publicLockAddress && publicLockData.publicLockAddress ||
    !currentPublicLockData.publicLockAddress && publicLockData.publicLockAddress
      ? window.localStorage.setItem("publicLock", JSON.stringify(publicLockData))
      : window.localStorage.setItem("publicLock", JSON.stringify(currentPublicLockData));
  };

  const unlockVariables = (
    <>
      <div style={{ padding: 8, marginTop: 32, maxWidth: 592, margin: "auto" }}>
        <Card title="Set Unlock Variables">
          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: "left", marginBottom: 15 }}
              value={deployedUnlockAddress}
              placeholder="Enter deployed unlock address"
              onChange={e => {
                setDeployedUnlockAddress(e.target.value);
              }}
            />
            <Input
              style={{ textAlign: "left", marginBottom: 15 }}
              value={publicLockAddress}
              placeholder="Enter lock address"
              onChange={e => {
                setPublicLockAddress(e.target.value);
              }}
            />
          </div>
          <div style={{ padding: 8, marginTop: 15 }}>
            <Button
              type={"danger"}
              loading={isLoading}
              onClick={() => {
                setIsLoading(true);
                saveToLocalStorage();
                setTimeout(function () {
                  setIsLoading(false);
                  window.location.reload();
                }, 2000);
              }}
            >
              Save
            </Button>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <>
      <Row>
        <Col span={24}> {unlockVariables} </Col>
      </Row>
    </>
  );
};

export default UnlockVariables;
