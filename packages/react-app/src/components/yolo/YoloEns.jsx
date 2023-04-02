import { Button, Spin, Tooltip, Card, Input } from "antd";
import React, { useState, useEffect } from "react";
import { InfoCircleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
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
  address,
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
  const [isOwner, setIsOwner] = useState(null);
  const [ensOwner, setEnsOwner] = useState();
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
    const getOwner = async () => {
      try {
        const owner = await baseRegistrarContract.ownerOf(tokenId);
        setEnsOwner(owner);
        if (owner === address) setIsOwner(true);
        console.log("test-owner:", owner);
      } catch (e) {
        console.log(`error setting ens owner::: ${e}`);
      }
    };
    getOwner();
  }, [address, tokenId, baseRegistrarContract]);

  useEffect(() => {
    const getApprovalForAll = async () => {
      if (ensOwner && tokenId && tokenId !== 0) {
        setIsLoading(true);
        try {
          if (address === ensOwner) {
            console.log("test-owner-true-INSIDER:", ensOwner === address);
            let registrarApproved = await baseRegistrarContract.isApprovedForAll(ensOwner, ensYoloAddress);
            let registryApproved = await ensRegistryContract.isApprovedForAll(ensOwner, ensYoloAddress);
            setIsRegistrarApproved(registrarApproved);
            setIsRegistryApproved(registryApproved);
          } else {
            setIsOwner(false);
            setIsRegistrarApproved(false);
            setIsRegistryApproved(false);
          }
          setIsLoading(false);
        } catch (e) {
          console.log("error checking approval:::", e);
        }
      } else {
        setIsLoading(true);
      }
    };
    getApprovalForAll();
  }, [ensName, ensOwner, tokenId, baseRegistrarContract, ensRegistryContract, readContracts, isOwner, ensYoloAddress]);

  console.log("test", baseRegistrarContract);
  console.log("test-Registry", isRegistrarApproved);
  console.log("test-Registrar", isRegistryApproved);
  console.log("test-isOwner", isOwner);
  console.log("test-isloading", isLoading);
  console.log("test-owner:", ensOwner);
  console.log("test-owner-true:", ensOwner === address);
  console.log("test-address:", address);

  const approveForAll = async (_operatorAddr, _approved) => {
    try {
      let registrarTxHash;
      let registryTxHash;
      setIsLoading(true);

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
      setIsLoading(false);
      console.log("error approving ENSYOLO:::", e.code);
    } finally {
      setIsLoading(false);
    }
  };

  const yoloEns = async () => {
    try {
      setIsLoading(true);
      let txHash = await tx(
        writeContracts.ENSYOLO.giftENS(ensNameHash, tokenId, lockAddress, {
          value: utils.parseEther(amount.toString()),
        }),
      );
      await txHash.wait();
      console.log(`ENS YOLO tx hash: ${txHash}`);
    } catch (e) {
      console.log("error gifting ENS:::", e);
      // if (e.code === "ERR_TX_REJECTED") {
      //   setIsLoading(false);
      //   console.log("Transaction declined by user");
      // } else {
      //   console.error(e);
      // }

      // // console.log("error gifting ENS: ", e.code);
      // // setIsLoading(false);
    } finally {
      setIsLoading(false)
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
          value={ensName ? ensName : ""}
          size="large"
          prefix={<UserOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="ENS name to gift">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            setIsLoading(true);
            let val = e.target.value;
            let _tokenId = getTokenIdFromEnsName(val);
            let _ensNamehash = getNameHashFromEnsName(val);
            setEnsName(val);
            setTokenId(_tokenId);
            setEnsNameHash(_ensNamehash);
          }}
        />
        <div style={{ marginBottom: 15 }}></div>

        <Input
          type="number"
          size="large"
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
        <div style={{ marginBottom: 15 }}></div>

        {/* <AddressInput
          autoFocus
          size="large"
          ensProvider={mainnetProvider}
          placeholder="Enter lock address"
          value={lockAddress ? lockAddress : ""}
          suffix={
            <Tooltip title="Only users with a key to this lock can claim this">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={setLockAddress}
        /> */}
        <Input
          placeholder="Enter lock address"
          value={lockAddress ? lockAddress : ""}
          size="large"
          prefix={<LockOutlined className="site-form-item-icon" />}
          suffix={
            <Tooltip title="Only users with a key to this lock can claim this">
              <InfoCircleOutlined />
            </Tooltip>
          }
          onChange={e => {
            let val = e.target.value;
            setLockAddress(val);
          }}
        />
        <div style={{ marginBottom: 20 }}></div>
        {/* {ensName && tokenId && tokenId !== 0 && address !== ensOwner ? (
          <Button loading={isLoading} disabled>
            NOT OWNER
          </Button>
        ) : ensName && (!isRegistrarApproved || !isRegistryApproved) ? (
          <Button
            onClick={async () => {
              let tx = await approveForAll(ensYoloAddress, true);
              console.log("approveForAll txn: ", tx);
            }}
            loading={isLoading}
          >
            Approve
          </Button>
        ) : ensName && isRegistrarApproved && isRegistryApproved ? (
          <Button
            loading={isLoading}
            onClick={async () => {
              const txResult = await yoloEns();
              console.log("YOLO Tnx", txResult);
            }}
          >
            YOLO ENS
          </Button>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Spin />
          </div>
        )} */}

        <Button
          // loading={isLoading}
          onClick={async () => {
            const txResult = await yoloEns();
            console.log("YOLO Tnx", txResult);
          }}
        >
          YOLO ENS
        </Button>
      </Card>
    </div>
  );
};
export default YoloEns;
