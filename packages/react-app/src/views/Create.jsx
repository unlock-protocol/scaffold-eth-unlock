import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PlusOutlined, CaretLeftOutlined, KeyOutlined } from "@ant-design/icons";
import { Input, Card, Button, Typography, Spin } from "antd";
import { CenterContent, ContentRow, ContentCol, CreateLock, MultiSelect } from "../components";

// unlock contract abis
const abis = require("@unlock-protocol/contracts");
const { Title } = Typography;
const iconButtonStyle = {
  width: 65,
  height: 65,
  fontSize: 19,
};

function Create({ writeContracts, userSigner, price, tx }) {
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
            "0xE8E5cd156f89F7bdB267EabD5C43Af3d5AF2A78f", // Unlock Polygon
            // "0x3d5409CcE1d45233dE1D4eBDEe74b8E004abDD13", // Unlock Mainnet
            // "0x99b1348a9129ac49c6de7F11245773dE2f51fB0c", // Unlock Optimism
            // "0xeC83410DbC48C7797D2f2AFe624881674c65c856", // Unlock BSC
            // "0x1bc53f4303c711cc693F6Ec3477B83703DcB317f", // Unlock Gnosis
            // "0x1FF7e338d5E582138C46044dc238543Ce555C963", // Unlock Mumbai
            // "0x627118a4fB747016911e5cDA82e2E77C531e8206", // Unlock Goerli
            // "0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b", // Unlock Rinkeby
            // "0x1FF7e338d5E582138C46044dc238543Ce555C963", // Unlock Celo
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
          console.log("ooooooo", publicLock);
        } catch (e) {
          console.log("error getting imported Lock data: ", e);
        }
      }
      setIsImporting(false);
    };
    getLockData();
  }, [importedLockAddress, publicLock]);

  const goBack = () => {
    setIsLoading(false);
    setBroadcastMethod(0);
  };

  const handleSelect = opt => {
    let chosenTags = [];
    opt.map(item => chosenTags.push(item));
    setSelectedTags(chosenTags);
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
      <CreateLock writeContracts={writeContracts} unlock={unlock} txn={tx} price={price} goBack={goBack} />
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
                    size="large"
                    style={{ textAlign: "left", marginTop: 15 }}
                    placeholder={importedLockData.name}
                    value={importedLockData.name}
                  />
                  <Input
                    disabled
                    size="large"
                    style={{ textAlign: "left", marginTop: 15 }}
                    placeholder={"Symbol"}
                    value={`Symbol: ${importedLockData.symbol}`}
                  />
                  <Input
                    disabled
                    size="large"
                    style={{ textAlign: "left", marginTop: 15 }}
                    placeholder={importedLockData.symbol}
                    value={`Holders: ${importedLockData.totalSupply} / ${
                      importedLockData.maxKeys ? importedLockData.maxKeys : "Infinity"
                    }`}
                  />
                  <div style={{ textAlign: "left", marginTop: 15 }}>
                    <MultiSelect
                      size="large"
                      placeholder="Select related tags (Max 5)"
                      status={selectedTags && selectedTags.length < 1 ? "error" : "success"}
                      onChange={handleSelect}
                    />
                  </div>
                  <div style={{ padding: 8, textAlign: "center", marginTop: 25 }}>
                    <Button
                      block
                      shape="round"
                      type="primary"
                      size="large"
                      loading={isLoading}
                      onClick={() => {
                        setIsLoading(true);
                        (async function () {
                          try {
                            const broadcastTx = tx(
                              await writeContracts.MembersHub.broadcastMembership(selectedTags, importedLockAddress),
                            );
                            console.log("broadcast txn", broadcastTx);
                          } catch (e) {
                            console.log(e);
                          }
                        })(selectedTags, importedLockAddress);
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
