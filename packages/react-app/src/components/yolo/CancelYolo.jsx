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
  const [isLoading, setIsLoading] = useState();

  const getIsEns = async () => {
    if (ensNameToCancel && ensNameToCancel.length) {
      try {
        const _isEns = await readContracts.ENSYOLO.isENS(ensNameHash);
        setIsEns(_isEns);
        console.log("test-isEns:", _isEns);
      } catch (e) {
        console.log(`error getting isEns::: ${e}`);
      }
    }
  };

  const getIsGifted = async () => {
    if (ensNameToCancel && ensNameToCancel.length) {
      try {
        const _isGifted = await readContracts.ENSYOLO.isGifted(ensNameHash);
        setIsGifted(_isGifted);
        console.log("test-IsGifted-INSIDER:", _isGifted);
      } catch (e) {
        console.log(`error getting IsGifted::: ${e}`);
      }
    }
  };

  const getIsClaimed = async () => {
    if (ensNameHash) {
      try {
        const _yoloItem = await readContracts.ENSYOLO.getGifted(ensNameHash);
        const _isClaimed = _yoloItem?.claimed;
        setIsClaimed(_isClaimed);
        console.log("test-IsClaimed=INSIDER:", _isClaimed);
      } catch (e) {
        console.log(`error getting IsClaimed::: ${e}`);
      }
    }
  };

  const setYoloItem = async () => {
    if (ensNameHash && ensNameHash.length) {
      try {
        const _yoloItem = await readContracts.ENSYOLO.getGifted(ensNameHash);
        console.log("test-YOLOITEM:", _yoloItem);

        setEnsYolo(_yoloItem);
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getIsEns();
  }, [ensNameToCancel]);

  useEffect(() => {
    getIsGifted();
    getIsClaimed();
    setYoloItem();
    setTimeout(setIsLoading(false), 3000);
  }, [ensNameToCancel, isClaimed, isEns]);

  const cancelEnsYolo = async ensNameHash => {
    try {
      setIsLoading(true);
      let txHash = await tx(writeContracts.ENSYOLO.cancelENSYolo(ensNameHash));
      await txHash.wait();
      console.log(`ENS Claimed with tx hash: ${txHash}`);
    } catch (e) {
      console.log("error cancelling ENS: ", e);
    } finally {
      setIsLoading(false);
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
        <Input
          placeholder="Enter ENS name"
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
        <div style={{ marginBottom: 15 }}></div>

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
            <div style={{ marginBottom: 20 }}></div>
          </div>
        ) : null}
        <Button
          onClick={async () => {
            let ensNameHashToCancel = getNameHashFromEnsName(ensNameToCancel);
            const txResult = await cancelEnsYolo(ensNameHashToCancel);
            console.log("ENS YOLO ", txResult);
          }}
          loading={isLoading}
          disabled={!ensNameToCancel || !isGifted || isClaimed}
        >
          {ensYolo && ensYolo.id > 0 && isGifted && !isClaimed
            ? "Cancel ENS YOLO"
            : ensYolo && ensYolo.id > 0 && isGifted && isClaimed
            ? "Claimed"
            : "Not Gifted"}
        </Button>
      </Card>
    </div>
  );
};
export default CancelYolo;
