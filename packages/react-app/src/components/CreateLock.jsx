import { Select, Button, Card, Col, Input, Row, DatePicker, Checkbox, Skeleton, Typography } from "antd";
import { EtherInput } from "./";
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { apolloClient, tagQuery } from "../helpers/graphQueryData";
import { gql } from "@apollo/client";
import { CaretLeftOutlined } from "@ant-design/icons";

const ethers = require("ethers");
const { Text } = Typography;
const { Option } = Select;
const children = [];
/*
  ~ What it does? ~
  Displays an UI to deploy a lock using unlock protocol
  ~ How can I use? ~
  <CreateLock
    price={price}
    unlock={unlock}
  />
*/
async function getTagsList() {
  const { data } = await apolloClient.query({
    query: gql(tagQuery),
  });
  data.tags.map(tag => children.push(<Option key={tag.id}>{tag.id}</Option>));
  // setMemberships(data.memberships);
}
getTagsList();

const CreateLock = ({ price, unlock, writeContracts, goBack }) => {
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
  const [selectedTags, setSelectedTags] = useState();

  const zeroAddress = "0x0000000000000000000000000000000000000000";

  const toggleUseETH = () => {
    setUseETH(!useETH);
  };
  const toggleUseUnlimitedDate = () => {
    setUseUnlimitedDate(!useUnlimitedDate);
  };
  useEffect(() => {
    console.log("selected tags", selectedTags);
  }, [selectedTags]);

  const createLock = (
    <>
      <div style={{ padding: 8, marginTop: 32, maxWidth: 592, margin: "auto" }}>
        <Button onClick={goBack} style={{ position: "relative", top: -10 }}>
          <CaretLeftOutlined />
          Back
        </Button>
        <Card headStyle={{ textAlign: "center" }} title="Deploy a new lock for for your membership">
          <div style={{ padding: 8 }}>
            <Input
              style={{ textAlign: "left", marginBottom: 15 }}
              placeholder={"Enter a name"}
              value={lockName}
              onChange={e => {
                const newValue = e.target.value;
                setLockName(newValue);
              }}
            />
            <div style={{ textAlign: "left", marginBottom: 15 }}>
              <Input
                style={{ marginBottom: 3 }}
                placeholder={"Key purchase token address"}
                value={tokenAddress}
                disabled={useETH}
                onChange={e => {
                  const newValue = e.target.value;
                  setTokenAddress(newValue);
                }}
              />
              <Checkbox
                onChange={e => {
                  let value = e.target.checked;
                  toggleUseETH();
                  value ? setTokenAddress(zeroAddress) : setTokenAddress("");
                }}
              >
                Or use ETH
              </Checkbox>
            </div>
            <EtherInput
              autofocus
              price={price}
              value={keyPrice}
              placeholder="Enter key price (0 if free)"
              onChange={value => {
                const newValue = ethers.utils.parseEther(value);
                setKeyPrice(newValue);
              }}
            />

            <Input
              style={{ textAlign: "left", marginTop: 15 }}
              placeholder={"Max number of keys"}
              value={!maxNumberOfKeys && !maxNumberOfKeys ? 0 : maxNumberOfKeys}
              onChange={e => {
                const newValue = parseInt(e.target.value);
                console.log("Max key ", newValue);
                setMaxNumberOfKeys(newValue);
              }}
            />
            <div style={{ textAlign: "left", marginTop: 15 }}>
              <DatePicker
                placeholder="Key expiration duration"
                style={{ marginBottom: 3, display: "block" }}
                disabled={useUnlimitedDate}
                onChange={value => {
                  let chosenDate = moment(value).valueOf();
                  let startDate = moment().startOf("day").valueOf();
                  let expDate = chosenDate - startDate;
                  let expDateInSec = expDate / 1000;
                  setExpirationDuration(Math.round(expDateInSec));
                }}
              />
              <Checkbox
                onChange={e => {
                  let value = e.target.checked;
                  toggleUseUnlimitedDate();
                  value ? setExpirationDuration(0) : setExpirationDuration(false);
                }}
              >
                Unlimited expiry
              </Checkbox>
            </div>
            <Select
              status={selectedTags && selectedTags.length < 1 ? "error" : "success"}
              mode="multiple"
              allowClear
              style={{
                width: "100%",
                marginTop: 15,
              }}
              placeholder="Select related tags (Max 5)"
              onChange={value => {
                setSelectedTags(value);
              }}
            >
              {children}
            </Select>
          </div>

          <div style={{ padding: 8, textAlign: "center", marginTop: 25 }}>
            <Button
              block
              shape="round"
              type="primary"
              size="large"
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
                    "0x000000000000000000000000", //SALT
                  );
                  const tx = await result.wait();
                  const event = tx.events;
                  console.log("deploy lock events", event);
                  const newLockAddress = event[0].address;
                  if (newLockAddress) {
                    const broadcastTx = await writeContracts.MembersHub.broadcastMembership(
                      selectedTags,
                      newLockAddress,
                    );
                    console.log("broadcast txn", broadcastTx);
                  }
                  setLockTxHash(result.hash);
                  setNewLockAddress(newLockAddress);
                } catch (e) {
                  console.log(e);
                }
                setTimeout(setIsLoading(false), 3000);
              }}
              disabled={isLoading}
            >
              Broadcast membership
            </Button>
          </div>
          <div style={{ textAlign: "left", marginTop: 20 }}>
            {lockTxHash ? <Text copyable={{ text: lockTxHash }}>Transaction Hash: {lockTxHash}</Text> : ""}
            {lockTxHash && newLockAddress ? (
              <Text copyable={{ text: newLockAddress }}>New Lock Address: {newLockAddress}</Text>
            ) : (
              ""
            )}
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
