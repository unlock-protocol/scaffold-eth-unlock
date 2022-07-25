import { Button } from "antd";
import React, { useState, useEffect } from "react";
import { Paywall } from '@unlock-protocol/paywall';


/*
  ~ What it does? ~
  Displays a UI that allows a user is a member to purchase a membership.
  ~ How can I use? ~
  <UnlockPaywall
    publicLock={publicLock}
    displayText={"YourString"}
    shape={"round"}
    size={"medium"}
    targetNetwork={targetNetwork}
  />

  ~ Features ~
  - publicLock={publicLock} Passes the lockAddress to the paywall
  - displayText={"String"} Configures the text to display on the button
  - shape={"round"} gives a nice round border radius button, omit for default flat button type
  - size={"large"} for a large button size, omit for default medium button size
  - taregtNetwork={targetNework} passes the current network the app is pointing to
*/

const UnlockPaywall = ({ shape, size, publicLock, displayText, targetNetwork }) => {
  const [lockName, setLockName] = useState();
  const lockAddress = publicLock?.address;

  useEffect(() => {
    const getLockName = async () => {
      if (publicLock) {
        const name = await publicLock.name();
        setLockName(name);
      }
    }
    getLockName();
  }, [publicLock]);

  //You can add more locks by entering the lock info into the locks object
  const locks = {
    [lockAddress]: {
      "network": targetNetwork.chainId,
      "name": lockName,
    },
  };

  const paywallConfig = {
    "network": targetNetwork.chainId,
    "pessimistic": true,
    "locks": locks,
    "icon": "https://unlock-protocol.com/static/images/svg/unlock-word-mark.svg",
    "callToAction": {
      "default": "Please join the DG membership!"
    },
    "referrer": "0xCA7632327567796e51920F6b16373e92c7823854", // You can replace with your own address or leave this to support DreadGang :) it's up to you!!!
    "persistentCheckout": false,
    // ,
    //   "metadataInputs": [
    //     {
    //       "name": "Name",
    //       "type": "text",
    //       "required": true
    //     }
    //   ]
  };

  // Configure networks to use
  const networkConfigs = {
    1: {
      readOnlyProvider: "HTTP PROVIDER",
      locksmithUri: "https://locksmith.unlock-protocol.com",
      unlockAppUrl: "https://app.unlock-protocol.com",
    },
    100: {
      readOnlyProvider: "HTTP PROVIDER",
      locksmithUri: "https://locksmith.unlock-protocol.com",
      unlockAppUrl: "https://app.unlock-protocol.com",
    },
    4: {
      readOnlyProvider: targetNetwork.rpcUrl,
      locksmithUri: "https://locksmith.unlock-protocol.com",
      unlockAppUrl: "https://app.unlock-protocol.com",
    },
    // etc
  };

  const paywall = new Paywall(paywallConfig, networkConfigs);
  // You can now call paywall.loadCheckOutModal() at the click of a button to trigger the paywall

  const purchaseMembership = async () => {
    await paywall.loadCheckoutModal();
  };

  return (
    <>
      <div style={{ padding: 8 }}>
        <Button shape={shape} size={size} onClick={purchaseMembership}>
          {displayText}
        </Button>
      </div>
    </>
  );
};

export default UnlockPaywall;
