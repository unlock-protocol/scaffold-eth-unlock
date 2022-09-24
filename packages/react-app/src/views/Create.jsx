import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PlusOutlined, CaretLeftOutlined, KeyOutlined } from "@ant-design/icons";
import { Input, Card, Button, Typography, Select, Skeleton, Spin } from "antd";
import { apolloClient, tagQuery } from "../helpers/graphQueryData";
import { gql } from "@apollo/client";
import { CenterContent, ContentRow, ContentCol, CreateLock } from "../components";
// unlock contract abis
const abis = require("@unlock-protocol/contracts");

const { Title } = Typography;
const { Option } = Select;
const children = [];
const iconButtonStyle = {
  width: 65,
  height: 65,
  fontSize: 19,
};

async function getTagsList() {
  const { data } = await apolloClient.query({
    query: gql(tagQuery),
  });
  data.tags.map(tag => children.push(<Option key={tag.id}>{tag.id}</Option>));
}
getTagsList();

function Create({ writeContracts, userSigner, price }) {
  const [selectedTags, setSelectedTags] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [importedLockAddress, setImportedLockAddress] = useState(false);
  const [broadcastMethod, setBroadcastMethod] = useState(0);
  const [publicLock, setPublicLock] = useState();
  const [unlock, setUnlock] = useState();
  const [importedLockData, setImportedLockData] = useState();
  const [isImporting, setIsImporting] = useState();

  useEffect(() => {
    const readyUnlock = () => {
      let unlockContract;
      let publicLockContract;
      try {
        if (userSigner) {
          unlockContract = new ethers.Contract(
            "0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b", //Unlock Rinkeby
            abis.UnlockV11.abi,
            userSigner,
          );
          if (importedLockAddress) {
            publicLockContract = new ethers.Contract(importedLockAddress, abis.PublicLockV10.abi, userSigner);
          }
        }
      } catch (e) {
        console.log(e);
      }
      setUnlock(unlockContract);
      setPublicLock(publicLockContract);
    };
    readyUnlock();
  }, [userSigner, importedLockAddress]);

  useEffect(() => {
    let lockData = {};
    const getLockData = async () => {
      setIsImporting(true);
      if (publicLock) {
        try {
          lockData.name = await publicLock.name();
          lockData.symbol = await publicLock.symbol();
          lockData.maxKeys = await publicLock.maxNumberOfKeys();
          lockData.totalSupply = await publicLock.totalSupply();
          setImportedLockData(lockData);
        } catch (e) {
          console.log("error getting imported Lock data: ", e);
        }
      }
      console.log("lock data", lockData);
      console.log("publickLock", publicLock);
      setIsImporting(false);
    };
    getLockData();
  }, [importedLockAddress, publicLock]);

  const goBack = () => {
    setBroadcastMethod(0);
  };

  const createMembershipButton = (
    <>
      <ContentRow>
        <ContentCol flex={1} alignItems={"center"}>
          <div style={{ textAlign: "center", marginTop: 40, display: "flex" }}>
            <Card hoverable style={{ padding: 20, cursor: "initial" }}>
              <Button
                onClick={() => {
                  setBroadcastMethod(1);
                }}
                className={iconButtonStyle}
                style={iconButtonStyle}
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                size={"large"}
              />
              <p style={{ marginTop: 15, fontWeight: 300 }}>Create New Membership</p>
            </Card>
            <Card hoverable style={{ padding: 20, marginLeft: 60, cursor: "initial" }}>
              <Button
                className={iconButtonStyle}
                style={{ width: 65, height: 65, fontSize: 19, background: "#ffb44f", borderColor: "#ffb44f" }}
                onClick={() => {
                  setBroadcastMethod(2);
                }}
                type="primary"
                shape="circle"
                icon={<KeyOutlined style={{ fontSize: 24 }} />}
                size={"large"}
              />
              <p style={{ marginTop: 15, fontWeight: 300 }}>Import Existing Lock</p>
            </Card>
          </div>
        </ContentCol>
      </ContentRow>
    </>
  );

  const createMembershipForm = (
    <div>
      <Title level={3} style={{ textAlign: "center", marginBottom: 30 }}>
        Broadcast Community / Membership
      </Title>
      <CreateLock writeContracts={writeContracts} unlock={unlock} price={price} goBack={goBack} />
    </div>
  );

  const importMembershipForm = (
    <ContentRow>
      <ContentCol flex={1} alignItems={"center"}>
        <div style={{ padding: 8, marginTop: 32, maxWidth: 592, width: "100%" }}>
          <Button onClick={goBack} style={{ position: "relative", top: -10 }}>
            <CaretLeftOutlined />
            Back
          </Button>
          <Card headStyle={{ textAlign: "center" }} title="Import An Existing Lock">
            <div style={{ padding: 8 }}>
              <Input
                style={{ textAlign: "left", marginBottom: 15 }}
                placeholder={"Enter lock address"}
                size="large"
                onChange={e => {
                  const newValue = e.target.value;
                  setImportedLockAddress(newValue);
                }}
              />
              {isImporting && isImporting ? (
                <div style={{ textAlign: "center" }}>
                  <Spin></Spin>
                </div>
              ) : null}
              {!isImporting && importedLockData && importedLockData.name ? (
                <>
                  <Input
                    disabled
                    style={{ textAlign: "left", marginTop: 15 }}
                    placeholder={importedLockData.name}
                    value={importedLockData.name}
                  />
                  <Input
                    disabled
                    style={{ textAlign: "left", marginTop: 15 }}
                    placeholder={"Symbol"}
                    value={`Symbol: ${importedLockData.symbol}`}
                  />
                  <Input
                    disabled
                    style={{ textAlign: "left", marginTop: 15 }}
                    placeholder={importedLockData.symbol}
                    value={`Holders: ${importedLockData.totalSupply} / ${
                      importedLockData.maxKeys ? importedLockData.maxKeys : "Infinity"
                    }`}
                  />
                  <div style={{ textAlign: "left", marginTop: 15 }}>
                    <Select
                      status={selectedTags && selectedTags.length < 1 ? "error" : "success"}
                      mode="multiple"
                      allowClear
                      style={{
                        width: "100%",
                        marginTop: 15,
                      }}
                      placeholder="Select related tags (Max 5)"
                      onChange={value => {
                        setSelectedTags(value);
                      }}
                    >
                      {children}
                    </Select>
                  </div>
                  <div style={{ padding: 8, textAlign: "center", marginTop: 25 }}>
                    <Button
                      block
                      shape="round"
                      type="primary"
                      size="large"
                      loading={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const broadcastTx = await writeContracts.MembersHub.broadcastMembership(
                            selectedTags,
                            importedLockAddress,
                          );
                          console.log("broadcast txn", broadcastTx);
                        } catch (e) {
                          console.log(e);
                        }
                        setTimeout(setIsLoading(false), 3000);
                      }}
                      disabled={isLoading}
                    >
                      Broadcast membership
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </div>
      </ContentCol>
    </ContentRow>
  );

  function switchForms() {
    let formToDisplay;
    switch (broadcastMethod) {
      case 1:
        formToDisplay = createMembershipForm;
        break;
      case 2:
        formToDisplay = importMembershipForm;
        break;
      default:
        formToDisplay = createMembershipButton;
    }
    return formToDisplay;
  }
  return (
    <CenterContent right={50} left={50}>
      <ContentRow>
        <ContentCol flex={1}>
          <div className="mh-dashboard-content">{switchForms()}</div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
  );
}

export default Create;
