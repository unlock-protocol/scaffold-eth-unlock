import { Button, Spin, Tooltip, Card, Input } from "antd";
import React, { useState, useEffect } from "react";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
const ethers = require("ethers");
/**
  ~ How can I use? ~

  <CancelYolo
    readContractr={readContract}
    writeContracts={writeContracts}
    getNameHashFromEnsName={getNameHashFromEnsName}
    getTokenIdFromEnsName={getTokenIdFromEnsName}
    tx={tx}
    maxWidth={someNumber}
    margin={"auto"}
    display={"flex"},
    flexDirection={"column"}
    alignItems={"center"}
    marginTop={someNumber}
    paddingBottom={someNumber} 
  />

**/

const CancelYolo = function ({ tx, writeContracts, readContracts, getNameHashFromEnsName, ...props }) {
  const [ensNameHash, setEnsNameHash] = useState();
  const [ensYolo, setEnsYolo] = useState({});
  const [isClaimed, setIsClaimed] = useState();
  const [isGifted, setIsGifted] = useState();
  const [isEns, setIsEns] = useState();
  const [ensNameToCancel, setEnsNameToCancel] = useState();

  useEffect(() => {
    const getEnsYoloStatus = async () => {
      if (ensNameToCancel && ensNameHash.length) {
        try {
          const _isEns = await readContracts.ENSYOLO.isENS(ensNameHash);
          const _isGifted = await readContracts.ENSYOLO.isGifted(ensNameHash);
          const _isClaimed = await readContracts.ENSYOLO.getGifted(ensNameHash).claimed;
          const _giftedEns = await readContracts.ENSYOLO.getGifted(ensNameHash);
          setIsEns(_isEns);
          setIsGifted(_isGifted);
          setIsClaimed(_isClaimed);
          setEnsYolo(_giftedEns);
        } catch (e) {
          console.log(e);
        }
      }
    };
    getEnsYoloStatus();
  }, [ensNameToCancel, ensNameHash]);

  const cancelEnsYolo = async ensNameHash => {
    try {
      let txHash = await tx(writeContracts.ENSYOLO.cancelENSYolo(ensNameHash));
      console.log(`ENS Claimed with tx hash: ${txHash}`);
    } catch (e) {
      console.log("error cancelling ENS: ", e);
    }
  };

  return (
    <div
      style={{
        maxWidth: props.maxWidth,
        margin: props.margin,
        display: props.display,
        alignItems: props.alignItems,
        flexDirection: props.flexDirection,
        marginTop: props.marginTop,
        paddingBottom: props.paddingBottom,
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: "100%",
        }}
      >
        <p>Input ENS name</p>
        <Input
          placeholder="Enter ENS"
          value={ensNameToCancel}
          size="large"
          prefix={<UserOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="ENS name to cancel">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            let val = e.target.value;
            let _nameHash = getNameHashFromEnsName(val);
            setEnsNameHash(_nameHash);
            setEnsNameToCancel(val);
          }}
        />
        {isEns && ensYolo && ensYolo.length ? (
          <div>
            <ul className="ens-yolo-info">
              <li>
                Id: <span>{ensYolo.length ? ensYolo[0].toNumber() : null}</span>
              </li>
              <li>
                {!isClaimed ? "Creator:" : "Controller"}
                <span>{ensYolo[2]}</span>
              </li>
              <li>
                Value: <span>{ethers.utils.formatEther(ensYolo[3])} ETH</span>
              </li>
              <li>
                Claimed: <span>{ensYolo[4] === false ? "False" : "True"}</span>{" "}
              </li>
              <li>
                Lock: <span>{ensYolo[5]}</span>
              </li>
            </ul>
          </div>
        ) : null}
        <Button
          onClick={async () => {
            let ensNameHashToCancel = getNameHashFromEnsName(ensNameToCancel);
            const txResult = await cancelEnsYolo(ensNameHashToCancel);
            console.log("ENS YOLO ", txResult);
          }}
          disabled={ensNameToCancel && !isGifted}
        >
          Cancel ENS YOLO
        </Button>
      </Card>
    </div>
  );
};
export default CancelYolo;
