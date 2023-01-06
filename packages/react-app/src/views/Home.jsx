import { Button, List, Card } from "antd";
import React, { useState, useEffect } from "react";
import { useUnlockState } from "../hooks";
import { Address, AddressInput } from "../components";
import { useContractReader } from "eth-hooks";
import { purchaseMembership } from "../helpers";
const { ethers } = require("ethers");
const abis = require("@unlock-protocol/contracts");
/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({
  userSigner,
  injectedProvider,
  readContracts,
  writeContracts,
  tx,
  loadWeb3Modal,
  blockExplorer,
  mainnetProvider,
  address,
  actionLockAddress,
  publicLockContract,
}) {
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [actionDurationBlocks, setActionDurationBlocks] = useState();
  const isMember = useUnlockState(publicLockContract, address);

  // 🧠 This effect will update actionCollectibles by polling when your balance changes
  const balanceContract = useContractReader(readContracts, "ActionCollectible", "balanceOf", [address]);
  const [balance, setBalance] = useState();

  useEffect(() => {
    let _actionDurationBlocks;
    const getBlocks = async () => {
      try {
        _actionDurationBlocks = await readContracts.ActionCollectibleState.actionDurationBlocks();
        setActionDurationBlocks(_actionDurationBlocks.toNumber());
      } catch (e) {
        console.log("error fetching action duration blocks", e);
      }
    };
    getBlocks();
  }, [readContracts]);

  useEffect(() => {
    if (balanceContract) {
      setBalance(balanceContract);
    }
  }, [balanceContract]);

  const [actionCollectibles, setActionCollectibles] = useState();

  console.log("Home: " + address + ", Balance: " + balance);

  useEffect(() => {
    const updateActionCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; ++tokenIndex) {
        try {
          console.log("Getting token index " + tokenIndex);
          const tokenId = await readContracts.ActionCollectible.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId: " + tokenId);
          const tokenURI = await readContracts.ActionCollectible.tokenURI(tokenId);
          const jsonManifestString = Buffer.from(tokenURI.substring(29), "base64").toString();
          console.log("jsonManifestString: " + jsonManifestString);

          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            console.log("jsonManifest: " + jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (err) {
            console.log(err);
          }
        } catch (err) {
          console.log(err);
        }
      }
      setActionCollectibles(collectibleUpdate.reverse());
    };
    if (address && balance) updateActionCollectibles();
  }, [address, balance]);

  return (
    <div>
      <div className="how-to-play" style={{ maxWidth: 820, margin: "auto" }}>
        <h3>YOLO an ENS name along with some ETH to your friends</h3>
        <h2>Airdrop a key to them so they are the only ones able to claim it</h2>
      </div>
    </div>
  );
}

export default Home;
