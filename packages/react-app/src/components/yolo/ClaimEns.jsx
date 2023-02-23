import { Button, Spin, Tooltip, Card, Input } from "antd";
import React, { useState, useEffect } from "react";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
const ethers = require("ethers");

/**
  ~ How can I use? ~

  <ClaimEns
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

const ClaimEns = function ({
  readContracts,
  writeContracts,
  tx,
  getNameHashFromEnsName,
  getTokenIdFromEnsName,
  ...props
}) {
  const [isClaimed, setIsClaimed] = useState();
  const [isGifted, setIsGifted] = useState();
  const [isEns, setIsEns] = useState();
  const [ensName, setEnsName] = useState();
  const [ensYolo, setEnsYolo] = useState({});
  const [ensNameHash, setEnsNameHash] = useState();
  const [tokenId, setTokenId] = useState();

  useEffect(() => {
    try {
      if (ensName && ensName.length) {
        let nameHash = getNameHashFromEnsName(ensName);
        let _tokenId = getTokenIdFromEnsName(ensName);
        setEnsNameHash(nameHash);
        setTokenId(_tokenId);
      }
    } catch (e) {
      console.log(e);
    }
  }, [ensName]);

  useEffect(() => {
    const getEnsYoloStatus = async () => {
      if (ensNameHash && ensNameHash.length) {
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
  }, [ensName, ensNameHash]);

  const claimEns = async (_nameHash, _tokenId) => {
    try {
      let txnResult = await tx(writeContracts.ENSYOLO.claimItem(_nameHash, _tokenId));
      return txnResult;
    } catch (e) {
      console.log(e);
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
          value={ensName}
          prefix={<UserOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="ENS name to claim">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            let val = e.target.value;
            let _nameHash = getNameHashFromEnsName(val);
            setEnsName(val);
            setEnsNameHash(_nameHash);
          }}
        />
        {isEns && isGifted && ensYolo && ensYolo.length ? (
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
            const txResult = await claimEns(ensNameHash, tokenId);
            console.log("ENS YOLO ", txResult);
          }}
          disabled={!isGifted || isClaimed}
        >
          {!isClaimed ? "Claim ENS" : !isGifted ? "Not gifted" : "Claimed"}
        </Button>
      </Card>
    </div>
  );
};
export default ClaimEns;
