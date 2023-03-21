import { Button, Spin, Tooltip, Card, Input } from "antd";
import React, { useState, useEffect } from "react";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { AddressInput } from "../";
const ethers = require("ethers");

/**
  ~ How can I use? ~

  <YoloEns
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

const YoloEns = function ({
  mainnetProvider,
  readContracts,
  tx,
  writeContracts,
  getTokenIdFromEnsName,
  getNameHashFromEnsName,
  ensRegistryContract,
  baseRegistrarContract,
  ...props
}) {
  const [isRegistrarApproved, setIsRegistrarApproved] = useState();
  const [isRegistryApproved, setIsRegistryApproved] = useState();
  const [ensName, setEnsName] = useState(null);
  const [ensNameHash, setEnsNameHash] = useState();
  const [tokenId, setTokenId] = useState();
  const [lockAddress, setLockAddress] = useState();
  const [amount, setAmount] = useState();
  const [isLoading, setIsLoading] = useState();
  const [ensYoloAddress, setEnsYoloAddress] = useState();
  const utils = ethers.utils;

  useEffect(() => {
    try {
      const _ensYoloAddress = readContracts.ENSYOLO.address;
      setEnsYoloAddress(_ensYoloAddress);
    } catch (e) {
      console.log(e);
    }
  }, [readContracts]);
  
  useEffect(() => {
    const getApprovalForAll = async () => {
      if (tokenId && tokenId !== 0) {
        setIsLoading(true);
        try {
          const owner = await baseRegistrarContract.ownerOf(tokenId);
          console.log("test-owner:", owner);
          let registrarApproved = await baseRegistrarContract.isApprovedForAll(owner, ensYoloAddress);
          let registryApproved = await ensRegistryContract.isApprovedForAll(owner, ensYoloAddress);
          setIsRegistrarApproved(registrarApproved);
          setIsRegistryApproved(registryApproved);
          setIsLoading(false);
        } catch (e) {
          console.log("error checking approval ", e);
        }
      } else {
        setIsLoading(true);
      }
    };
    getApprovalForAll();
  }, [ensName, tokenId, baseRegistrarContract, ensRegistryContract, readContracts]);

  const approveForAll = async (_operatorAddr, _approved) => {
    try {
      let registrarTxHash;
      let registryTxHash;
      if (!isRegistrarApproved) {
        registrarTxHash = await tx(baseRegistrarContract.setApprovalForAll(_operatorAddr, _approved));
        console.log(`Approved on BaseRegistrar with tx hash: ${registrarTxHash}`);
        setIsRegistrarApproved(_approved);
      }

      if (!isRegistryApproved) {
        registryTxHash = await tx(ensRegistryContract.setApprovalForAll(_operatorAddr, _approved));
        console.log(`Approved on ENSRegistry with tx hash: ${registryTxHash}`);
        setIsRegistryApproved(_approved);
      }
    } catch (e) {
      console.log("error approving ENSYOLO: ", e);
    }
  };

  const yoloEns = async () => {
    try {
      let txHash = await tx(
        writeContracts.ENSYOLO.giftENS(ensNameHash, tokenId, lockAddress, {
          value: utils.parseEther(amount.toString()),
        }),
      );
      console.log(`ENS YOLO tx hash: ${txHash}`);
    } catch (e) {
      console.log("error gifting ENS: ", e);
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
          value={ensName ? ensName : ""}
          prefix={<UserOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="ENS name to gift">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            let val = e.target.value;
            let _tokenId = getTokenIdFromEnsName(val);
            let _ensNamehash = getNameHashFromEnsName(val);
            setEnsName(val);
            setTokenId(_tokenId);
            setEnsNameHash(_ensNamehash);
          }}
        />
        <p>Input YOLO ETH amount</p>
        <Input
          type="number"
          placeholder="ETH amount"
          value={amount ? amount : null}
          suffix={
            <Tooltip title="ETH amount to gift (min: 0.01)">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            let val = e.target.value;
            setAmount(val);
          }}
        />
        <p>Input lock address</p>
        <AddressInput
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="Enter lock address"
          value={lockAddress ? lockAddress : ""}
          suffix={
            <Tooltip title="Only users with a key to this lock can claim this">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={setLockAddress}
        />
        <div style={{ marginBottom: 10 }}></div>
        {ensName && (!isRegistrarApproved || !isRegistryApproved) ? (
          <Button
            onClick={async () => {
              let tx = await approveForAll(ensYoloAddress, true);
              console.log("approveForAll txn: ", tx);
            }}
            loading={isLoading}
          >
            Approve
          </Button>
        ) : isRegistrarApproved && isRegistryApproved && ensName ? (
          <Button
            onClick={async () => {
              const txResult = await yoloEns()
              console.log("YOLO Tnx", txResult);
            }}
          >
            YOLO ENS
          </Button>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spin />
          </div>
        )}
      </Card>
    </div>
  );
};
export default YoloEns;
