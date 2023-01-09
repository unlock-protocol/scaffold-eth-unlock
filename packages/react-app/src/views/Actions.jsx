import { Button, Radio, Input, Select, List, Spin, Card, Tooltip } from "antd";
import { TwitterOutlined, InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useContractReader } from "eth-hooks";

const ethers = require("ethers");

function Actions({ readContracts, writeContracts, tx, address, getNameHashFromEnsName, claimEns }) {
  const [isClaimed, setIsClaimed] = useState();
  const [isGifted, setIsGifted] = useState();
  const [isEns, setIsEns] = useState();
  const [ensName, setEnsName] = useState();
  const [ensYolo, setEnsYolo] = useState({});
  const [ensNameHash, setEnsNameHash] = useState();
  const [toTokenId, setToTokenId] = useState();

  const _isEns = async () => {
    let _yes = await readContracts.ENSYOLO.isENS(ensNameHash);
    return _yes;
  };

  const _isGifted = async () => {
    let _yes = await readContracts.ENSYOLO.isGifted(ensNameHash);
    return _yes;
  };

  const _isClaimed = async () => {
    let _yes = await readContracts.ENSYOLO.getGifted(ensNameHash).claimed;
    return _yes;
  };
  useEffect(() => {
    let nameHash = getNameHashFromEnsName(ensName);
    setEnsNameHash(nameHash);
  }, [ensName]);

  return (
    <div
      style={{
        maxWidth: 1250,
        margin: "auto",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        marginTop: 32,
        paddingBottom: 256,
      }}
    >
      <h1>CLAIM ENS</h1>
      <Card
        style={{
          maxWidth: 500,
          width: "100%",
        }}
      >
        <p>Input ENS name</p>
        <Input
          placeholder="Enter ENS"
          // value={ensNameToCancel}
          prefix={<UserOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="ENS name to cancel">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            let val = e.target.value;
            // setEnsNameToCancel(val);
          }}
        />
        <div>
          <ul className="ens-yolo-info">
            {/* <span>{ensYolo.id}</span> */}
            <li>
              Id: <span>{ensYolo.id} 1</span>
            </li>
            {/* <span>{ensYolo.controller}</span> */}
            <li>
              {!isClaimed ? "Creator:" : "Controller"}
              <span>{ensYolo.value} dannithomx.eth</span>
            </li>
            {/* <span>{ensYolo.value}</span> */}
            <li>
              Value: <span>{ensYolo.value} 0.01 ETH</span>
            </li>
            {/* <span>{ensYolo.claimed}</span> */}
            <li>
              Claimed: <span>{ensYolo.claimed} False</span>{" "}
            </li>
            {/* <span>{ensYolo.lock}</span> */}
            <li>
              Lock: <span>{ensYolo.lock} 0xc2eb...f5d8</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={async () => {
            // let ensNameHashToCancel = getNameHashFromEnsName(ensNameToCancel);
            // const txResult = await cancelEnsYolo(ensNameHashToCancel);
            // console.log("ENS YOLO ", txResult);
          }}
        >
          Claim ENS
        </Button>
      </Card>
    </div>
  );
}

export default Actions;
