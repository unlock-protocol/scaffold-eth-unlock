// import { InfoCircleOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
// import { AddressInput } from "../";
import { Button, Spin, Tooltip, Card, DatePicker, Form, Input, List, Modal } from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment";
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
    const loadQuests = async () => {
      try {
        let exp = 1742760637000;
        setClaimExpiry(exp);
        const _allQuests = await readContracts?.ENSYOLO.getAllQuests();
        console.log("test-q", _allQuests);

        setQuests(_allQuests);
      } catch (e) {
        console.log(e);
      }
    };
    loadQuests();
  }, [readContracts, quests]);

  const createQuest = async ({ ensNameHash, nftDescription, nftContractAddress, claimExpiry }) => {
    try {
      setCreating(true);
      const tnx = await tx(
        writeContracts.ENSYOLO.createQuest(ensNameHash, nftDescription, nftContractAddress, claimExpiry),
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

  const handleDescription = descBytes32 => {
    const descString = utils.parseBytes32String(descBytes32);
    return descString;
  };
  const handleSubmit = async values => {
    // try {
    //   setLoading(true);
    //   // Upload the description to IPFS and get the content hash
    //   const ipfsResponse = await ipfs.add(values.description);
    //   const contentHash = ipfsResponse.cid.toString();
    //   // Call the smart contract to add a new task
    //   const tx = await contract.addTask(contentHash);
    //   message.success("Task added successfully!");
    //   form.resetFields();
    // } catch (error) {
    //   console.error(error);
    //   message.error("Error adding task!");
    // } finally {
    //   setLoading(false);
    // }
  };

  const addToIpfs = async str => {
    try {
      const { cid, path } = await client.add(str);
      console.log("ipfs-add::cid", cid);
      console.log("ipfs-add::path", path);
      return cid;
    } catch (e) {
      console.log(e);
    }
  };

  const handleFetchFromIpfs = async hashToGet => {
    try {
      // Fetch the content from IPFS
      const ipfsResponse = client.cat(hashToGet);
      const decoder = new TextDecoder();
      let data = "";
      for await (const chunk of ipfsResponse) {
        // chunks of data are returned as a Uint8Array, convert it back to a string
        data += decoder.decode(chunk, { ipfsResponse: true });
      }
      console.log("test-ipfs-retrieve::", data);
    } catch (error) {
      console.error("test-ipfs-error::", error);
    }
  };
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
            handleFetchFromIpfs();
            setVisible(true);
          }}
        >
          Create Quest
        </Button>
        {/* <List
          dataSource={quests}
          renderItem={quest => (
            <List.Item
              actions={[
                <Button key="complete" onClick={() => completeQuest(quest.ensNameHash)}>
                  Complete
                </Button>,
                <Button isLoading={canceling} key="cancel" onClick={() => cancelQuest(quest.ensNameHash)}>
                  Cancel
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<p>{handleDescription(quest.ensNameHash)}</p>}
                description={handleDescription(quest.description)}
              />
              <div>{`Created by ${quest.creator}`}</div>
            </List.Item>
          )}
        /> */}
        <Modal
          title="Create Quest"
          visible={visible}
          onCancel={() => setVisible(false)}
          onOk={() => {
            form.validateFields().then(values => {
              console.log("VALUES", values);
              let createQuestParams = {};
              const { ensName, nftContractAddress, description } = values;
              const _ensNameHash = getNameHashFromEnsName(ensName);
              console.log("values-nh", _ensNameHash);
              console.log("values-desc", description);
              console.log("values-naddr", nftContractAddress);
              createQuestParams = {
                ensNameHash: _ensNameHash,
                nftDescription: description,
                nftContractAddress,
                claimExpiry,
              };
              console.log("VALUES-CREATEPARAMS", createQuestParams);

              form.resetFields();
              createQuest(createQuestParams);
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
            {/* <Form.Item label="Claim Expiration" name="claimExpiration">
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
