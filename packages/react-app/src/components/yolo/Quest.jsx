// import { InfoCircleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
// import { AddressInput } from "../";
import { Button, Spin, Tooltip, Card, DatePicker, Form, Input, List, Modal } from "antd";
import React, { useState, useEffect } from "react";
// import moment from "moment";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import { INFURA_IPFS_SECRET, INFURA_IPFS_ID } from "../../constants";
import { read } from "fs";

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
    writeContracts={writeContracts}
    getNameHashFromEnsName={getNameHashFromEnsName}
    tx={tx}
    address={address}
    mainnetProvider={mainnetProvider}
  />

**/

const Quest = function ({
  address,
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
  const [canceling, setCanceling] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ensNameHash, setEnsNameHash] = useState();
  const [contentHash, setContentHash] = useState();
  const [description, setDescription] = useState();

  const [form] = Form.useForm();

  useEffect(() => {
    const updateQuests = async () => {
      const questsUpdate = [];
      if (readContracts && readContracts.ENSYOLO) {
        await readContracts.ENSYOLO.getAllQuests().then(val => {
          val.map(item => {
            try {
              let { ensNameHash, creator, description, isActive, isCompleted, lock, nftContract, winner } = item;
              const newQuest = {
                ensNameHash,
                creator,
                description,
                isActive,
                isCompleted,
                lock,
                nftContract,
                winner,
              };
              questsUpdate.push(newQuest);
            } catch (e) {
              console.log(e);
            }
            setQuests(questsUpdate);
          });
        });
      }
    };
    updateQuests();
  }, [readContracts]);
  console.log("test-quest", quests);
  // useEffect(() => {
  //   const loadQuests = async () => {
  //     try {
  //       // let myArr = []
  //       const _allQuests = await readContracts?.ENSYOLO.getAllQuests();
  //       // _allQuests?.map(arr => myArr.push(arr))
  //       setQuests(_allQuests);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };
  //   loadQuests();
  //   console.log("test-q", quests);
  // }, [readContracts, quests]);

  // const createQuest = async ({ ensNameHash, questDescription, nftContractAddress, claimExpiry }) => {
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
    }
  };

  // const loadQuests = async () => {
  //   const quests = await readContracts?.ENSYOLO.getAllQuests(); // fetchQuests returns a Promise object
  //   return (
  //     <List
  //       dataSource={quests}
  //       renderItem={quest => (
  //         <List.Item
  //           actions={[
  //             <Button key="complete" onClick={() => completeQuest(quest.ensNameHash)}>
  //               Complete
  //             </Button>,
  //             <Button key="cancel" onClick={() => cancelQuest(quest.ensNameHash)}>
  //               Cancel
  //             </Button>,
  //           ]}
  //         >
  //           <List.Item.Meta
  //             // title={<p>{handleDescription(quest.ensNameHash)}</p>}
  //             description={fetchFromIpfs(convertBytesToIpfsHash(quest.description))}
  //           />
  //           <div>{`Created by ${quest.creator}`}</div>
  //         </List.Item>
  //       )}
  //     />
  //   );
  // }

  ///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////

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
        <Button
          loading={creating}
          type="primary"
          onClick={() => {
            setVisible(true);
          }}
        >
          Create Quest
        </Button>
        {quests && quests.length
          ? // <List
            //   dataSource={quests}
            //   renderItem={quest => (
            //     <List.Item
            //       actions={[
            //         <Button key="complete" onClick={() => completeQuest(quest.ensNameHash)}>
            //           Complete
            //         </Button>,
            //         <Button key="cancel" onClick={() => cancelQuest(quest.ensNameHash)}>
            //           Cancel
            //         </Button>,
            //       ]}
            //     >
            //       <List.Item.Meta
            //         // title={<p>{handleDescription(quest.ensNameHash)}</p>}
            //         description={fetchFromIpfs(convertBytesToIpfsHash(quest.description))}
            //       />
            //       <div>{`Created by ${quest.creator}`}</div>
            //     </List.Item>
            //   )}
            // />
            quests.map(item => {
              return <div>{convertBytesToIpfsHash(item.description)}</div>;
            })
          : null}
        {/* {loadQuests} */}
        <Modal
          title="Create Quest"
          visible={visible}
          onCancel={() => setVisible(false)}
          onOk={async () => {
            let createQuestParams = {};
            let values = await form.validateFields();
            const { ensName, nftContractAddress, description } = values;
            setDescription(description);
            // setClaimExpiry(_now);
            // console.log("testNOW", _now);
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

            //   // let hash = await handleContentHash();
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
            {/* <Form.Item
              label="Lock Address"
              name="lockAddress"
              rules={[{ required: true, message: "Please enter a lock address" }]}
            >
              <Input />
            </Form.Item> */}
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
            {/* <Form.Item
              label="ENS Name Hash"
              name="ensNameHash"
              rules={[{ required: true, message: "Please enter an ENS name hash" }]}
            >
              <Input />
            </Form.Item> */}
          </Form>
        </Modal>
      </Card>
    </div>
  );
};
export default Quest;
