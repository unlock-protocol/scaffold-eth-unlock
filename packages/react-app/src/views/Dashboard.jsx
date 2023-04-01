import React, { useState, useEffect } from "react";
import { Menu, Spin, Button } from "antd";
// import { SyncOutlined, LaptopOutlined, NotificationOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { CenterContent, ContentRow, ContentCol } from "../components";
import { Link, Route, Switch, useHistory, useLocation } from "react-router-dom";
import { Hints } from ".";
import { YoloEns, ClaimEns, CancelYolo, Quest } from "../components/";
const ethers = require("ethers");

export default function ExampleUI({
  // blockExplorer,
  // localProvider,
  // localChainId,
  // contractConfig,
  // name,
  // targetNetwork,
  // ...props
  mainnetProvider,
  address,
  userSigner,
  readContracts,
  writeContracts,
  injectedProvider,
  loadWeb3Modal,
  tx
}) {
  const [isLoading, setIsLoading] = useState(true);
  let history = useHistory();
  const location = useLocation();
  // set ENS contracts
  const ensRegistryABI = require("../contracts/imported/ABI/ENSRegistry.json");
  const ensRegistryAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
  const baseRegistrarABI = require("../contracts/imported/ABI/BaseRegistrarImplementation.json");
  const baseRegistrarAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
  const BigNumber = ethers.BigNumber;
  const utils = ethers.utils;
  const nameHash = require("@ensdomains/eth-ens-namehash");

  const [ensRegistryContract, setEnsRegistryContract] = useState();
  const [baseRegistrarContract, setBaseRegistrarContract] = useState();

  useEffect(() => {
    try {
      const registryContract = new ethers.Contract(ensRegistryAddress, ensRegistryABI, userSigner);
      const registrarContract = new ethers.Contract(baseRegistrarAddress, baseRegistrarABI, userSigner);
      setEnsRegistryContract(registryContract);
      setBaseRegistrarContract(registrarContract);
    } catch (e) {
      console.log(e);
    }
  }, [userSigner, address]);

  const getTokenIdFromEnsName = ensName => {
    try {
      let normalizedEns = nameHash.normalize(ensName);
      const [ensLabel] = normalizedEns.split(".eth");
      const ensNameLabelHash = utils.keccak256(utils.toUtf8Bytes(ensLabel));
      const tokenId = BigNumber.from(ensNameLabelHash).toString();
      return tokenId;
    } catch (e) {
      console.log(e);
    }
  };

  const getNameHashFromEnsName = ensName => {
    try {
      let normalizedEns = nameHash.normalize(ensName);
      let hash = nameHash.hash(normalizedEns);
      return hash;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (injectedProvider) {
      setIsLoading(false);
    }
  }, [injectedProvider]);

  const getStarted = route => {
    if (injectedProvider) {
      history.push(route);
    } else {
      loadWeb3Modal();
    }
  };
  return !isLoading ? (
    <div>
      <div>
        <Menu style={{ textAlign: "center", marginTop: 20 }} selectedKeys={[location.pathname]} mode="horizontal">
          <Menu.Item key="/dashboard/hint">
            <Link to="/dashboard">HINT</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard/yolo">
            <Link to="/dashboard/yolo">YOLO</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard/claim">
            <Link to="/dashboard/claim">CLAIM</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard/cancel">
            <Link to="/dashboard/cancel">CANCEL</Link>
          </Menu.Item>
          <Menu.Item key="/dashboard/quest">
            <Link to="/dashboard/quest">QUEST</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route path="/dashboard/yolo">
            <div>
              <h1 style={{ marginTop: 30 }}> YOLO ENS</h1>
              <YoloEns
                maxWidth={1250}
                margin={"auto"}
                display={"flex"}
                alignItems={"center"}
                flexDirection={"column"}
                marginTop={32}
                paddingBottom={256}
                address={address}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                writeContracts={writeContracts}
                tx={tx}
                ensRegistryContract={ensRegistryContract}
                baseRegistrarContract={baseRegistrarContract}
                getTokenIdFromEnsName={getTokenIdFromEnsName}
                getNameHashFromEnsName={getNameHashFromEnsName}
              />
            </div>
          </Route>
          <Route path="/dashboard/claim">
            <div>
              <h1 style={{ marginTop: 30 }}>Claim ENS</h1>
              <ClaimEns
                maxWidth={1250}
                margin={"auto"}
                display={"flex"}
                alignItems={"center"}
                flexDirection={"column"}
                marginTop={32}
                paddingBottom={256}
                readContracts={readContracts}
                writeContracts={writeContracts}
                tx={tx}
                getNameHashFromEnsName={getNameHashFromEnsName}
                getTokenIdFromEnsName={getTokenIdFromEnsName}
              />
            </div>
          </Route>
          <Route path="/dashboard/cancel">
            <div>
              <h2 style={{ marginTop: 30 }}>Cancel YOLO</h2>
              <CancelYolo
                maxWidth={1250}
                margin={"auto"}
                display={"flex"}
                alignItems={"center"}
                flexDirection={"column"}
                marginTop={32}
                paddingBottom={256}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                writeContracts={writeContracts}
                tx={tx}
                getNameHashFromEnsName={getNameHashFromEnsName}
              />
            </div>
          </Route>
          <Route path="/dashboard/quest">
            <div>
              <h2 style={{ marginTop: 30 }}>QUEST</h2>
              <Quest
                maxWidth={1250}
                margin={"auto"}
                display={"flex"}
                alignItems={"center"}
                flexDirection={"column"}
                marginTop={32}
                paddingBottom={256}
                mainnetProvider={mainnetProvider}
                readContracts={readContracts}
                writeContracts={writeContracts}
                tx={tx}
                getNameHashFromEnsName={getNameHashFromEnsName}
              />
            </div>
          </Route>
          <Route path="/dashboard">
            <div>
              <Hints />
            </div>
          </Route>
        </Switch>
      </div>
    </div>
  ) : (
    <CenterContent>
      <ContentRow>
        <ContentCol flex={1} alignItems={"center"}>
          <div style={{ marginTop: 100 }}>
            <Spin></Spin> <br />
            {!injectedProvider ? (
              <Button
                onClick={() => {
                  getStarted("/dashboard/");
                }}
                style={{ marginTop: 15 }}
                shape="round"
                size={"large"}
              >
                Connect Wallet
              </Button>
            ) : null}
          </div>
        </ContentCol>
      </ContentRow>
    </CenterContent>
  );
}
