import { Button, Badge } from "antd";
import React, { useState, useEffect } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { BellOutlined } from "@ant-design/icons";
import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";
import { EmbedSDK } from "@epnsproject/sdk-uiembed";
import { createSocketConnection, EVENTS } from "@epnsproject/sdk-socket";
/** 
  ~ What it does? ~

  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

  ~ How can I use? ~

  <Account
    address={address}
    localProvider={localProvider}
    userProvider={userProvider}
    mainnetProvider={mainnetProvider}
    price={price}
    web3Modal={web3Modal}
    loadWeb3Modal={loadWeb3Modal}
    logoutOfWeb3Modal={logoutOfWeb3Modal}
    blockExplorer={blockExplorer}
    isContract={boolean}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to the given address
  - Provide localProvider={localProvider} to access balance on local network
  - Provide userProvider={userProvider} to display a wallet
  - Provide mainnetProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide price={price} of ether and get your balance converted to dollars
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
**/

export default function Account({
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  localChainId,
  blockExplorer,
  isContract,
}) {
  const { currentTheme } = useThemeSwitcher();
  const [epnsSocket, setEpnsSocket] = useState();
  const [isConnected, setIsConnected] = useState();
  const [feedCount, setFeedCount] = useState();

  const chainId = 42;

  //EPNS Socket connectionObj
  useEffect(() => {
    try {
      if (address) {
        const userCAIP = `eip155:${chainId}:${address}`;
        const connectionObject = createSocketConnection({
          user: userCAIP,
          env: "staging",
          socketOptions: { autoConnect: false },
        });

        setEpnsSocket(connectionObject);
      }
    } catch (e) {
      console.log(e);
    }
  }, [address]);

  const addSocketEvents = () => {
    epnsSocket?.on(EVENTS.CONNECT, () => {
      setIsConnected(true);
    });

    epnsSocket?.on(EVENTS.DISCONNECT, () => {
      setIsConnected(false);
    });

    epnsSocket?.on(EVENTS.USER_FEEDS, feedsList => {
      /**
       * "feedsList" is an [] which has the latest notification
       */
      let count = feedsList.length;
      setFeedCount(count);
      console.log("feedlist count", feedsList.length);
    });
  };

  const removeSocketEvents = () => {
    epnsSocket?.off(EVENTS.CONNECT);
    epnsSocket?.off(EVENTS.DISCONNECT);
    setFeedCount(0);
  };

  const connectSocket = () => {
    epnsSocket?.connect();
    addSocketEvents();
    setIsConnected(true);
  };
  const disconnectSocket = () => {
    epnsSocket?.disconnect();
    removeSocketEvents();
    setIsConnected(false);
  };

  let accountButtonInfo;
  if (web3Modal?.cachedProvider) {
    accountButtonInfo = { name: "Logout", action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: "Connect", action: loadWeb3Modal };
  }

  useEffect(() => {
    if (accountButtonInfo.name === "Logout") {
      epnsSocket?.connected ? addSocketEvents() : connectSocket();
    } else {
      setFeedCount(0);
    }
  }, [epnsSocket]);

  // EPNS toggleConnection
  const toggleConnection = () => {
    if (accountButtonInfo.name === "Logout") {
      disconnectSocket();
      console.log("socket disconnected!");
    } else {
      if (isConnected) {
        console.log("epns socket already connected");
      } else {
        connectSocket();
        console.log("socket connected!");
      }
    }
  };

  //EPNS sidebar
  useEffect(() => {
    if (address) {
      // 'your connected wallet address'
      EmbedSDK.init({
        headerText: "Notifications", // optional
        targetID: "sdk-trigger-id", // mandatory
        appName: "membersHub", // mandatory
        user: address, // mandatory
        chainId: 42, // mandatory
        viewOptions: {
          type: "sidebar", // optional [default: 'sidebar', 'modal']
          showUnreadIndicator: false, // optional
          unreadIndicatorColor: "#cc1919",
          unreadIndicatorPosition: "top-right",
        },
        theme: "light",
        onOpen: () => {
          console.log("-> client dApp onOpen callback");
        },
        onClose: () => {
          setFeedCount(0);
          console.log("-> client dApp onClose callback");
        },
      });
    }

    return () => {
      EmbedSDK.cleanup();
    };
  }, [address]);

  const display = !minimized && (
    <span>
      {/* {address && (
        <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={20} />
      )}
      <Balance address={address} provider={localProvider} price={price} size={20} /> */}
      {!isContract && (
        <Wallet
          address={address}
          provider={localProvider}
          signer={userSigner}
          ensProvider={mainnetProvider}
          price={price}
          color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
          size={22}
          padding={"0px"}
        />
      )}
    </span>
  );

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Badge dot={true} count={feedCount}>
        <BellOutlined
          style={{ fontSize: 20, cursor: "pointer", color: "#000", marginRight: 6 }}
          id={"sdk-trigger-id"}
        />
      </Badge>
      {display}
      {web3Modal && (
        <Button
          style={{ marginLeft: 8 }}
          shape="round"
          onClick={() => {
            toggleConnection();
            accountButtonInfo.action();
          }}
        >
          {accountButtonInfo.name}
        </Button>
      )}
    </div>
  );
}
