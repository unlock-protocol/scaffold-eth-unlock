import { Button, Card, Col, Input, Row, DatePicker, Checkbox, Space, TimePicker } from "antd";
import { EtherInput } from "./";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import moment from 'moment';
import { BlockOutlined } from "@ant-design/icons";
const ethers = require("ethers");

/*
  ~ What it does? ~
  Displays an UI to deploy a lock using unlock protocol
  ~ How can I use? ~
  <CreateLock
    price={price}
    unlock={unlock}
  />
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
  const [useETH, setUseETH] = useState(false);
  const [useUnlimitedDate, setUseUnlimitedDate] = useState(false);
  
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const toggleUseETH = () => {
    setUseETH(!useETH);
  };
  const toggleUseUnlimitedDate = () => {
    setUseUnlimitedDate(!useUnlimitedDate);
  };
 
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
            <div style={{ textAlign: "left", marginBottom: 15 }}>
              <Input
                style={{ marginBottom: 3 }}
                placeholder={"Token address"}
                value={tokenAddress}
                disabled={useETH}
                onChange={e => {
                  const newValue = e.target.value;
                  setTokenAddress(newValue);
                }}
              />
              <Checkbox onChange={e => {
                let value = e.target.checked;
                toggleUseETH();
                value ?
                  setTokenAddress(zeroAddress)
                  : setTokenAddress("");
              }}>Or use ETH</Checkbox>
            </div>

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
            <div style={{ textAlign: "left", marginTop: 15 }}>
              <DatePicker
                placeholder="Expiration duration"
                style={{ marginBottom: 3, display: "block" }}
                disabled={useUnlimitedDate}
                onChange={value => {
                  let chosenDate = moment(value).valueOf();
                  let startDate = moment().startOf('day').valueOf();
                  let expDate = chosenDate - startDate;
                  let expDateInSec = expDate / 1000;
                  setExpirationDuration(Math.round(expDateInSec));
                }}
              />
              <Checkbox onChange={e => {
                let value = e.target.checked;
                toggleUseUnlimitedDate();
                value ?
                  setExpirationDuration(0)
                  : setExpirationDuration(false);
              }}>Unlimited expiry</Checkbox>
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
