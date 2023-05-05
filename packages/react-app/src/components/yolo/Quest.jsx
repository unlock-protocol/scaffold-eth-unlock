// import { InfoCircleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
// import { AddressInput } from "../";
// import moment from "moment";
// import { read } from "fs";
import { Button, Spin, Tooltip, Skeleton, Card, DatePicker, Form, Input, List, Modal } from "antd";
import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import { INFURA_IPFS_SECRET, INFURA_IPFS_ID } from "../../constants";

const ethers = require("ethers");
const auth = "Basic " + Buffer.from(INFURA_IPFS_ID + ":" + INFURA_IPFS_SECRET).toString("base64");
const client = create({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

/**
  ~ How can I use? ~

  <Quest
    readContractr={readContract}
    ensRegistryContract={ensRegistryContract}
    writeContracts={writeContracts}
    getNameHashFromEnsName={getNameHashFromEnsName}
    tx={tx}
    address={address}
    mainnetProvider={mainnetProvider}
  />

**/

const Quest = function ({
  address,
  userSigner,
  ensRegistryContract,
  mainnetProvider,
  readContracts,
  tx,
  writeContracts,
  getNameHashFromEnsName,
  ...props
}) {
  const [claimExpiry, setClaimExpiry] = useState();
  const utils = ethers.utils;

  const [quests, setQuests] = useState([]);
  const [creating, setCreating] = useState(false);
  const [fetchingQuests, setFetchingQuests] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ensNameHash, setEnsNameHash] = useState();
  const [contentHash, setContentHash] = useState();
  const [description, setDescription] = useState();
  const [resolver, setResolver] = useState();

  const [form] = Form.useForm();

  useEffect(() => {
    const updateQuests = async () => {
      setFetchingQuests(true);
      const questsUpdate = [];
      if (readContracts && readContracts.ENSYOLO) {
        await readContracts.ENSYOLO.getAllQuests().then(val => {
          val.map(async item => {
            try {
              let { ensNameHash, creator, description, isActive, isCompleted, lock, nftContract, winner } = item;
              let contentHash = convertBytesToIpfsHash(description);
              let _desc = await fetchFromIpfs(contentHash);
              const newQuest = {
                ensNameHash,
                creator,
                description: _desc,
                isActive,
                isCompleted,
                lock,
                nftContract,
                winner,
              };
              questsUpdate.push(newQuest);
            } catch (e) {
              console.log(e);
            } finally {
              setFetchingQuests(false);
            }
            setQuests(questsUpdate);
          });
        });
      }
    };
    updateQuests();
  }, [readContracts]);
  console.log("test-quest", quests);

  const createQuest = async (ensNameHash, questDescription, nftContractAddress, claimExpiry) => {
    try {
      setCreating(true);
      const tnx = await tx(
        writeContracts.ENSYOLO.createQuest(ensNameHash, questDescription, nftContractAddress, claimExpiry),
      );
      await tnx.wait();
    } catch (e) {
      console.log(e);
    } finally {
      setCreating(false);
    }
  };

  const cancelQuest = async _ensNameHash => {
    try {
      setCanceling(true);
      const tnx = await tx(writeContracts.ENSYOLO.cancelQuest(_ensNameHash));
      await tnx.wait();
    } catch (e) {
      console.log(e);
    } finally {
      setCanceling(false);
    }
  };

  const completeQuest = async _ensNameHash => {
    try {
      const tnx = await tx(writeContracts.ENSYOLO.completeQuest(_ensNameHash));
      await tnx.wait();
    } catch (e) {
      console.log(e);
    }
  };

  const convertBytesToIpfsHash = descBytes => {
    const descString = utils.toUtf8String(descBytes);
    console.log("test-desc-string", descString);
    return descString;
  };

  const convertIpfsHashToBytes = hash => {
    let hexBytes = utils.hexlify(utils.toUtf8Bytes(hash));
    console.log("test-desc-hex", hexBytes);
    return hexBytes;
  };

  // convertIpfsHashToBytes("QmS6ygYNVdm4DzMeLHqqWAuEgmTktMnW2GJjXNJ2FAEtcz");
  const addToIpfs = async str => {
    try {
      const { cid, path } = await client.add(str);
      console.log("ipfs-add::cid", cid);
      console.log("ipfs-add::path", path);
      return path;
    } catch (e) {
      console.log(e);
    }
  };

  const fetchFromIpfs = async hashToGet => {
    setFetchingQuests(true);
    try {
      // Fetch the content from IPFS
      const ipfsResponse = client.cat(hashToGet);
      const decoder = new TextDecoder();
      let data = "";
      for await (const chunk of ipfsResponse) {
        // chunks of data are returned as a Uint8Array, convert it back to a string
        data += decoder.decode(chunk, { ipfsResponse: true });
      }
      console.log("ipfs-retrieve::", data);
      return data;
    } catch (error) {
      console.error("ipfs-retrieve-error::", error);
    } finally {
      setFetchingQuests(false);
    }
  };
  ///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////


  const getNameFromNameHash = async __nameHash => {
    try {
      // Get resolver address for the ENS name
      if (ensRegistryContract) {
        let resolverAddress = await ensRegistryContract.resolver(__nameHash);
        // Load resolver contract
        const resolverAbi = ["function name(bytes32 node) view returns (string memory)"];
        const resolver = new ethers.Contract(resolverAddress, resolverAbi, userSigner);
        // Get ENS name from name hash
        // const _ensName = await resolver.name(__nameHash).then(val => {
        //   console.log("test-test", val);

        // });
        // return _ensName;
        setResolver(resolver);
        console.log("test-test", resolver);
      }
    } catch (e) {
      console.log("test-test-err", e);
    }
  };
  // console.log("test-test", getNameFromNameHash("0x732c0d87357d504c98c56f29308ea20ae3f2551b515848e69ee9d780b1693374"));
  // getNameFromNameHash("0x732c0d87357d504c98c56f29308ea20ae3f2551b515848e69ee9d780b1693374");
  // useEffect(() => {
  //   const ssd = async d => {
  //     try {
  //       if (resolver) {
  //         const s = await resolver.name("0x732c0d87357d504c98c56f29308ea20ae3f2551b515848e69ee9d780b1693374");
  //         console.log("test-test-ss", s);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   ssd()
  // }, [resolver]);

  return (
    <div
      className="container text-start"
      style={{
        // maxWidth: props.maxWidth,
        margin: props.margin,
        // display: props.display,
        // alignItems: props.alignItems,
        // flexDirection: props.flexDirection,
        marginTop: props.marginTop,
        paddingBottom: props.paddingBottom,
      }}
    >
      <div className="row">
        <div className="col">
          <Card
            style={{
              // maxWidth: 500,
              width: "100%",
            }}
          >
            <Button
              loading={creating}
              type="primary"
              onClick={() => {
                setVisible(true);
              }}
            >
              Create Quest
            </Button>
            {quests && quests.length ? (
              <List
                // itemLayout="vertical"
                className="demo-loadmore-list"
                loading={fetchingQuests}
                dataSource={quests}
                renderItem={quest => (
                  <List.Item
                    actions={[
                      <Button
                        disabled={address && address === quest.creator}
                        key="complete"
                        onClick={() => completeQuest(quest.ensNameHash)}
                      >
                        Complete
                      </Button>,
                      <Button
                        disabled={address && address !== quest.creator}
                        key="cancel"
                        onClick={() => cancelQuest(quest.ensNameHash)}
                      >
                        Cancel
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta title={<p>Nice title</p>} description={`${quest.description}`} />
                    <Skeleton avatar title={false} loading={quest.loading} active>
                      <List.Item.Meta
                        // avatar={<Avatar size={50} src={item.picture.large} />}
                        title={<a href="#">{quest.isActive}</a>}
                        description={`Members: ${quest.isCompleted} 🧑‍🤝‍🧑`}
                      />
                      {/* <div>content</div> */}
                    </Skeleton>
                  </List.Item>
                )}
              />
            ) : null}
            <Modal
              title="Create Quest"
              visible={visible}
              onCancel={() => setVisible(false)}
              onOk={async () => {
                let createQuestParams = {};
                let values = await form.validateFields();
                const { ensName, nftContractAddress, description } = values;
                setDescription(description);
                addToIpfs(description).then(val => {
                  let _now = 1651282667;
                  const _ensNameHash = getNameHashFromEnsName(ensName);
                  let questDescriptionBytes = convertIpfsHashToBytes(val);
                  createQuestParams = {
                    ensNameHash: _ensNameHash,
                    questDescription: questDescriptionBytes,
                    nftContractAddress,
                    claimExpiry: _now,
                  };

                  console.log("testVALUES-CREATEPARAMS", createQuestParams);
                  createQuest(_ensNameHash, questDescriptionBytes, nftContractAddress, _now);
                  form.resetFields();
                  setVisible(false);
                });
              }}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  label="ENS Name"
                  name="ensName"
                  rules={[{ required: true, message: "Please enter an ENS name hash" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[{ required: true, message: "Please enter a description" }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item
                  label="NFT Contract Address"
                  name="nftContractAddress"
                  rules={[{ required: true, message: "Please enter an NFT contract address" }]}
                >
                  <Input />
                </Form.Item>
                {/* <Form.Item
                  rules={[{ required: true, message: "Please choose a claim expiration date" }]}
                  label="Claim Expiration"
                  name="claimExpiration"
                >
                  <DatePicker />
                </Form.Item> */}
              </Form>
            </Modal>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Quest;
