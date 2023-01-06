import { Button, Col, Menu, Row, Card, Spin, Input, Tooltip } from "antd";
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
  AddressInput,
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
import { TwitterOutlined, InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
import StackGrid from "react-stack-grid";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, Actions } from "./views";
import { useStaticJsonRPC } from "./hooks";
const abis = require("@unlock-protocol/contracts");
const { ethers } = require("ethers");
const nameHash = require("@ensdomains/eth-ens-namehash");
const { toUtf8Bytes } = require("ethers/lib/utils");

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
  // useEffect(() => {
  //   const readyUnlock = async () => {
  //     try {
  //       const _actionLockAddress = await readContracts.ActionCollectible.actionLock();
  //       if (_actionLockAddress !== ethers.constants.AddressZero) {
  //         const _publicLockContract = new ethers.Contract(_actionLockAddress, abis.PublicLockV12.abi, userSigner);
  //         setActionLockAddress(_actionLockAddress);
  //         setPublicLockContract(_publicLockContract);
  //       }
  //     } catch (e) {
  //       console.log("Unlock error", e);
  //     }
  //   };
  //   readyUnlock();
  // }, [readContracts, userSigner, address]);

  // set ENS contracts
  const ensRegistryABI = require("./contracts/ABI/ENSRegistry.json");
  const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
  const baseRegistrarABI = require("./contracts/ABI/BaseRegistrarImplementation.json");
  const baseRegistrarAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
  const BigNumber = ethers.BigNumber;
  const utils = ethers.utils;

  const [ensRegistryContract, setEnsRegistryContract] = useState();
  const [baseRegistrarContract, setBaseRegistrarContract] = useState();
  const [isRegistrarApproved, setIsRegistrarApproved] = useState();
  const [isRegistryApproved, setIsRegistryApproved] = useState();
  const [ensName, setEnsName] = useState();
  const [ensNameHash, setEnsNameHash] = useState();
  const [tokenId, setTokenId] = useState();
  const [lockAddress, setLockAddress] = useState();
  const [amount, setAmount] = useState();
  const [isLoading, setIsLoading] = useState();

  useEffect(() => {
    const registryContract = new ethers.Contract(ensRegistryAddress, ensRegistryABI, userSigner);
    const registrarContract = new ethers.Contract(baseRegistrarAddress, baseRegistrarABI, userSigner);
    setEnsRegistryContract(registryContract);
    setBaseRegistrarContract(registrarContract);
  }, [userSigner, address]);

  useEffect(() => {
    const getApprovalForAll = async () => {
      if (tokenId && tokenId !== 0) {
        setIsLoading(true);
        try {
          const owner = await baseRegistrarContract.ownerOf(tokenId);
          console.log("owner:", owner);
          let registrarApproved = await baseRegistrarContract.isApprovedForAll(
            owner,
            "0x3190E512816e161EA85fbFa30787608F9b49f8Cb",
          );
          let registryApproved = await ensRegistryContract.isApprovedForAll(
            owner,
            "0x3190E512816e161EA85fbFa30787608F9b49f8Cb",
          );
          setIsRegistrarApproved(registrarApproved);
          setIsRegistryApproved(registryApproved);
          setIsLoading(false);
        } catch (e) {
          console.log("error checking approval ", e);
        }
      } else {
        setIsLoading(true);
      }
    };
    getApprovalForAll();
  }, [ensName, tokenId, baseRegistrarContract]);

  console.log("sss: ", ensRegistryContract, "\n", "xxx: ", baseRegistrarContract);
  // console.log("tokenId:: ", isRegistrarApproved);
  // console.log("tokenId::XX ", isRegistryApproved);

  const approveForAll = async (_operatorAddr, _approved) => {
    try {
      let registrarTxHash;
      let registryTxHash;
      if (!isRegistrarApproved) {
        registrarTxHash = await tx(baseRegistrarContract.setApprovalForAll(_operatorAddr, _approved));
        console.log(`Approved on BaseRegistrar with tx hash: ${registrarTxHash}`);
        setIsRegistrarApproved(_approved)
      }

      if (!isRegistryApproved) {
        registryTxHash = await tx(ensRegistryContract.setApprovalForAll(_operatorAddr, _approved));
        console.log(`Approved on ENSRegistry with tx hash: ${registryTxHash}`);
        setIsRegistryApproved(_approved)
      }
    } catch (e) {
      console.log("error approving ENSYOLO: ", e);
    }
  };

  const yoloEns = async () => {
    try {
      let txHash = await tx(writeContracts.ENSYOLO.giftENS(ensNameHash, tokenId, lockAddress, {value: utils.parseEther(amount.toString())}));
      console.log(`ENS YOLO tx hash: ${txHash}`);
    } catch (e) {
      console.log("error gifting ENS: ", e);
    }
  };

  const cancelEnsYolo = async () => {
    try {
      let txHash = await tx(writeContracts.ENSYOLO.cancelENSYolo(ensNameHash));
      console.log(`ENS Claimed with tx hash: ${txHash}`);
    } catch (e) {
      console.log("error cancelling ENS: ", e);
    }
  };

  const claimEns = async () => {
    try {
      let txHash = await tx(writeContracts.ENSYOLO.claimItem(ensNameHash, tokenId));
      console.log(`ENS Claimed with tx hash: ${txHash}`);
    } catch (e) {
      console.log("error Claiming ENS: ", e);
    }
  };

  const getTokenIdFromEnsName = ensName => {
    let normalizedEns = nameHash.normalize(ensName);
    const [ensLabel] = normalizedEns.split(".eth");
    const ensNameLabelHash = utils.keccak256(utils.toUtf8Bytes(ensLabel));
    const tokenId = BigNumber.from(ensNameLabelHash).toString();
    setTokenId(tokenId);
    return tokenId;
  };

  const getNameHashFromEnsName = ensName => {
    let normalizedEns = nameHash.normalize(ensName);
    let hash = nameHash.hash(normalizedEns);
    setEnsNameHash(hash);
    return hash;
  };

  useEffect(() => {
    try {
      getNameHashFromEnsName(ensName);
      getTokenIdFromEnsName(ensName);
    } catch (e) {
      console.log("error: ", e);
    }
  }, [ensName]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

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
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/claim">
          <Link to="/claim">Claim ENS</Link>
        </Menu.Item>
        <Menu.Item key="/yolo">
          <Link to="/yolo">YOLO ENS</Link>
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
        <Route path="/claim">
          <Actions readContracts={readContracts} writeContracts={writeContracts} tx={tx} address={address} />
        </Route>
        <Route path="/yolo">
          <div
            style={{
              maxWidth: 1250,
              margin: "auto",
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              marginTop: 32,
              paddingBottom: 256,
            }}
          >
            <h1> YOLO ENS</h1>
            <Card
              style={{
                maxWidth: 500,
                width: "100%",
              }}
            >
              <p>Input ENS name</p>
              <Input
                placeholder="Enter ENS"
                value={ensName}
                prefix={<UserOutlined className="site-form-item-icon" />}
                suffix={
                  <Tooltip title="ENS name to gift">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
                onChange={e => {
                  let val = e.target.value;
                  setEnsName(val);
                }}
              />
              <p>Input YOLO ETH amount</p>
              <Input
                type="number"
                placeholder="ETH amount"
                value={amount ? amount : null}
                suffix={
                  <Tooltip title="ETH amount to gift (min: 0.01)">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
                onChange={e => {
                  let val = e.target.value;
                  setAmount(val);
                }}
              />
              <p>Input lock address</p>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="Enter lock address"
                value={lockAddress}
                suffix={
                  <Tooltip title="Only users with a key to this lock can claim this">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
                onChange={setLockAddress}
              />
              {!isRegistrarApproved || !isRegistryApproved ? (
                <Button
                  onClick={async () => {
                    let tx = await approveForAll("0x3190e512816e161ea85fbfa30787608f9b49f8cb", true);
                    console.log("approveForAll txn: ", tx);
                  }}
                  loading={isLoading}
                >
                  Approve
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    const txResult = await yoloEns();
                    console.log("ENS YOLO ", txResult);
                  }}
                >
                  YOLO ENS
                </Button>
              )}
            </Card>
            <h2 style={{marginTop: 30}}>Cancel ENS YOLO</h2>
            <Card
              style={{
                maxWidth: 500,
                width: "100%",
              }}
            >
              <p>Input ENS name</p>
              <Input
                placeholder="Enter ENS"
                // value={ensNameToCancel}
                prefix={<UserOutlined className="site-form-item-icon" />}
                suffix={
                  <Tooltip title="ENS name to cancel">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
                onChange={e => {
                  let val = e.target.value;
                  // setEnsNameToCancel(val);
                }}
              />

                <Button
                  onClick={async () => {
                    const txResult = await yoloEns();
                    console.log("ENS YOLO ", txResult);
                  }}
                >
                  Cancel ENS YOLO
                </Button>
            </Card>
          </div>
        </Route>
        <Route path="/debug">
          {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}
          <Contract
            name="ENSYOLO"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
          {/* <Contract
            name="ENSRegistry"
            price={price}
            signer={userSigner}
            provider={localProvider}
            address={address}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          /> */}
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
