import React, { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { PlusOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Input, Button, Typography, DatePicker } from "antd";
import { apolloClient, membershipQuery, subgraphURI } from "../helpers/graphQueryData";

import { CenterContent, ContentRow, ContentCol, CreateLock } from "../components";
// unlock contract abis
const abis = require("@unlock-protocol/contracts");

const { Title } = Typography;

function Create({ address, writeContracts, userSigner, price }) {
  const [creating, setCreating] = useState(false);

  ////////////////Unlock Protocol///////////////////
  // const unlockData = JSON.parse(window.localStorage.getItem("unlock"));
  // const publicLockData = JSON.parse(window.localStorage.getItem("publicLock"));
  // useEffect(() => {
  //   if (unlockData && publicLockData) {
  //     const unlockAddress = unlockData.unlockAddress;
  //     const publicLockAddress = publicLockData.publicLockAddress;
  //     setDeployedUnlockAddress(unlockAddress);
  //     setPublicLockAddress(publicLockAddress);
  //   }
  // }, []);

  // const [deployedUnlockAddress, setDeployedUnlockAddress] = useState();
  // const [publicLockAddress, setPublicLockAddress] = useState();
  const [publicLock, setPublicLock] = useState();
  const [unlock, setUnlock] = useState();

  useEffect(() => {
    const readyUnlock = () => {
      let unlockContract;
      // let publicLockContract;
      try {
        if (userSigner) {
          unlockContract = new ethers.Contract(
            "0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b",
            abis.UnlockV11.abi,
            userSigner,
          );
          // }
          // if (publicLockAddress) {
          //   publicLockContract = new ethers.Contract(publicLockAddress, abis.PublicLockV10.abi, userSigner);
          console.log("unlco", unlockContract);
        }
      } catch (e) {
        console.log(e);
      }
      setUnlock(unlockContract);
      // setPublicLock(publicLockContract);
    };
    readyUnlock();
  }, [userSigner]);
  ////////////// UNLOCK PROTOCOL: THE END /////////////
  const goBack = () => {
    setCreating(false);
  };

  const createMembershipButton = (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <Button
        onClick={() => {
          setCreating(true);
        }}
        type="primary"
        shape="circle"
        icon={<PlusOutlined />}
        size={"large"}
      />
      <p style={{ marginTop: 15, fontWeight: 300 }}>Create Membership</p>
    </div>
  );

  const createMembershipForm = (
    <div>
      <Title level={3} style={{ textAlign: "center", marginBottom: 30 }}>
        Broadcast Community / Membership
      </Title>
      <CreateLock writeContracts={writeContracts} unlock={unlock} price={price} goBack={goBack} />
    </div>
  );

  return (
    <CenterContent right={50} left={50}>
      <ContentRow>
        <ContentCol flex={1}>
          <div className="mh-dashboard-content">{!creating ? createMembershipButton : createMembershipForm}</div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
  );
}

export default Create;
