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
  const [ensYoloItem, setEnsYoloItem] = useState({});
  const [ensNameHash, setEnsNameHash] = useState();
  const [tokenId, setTokenId] = useState();
  const [isLoading, setIsLoading] = useState();

  const setNamehashAndTokenId = () => {
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
  };

  const getIsEns = async () => {
    if (ensName && ensName.length) {
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
    if (ensName && ensName.length) {
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

        setEnsYoloItem(_yoloItem);
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    setIsLoading(true)
    setNamehashAndTokenId();
    getIsEns();
  }, [ensName]);
  
  useEffect(() => {
    getIsGifted();
    getIsClaimed();
    setYoloItem();
    setTimeout(setIsLoading(false), 3000);
  }, [ensName, isClaimed, isEns]);

  // useEffect(() => {
  //   const setNamehashAndTokenId = () => {
  //     try {
  //       // setIsLoading(true)
  //       if (ensName && ensName.length) {
  //         let nameHash = getNameHashFromEnsName(ensName);
  //         let _tokenId = getTokenIdFromEnsName(ensName);
  //         setEnsNameHash(nameHash);
  //         setTokenId(_tokenId);
  //       }
  //       // setIsLoading(false);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   setNamehashAndTokenId();
  // }, [ensName]);

  // useEffect(() => {
  //   const getIsEns = async () => {
  //     if (ensName && ensName.length) {
  //       try {
  //         const _isEns = await readContracts.ENSYOLO.isENS(ensNameHash);
  //         setIsEns(_isEns);
  //         console.log("test-isEns:", _isEns);
  //       } catch (e) {
  //         console.log(`error getting isEns::: ${e}`);
  //       }
  //     }
  //   };
  //   getIsEns();
  // }, [ensName, ensNameHash, readContracts.ENSYOLO]);

  // useEffect(() => {
  //   const getIsGifted = async () => {
  //     if (ensName && ensName.length) {
  //       try {
  //         const _isGifted = await readContracts.ENSYOLO.isGifted(ensNameHash);
  //         setIsGifted(_isGifted);
  //         console.log("test-IsGifted-INSIDER:", _isGifted);
  //       } catch (e) {
  //         console.log(`error getting IsGifted::: ${e}`);
  //       }
  //     }
  //   };
  //   getIsGifted();
  // }, [ensName, ensNameHash, readContracts.ENSYOLO]);

  // useEffect(() => {
  //   const getIsClaimed = async () => {
  //     if (ensNameHash) {
  //       try {
  //         const _yoloItem = await readContracts.ENSYOLO.getGifted(ensNameHash);
  //         const _isClaimed = _yoloItem?.claimed;
  //         // _yoloItem ? setIsClaimed(_isClaimed) : setIsClaimed(false);
  //         setIsClaimed(_isClaimed);
  //         console.log("test-IsClaimed=INSIDER:", _isClaimed);
  //       } catch (e) {
  //         console.log(`error getting IsClaimed::: ${e}`);
  //       }
  //     }
  //   };
  //   getIsClaimed();
  // }, [ensName, ensNameHash, readContracts.ENSYOLO]);

  // useEffect(() => {
  //   const setYoloItem = async () => {
  //     if (ensNameHash && ensNameHash.length) {
  //       try {
  //         const _yoloItem = await readContracts.ENSYOLO.getGifted(ensNameHash);
  //         console.log("test-YOLOITEM:", _yoloItem);

  //         setEnsYoloItem(_yoloItem);
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     }
  //   };
  //   setYoloItem();
  // }, [ensName, ensNameHash, readContracts.ENSYOLO]);

  const claimEns = async (_nameHash, _tokenId) => {
    try {
      setIsLoading(true);
      let txnResult = await tx(writeContracts.ENSYOLO.claimItem(_nameHash, _tokenId));
      await txnResult.wait();
      setIsLoading(false);
      return txnResult;
    } catch (e) {
      console.log(e);
    }
  };
  console.log("test-IsClaimed:", isClaimed);

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
        {/* <p>Input ENS name</p> */}
        <Input
          placeholder="Enter ENS name"
          value={ensName}
          size="large"
          prefix={<UserOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="ENS name to claim">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            setIsLoading(true);
            let val = e.target.value;
            let _nameHash = getNameHashFromEnsName(val);
            setEnsName(val);
            setEnsNameHash(_nameHash);
          }}
        />
        <div style={{ marginBottom: 15 }}></div>

        {isEns && isGifted && ensYoloItem && ensYoloItem.length ? (
          <div>
            <ul className="ens-yolo-info">
              <li>
                Id: <span>{ensYoloItem.length ? ensYoloItem[0].toNumber() : null}</span>
              </li>
              <li>
                {!isClaimed ? "Creator:" : "Controller"}
                <span>{ensYoloItem[2]}</span>
              </li>
              <li>
                Value: <span>{ethers.utils.formatEther(ensYoloItem[3])} ETH</span>
              </li>
              <li>
                Claimed: <span>{ensYoloItem[4] === false ? "False" : "True"}</span>{" "}
              </li>
              <li>
                Lock: <span>{ensYoloItem[5]}</span>
              </li>
            </ul>
            <div style={{ marginBottom: 20 }}></div>
          </div>
        ) : null}

        <Button
          loading={isLoading}
          onClick={async () => {
            const txResult = await claimEns(ensNameHash, tokenId);
            console.log("ENS YOLO ", txResult);
          }}
          disabled={!isGifted || isClaimed}
        >
          {ensYoloItem && ensYoloItem.id > 0 && isGifted && !isClaimed
            ? "Claim ENS"
            : ensYoloItem && isGifted && isClaimed
            ? "Claimed"
            : "Not gifted"}
        </Button>
      </Card>
    </div>
  );
};
export default ClaimEns;
