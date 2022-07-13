// import { Select } from "antd";
import React, { useState } from "react";
// import { utils } from "ethers";

import { useTokenList } from "eth-hooks/dapps/dex";
// import { Address, AddressInput, CreateLock, GatedContent, UnlockVariables } from "../components";
import { GatedContent } from "../components";


export default function Dashboard({ publicLock, price, unlock, targetNetwork, address }) {

  return (
    <div style={{ padding: 30 }}>
      <GatedContent
        address={address}
        publicLock={publicLock}
        targetNetwork={targetNetwork}
        price={price}
        unlock={unlock}
      />
    </div>
  );
}
