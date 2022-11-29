import { Button, Col, Menu, Row, Card, Spin } from "antd";
import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import {
  Account,
  Address,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
} from "./components";
import { TwitterOutlined } from "@ant-design/icons";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
import StackGrid from "react-stack-grid";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup, loogieActiveStateHandlers } from "./helpers";
import { Home, Actions } from "./views";
import { useStaticJsonRPC } from "./hooks";
const abis = require("@unlock-protocol/contracts");
const { ethers } = require("ethers");
/*
    Welcome to Action Loogies !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
// const initialNetwork = NETWORKS.goerli; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = true; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const [actionLockAddress, setActionLockAddress] = useState();
  const [publicLockContract, setPublicLockContract] = useState();
  const location = useLocation();

  const targetNetwork = NETWORKS[selectedNetwork];
  const { handleTokenState, handleTokenVibe } = loogieActiveStateHandlers;

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  //  Action Loogies is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  const [totalSupply, setTotalSupply] = useState();
  useEffect(() => {
    const getTotalSupply = async () => {
      try {
        let ts = await readContracts.ActionCollectible.totalSupply();
        setTotalSupply(ts);
      } catch (e) {
        console.log("error fetching total supply", e);
      }
    };
    void getTotalSupply();
  }, [readContracts]);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(mainnetContracts, "DAI", "balanceOf", [
    "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  ]);

  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // set unlock protocol variables
  useEffect(() => {
    const readyUnlock = async () => {
      try {
        const _actionLockAddress = await readContracts.ActionCollectible.actionLock();
        if (_actionLockAddress !== ethers.constants.AddressZero) {
          const _publicLockContract = new ethers.Contract(_actionLockAddress, abis.PublicLockV12.abi, userSigner);
          setActionLockAddress(_actionLockAddress);
          setPublicLockContract(_publicLockContract);
        }
      } catch (e) {
        console.log("Unlock error", e);
      }
    };
    readyUnlock();
  }, [readContracts, userSigner, address]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [isloadingAssets, setIsLoadingAssets] = useState();
  const [loadedAssets, setLoadedAssets] = useState();
  useEffect(() => {
    const updateYourCollectibles = async () => {
      const assetUpdate = [];
      setIsLoadingAssets(true);
      for (let tokenIndex = 1; tokenIndex <= totalSupply; ++tokenIndex) {
        try {
          console.log("Getting token index " + tokenIndex);
          const owner = await readContracts.ActionCollectible.ownerOf(tokenIndex);
          console.log("owner: " + owner);
          const tokenURI = await readContracts.ActionCollectible.tokenURI(tokenIndex);
          const loogiesAddress = readContracts.ActionCollectible.address;
          const tokenStrength = await readContracts.ActionCollectibleState.getStrength(loogiesAddress, tokenIndex);
          const tokenStats = await readContracts.ActionCollectibleState.getTokenStats(loogiesAddress, tokenIndex);
          const tokenState = handleTokenState(tokenStats[1]);
          const tokenVibe = handleTokenVibe(tokenStats[2]);
          const jsonManifestString = Buffer.from(tokenURI.substring(29), "base64").toString();
          console.log("jsonManifestString: " + jsonManifestString);

          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            console.log("jsonManifest: " + jsonManifest);
            assetUpdate.push({
              id: tokenIndex,
              uri: tokenURI,
              state: tokenState,
              strength: tokenStrength,
              vibe: tokenVibe,
              owner,
              ...jsonManifest,
            });
          } catch (err) {
            console.log(err);
          }
        } catch (err) {
          console.log(err);
        }
      }
      setLoadedAssets(assetUpdate);
      if (assetUpdate && assetUpdate.length) setIsLoadingAssets(false);
    };
    if (readContracts && readContracts.ActionCollectible) updateYourCollectibles();
  }, [readContracts, totalSupply]);

  const galleryList = [];
  for (const a in loadedAssets) {
    console.log("loadedAssets", a, loadedAssets[a]);

    const cardActions = [];

    cardActions.push(
      <div className="gallery-card-action" style={{ display: "flex" }}>
        <span className="token-properties">
          <span style={{ marginRight: 8, display: "inline-block" }}>owned by: </span>
          <Address
            address={loadedAssets[a].owner}
            ensProvider={mainnetProvider}
            blockExplorer={blockExplorer}
            minimized
          />
        </span>
        <span className="token-properties">Strength: {loadedAssets[a].strength.toNumber()}</span>
        <span className="token-properties">State: {loadedAssets[a].state}</span>
        <span className="token-properties">Vibes: {loadedAssets[a].vibe}</span>
      </div>,
    );

    galleryList.push(
      <Card
        style={{ width: 250 }}
        key={loadedAssets[a].id}
        actions={cardActions}
        title={<div>{loadedAssets[a].name} </div>}
      >
        <img style={{ maxWidth: 130 }} src={loadedAssets[a].image} alt="" />
        <div style={{ opacity: 0.77 }}>{loadedAssets[a].description}</div>
      </Card>,
    );
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header>
        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flex: 1 }}>
            {USE_NETWORK_SELECTOR && (
              <div style={{ marginRight: 20 }}>
                <NetworkSwitch
                  networkOptions={networkOptions}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={setSelectedNetwork}
                />
              </div>
            )}
            <Account
              useBurner={USE_BURNER_WALLET}
              address={address}
              localProvider={localProvider}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}
            />
          </div>
        </div>
      </Header>
      {yourLocalBalance.lte(ethers.BigNumber.from("0")) && selectedNetwork === "localhost" && (
        <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
      )}
      <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      />
      <Menu style={{ textAlign: "center", marginTop: 20 }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">My Loogies</Link>
        </Menu.Item>
        <Menu.Item key="/actions">
          <Link to="/actions">Actions</Link>
        </Menu.Item>
        <Menu.Item key="/gallery">
          <Link to="/gallery">Gallery</Link>
        </Menu.Item>
        <Menu.Item key="/debug">
          <Link to="/debug">Smart Contracts</Link>
        </Menu.Item>
      </Menu>

      <Switch>
        <Route exact path="/">
          {/* pass in any web3 props to this Home component. For example, yourLocalBalance */}
          <Home
            userSigner={userSigner}
            injectedProvider={injectedProvider}
            readContracts={readContracts}
            writeContracts={writeContracts}
            tx={tx}
            loadWeb3Modal={loadWeb3Modal}
            blockExplorer={blockExplorer}
            address={address}
            actionLockAddress={actionLockAddress}
            publicLockContract={publicLockContract}
          />
        </Route>
        <Route path="/actions">
          <Actions readContracts={readContracts} writeContracts={writeContracts} tx={tx} address={address} />
        </Route>
        <Route path="/gallery">
          <div style={{ maxWidth: 1250, margin: "auto", marginTop: 32, paddingBottom: 256 }}>
            {isloadingAssets ? (
              <Spin />
            ) : (
              <StackGrid columnWidth={250} gutterWidth={16} gutterHeight={16}>
                {galleryList}
              </StackGrid>
            )}
          </div>
        </Route>
        <Route path="/debug">
          {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
          <Contract
            name="ActionCollectibleState"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
          <Contract
            name="ActionCollectible"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>
      </Switch>

      <ThemeSwitch />

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
        <Row align="middle">
          <Col span={8} style={{ textAlign: "center", opacity: 1, marginTop: 5 }}>
            <Button
              onClick={() => {
                window.open("https://twitter.com/dannithomx");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                <TwitterOutlined style={{ fontSize: "18px", color: "#08c" }} />
              </span>
              Follow creator on Twitter
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
