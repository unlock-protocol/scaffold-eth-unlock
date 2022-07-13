import { Button, Card, Col, Input, Row, DatePicker, Select, Space, TimePicker } from "antd";
import { EtherInput } from "./";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
const ethers = require("ethers");

/*
  ~ TODO ::: What it does? ~
  Displays an UI to deploy a lock using unlock protocol
  ~ How can I use? ~
  <CreateLock
    autoFocus
    ensProvider={mainnetProvider}
    placeholder="Enter address"
    value={toAddress}
    onChange={setToAddress}
  />
  ~ TODO::: Features ~
  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth") or you can enter directly ENS name instead of address
  - Provide placeholder="Enter address" value for the input
  - Value of the address input is stored in value={toAddress}
  - Control input change by onChange={setToAddress}
                          or onChange={address => { setToAddress(address);}}
*/


const CreateLock = ({ price, unlock }) => {
  const routeHistory = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [expirationDuration, setExpirationDuration] = useState({});
  const [tokenAddress, setTokenAddress] = useState();
  const [keyPrice, setKeyPrice] = useState();
  const [maxNumberOfKeys, setMaxNumberOfKeys] = useState();
  const [lockName, setLockName] = useState();
  const [lockTxHash, setLockTxHash] = useState();
  const [newLockAddress, setNewLockAddress] = useState();


    
//     ```solidity
// function createLock(
    // uint256 _expirationDuration,
    // address _tokenAddress,
    // uint256 _keyPrice,
    // uint256 _maxNumberOfKeys,
    // string _lockName,
    // bytes12
    // ) external nonpayable returns(address)



  const createLock = (
    <>
      <div style={{ padding: 8, marginTop: 32, maxWidth: 592, margin: "auto" }}>
        <Card title="Deploy new lock">
          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: "left", marginBottom: 15 }}
              placeholder={"Lock name"}
              value={lockName}
              onChange={e => {
                const newValue = e.target.value;
                setLockName(newValue);
              }}
            />
            <Input
              style={{ textAlign: "left", marginBottom: 15 }}
              placeholder={"Token address"}
              value={tokenAddress}
              onChange={e => {
                const newValue = e.target.value;
                setTokenAddress(newValue);
              }}
            />
            <Input
              style={{ textAlign: "left", marginBottom: 15 }}
              placeholder={"Max number of keys"}
              value={maxNumberOfKeys}
              onChange={e => {
                const newValue = parseInt(e.target.value);
                console.log("Max key ", newValue);
                setMaxNumberOfKeys(newValue);
              }}
            />
            <EtherInput
              autofocus
              price={price}
              value={keyPrice}
              placeholder="Enter key price"
              onChange={value => {
                const newValue = ethers.utils.parseEther(value);
                setKeyPrice(newValue);
              }}
            />
            {/* <Input
              style={{ textAlign: "left" }}
              placeholder={"Expiration duration"}
              value={expirationDuration}
              onChange={e => {
                const newValue = e.target.value;
                setExpirationDuration(newValue);
                  }}
                  
              /> */}
            <div style={{ textAlign: "left", marginTop: 15 }}>
              <input
                type="date"
                onChange={e => {
                  const newValue = e.target.value;
                  const timeStamp = new Date(newValue).getTime();
                  setExpirationDuration(timeStamp);
                }}
              />
            </div>
          </div>
          <div style={{ padding: 8 }}>
            <Button
              type={"danger"}
              loading={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                    const result = await unlock.createLock(
                        expirationDuration,
                        tokenAddress,
                        keyPrice,
                        maxNumberOfKeys,
                        lockName,
                        '0x000000000000000000000000' //SALT
                    );
                    const tx = await result.wait();
                    const event = tx.events;
                    const newLockAddress = event[6].args[1];
                    setLockTxHash(result.hash);
                    setNewLockAddress(newLockAddress);
                } catch (e) {
                  console.log(e);
                }
                setTimeout(setIsLoading(false), 3000);
              }}
              disabled={isLoading}
          >
              Create Lock
            </Button>
          </div>
          <div style={{ textAlign: "left" }}>
            {lockTxHash ? <p>Transaction Hash: {lockTxHash}</p> : ""}
            {lockTxHash && newLockAddress ? <p>New Lock Address: {newLockAddress}</p> : ""}
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <>
      <Row>
        <Col span={24}> {createLock} </Col>
      </Row>
    </>
  );
};

export default CreateLock;
