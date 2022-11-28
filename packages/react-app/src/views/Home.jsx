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
  // (async () => {
  //   const tokenURI = await readContracts.ActionCollectible.tokenURI(1);
  //   console.log("tokenUri", tokenURI)
  // })()
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
        <h3>How to get started?</h3>
        <ul style={{ textAlign: "left" }}>
          <li>Mint Loogie NFT 🏗️</li>
          <li>Register tokens to the state to initialize Loogie stats on Actions tab 📜</li>
          <li>Get approved to take actions i.e slap or cast ✏️</li>
          <li>
            Start having some fun 🎉 and slap or cast spells on any Loogie. 🕹️
            <br />
            <b>Hints 💡</b>
            <p>💎Dead Loogies i.e Loogies with zero (0) strength can't send or receive actions</p>
            <p>💎Winning slaps makes the winner stronger and the loser weaker</p>
            <p>💎Stronger loogies may counter slaps</p>
            <p>💎Loogies on immune spell can't be slapped or cast</p>
            <p>💎Casting immune spell increases the strength of the sender</p>
            <p>
              💎Only members can cast immune spell.{" "}
              {!isMember ? (
                <Button
                  size="small"
                  type="link"
                  onClick={() => {
                    purchaseMembership(userSigner, address, actionLockAddress);
                  }}
                >
                  Join now (valid for 30days)
                </Button>
              ) : (
                <Button size="small" disabled>
                  Member
                </Button>
              )}
            </p>
            <p>💎Effect of actions lasts for {actionDurationBlocks} blocks</p>
            <p>
              💎Use <code style={{ background: "#dedede", padding: 2 }}>healAfterExpiry()</code> on Smart contracts tab
              or 'Heal after action' button on Actions tab to restore dead loogies or strength when less than 10, works
              after action effect wears off. <br /> Note: This resets loogie state, and vibes to default and chill
              respectively, and strength to 10 if its less than 10 but only resets the state and vibes if strength is
              greater than 10
            </p>
            <p className="active-loogie-color">
              💎Loogie active state colors: <span className="slapped">Slapped</span> <span className="lust">Lust</span>{" "}
              <span className="rage">Rage</span> <span className="dead">Dead</span>
            </p>
          </li>
        </ul>
      </div>
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        {injectedProvider ? (
          <Button
            type={"primary"}
            onClick={() => {
              tx(writeContracts.ActionCollectible.mintItem({value: ethers.utils.parseEther("0.001")}));
            }}
          >
            MINT
          </Button>
        ) : (
          <Button type={"primary"} onClick={loadWeb3Modal}>
            CONNECT WALLET
          </Button>
        )}
      </div>

      <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
        <List
          bordered
          dataSource={actionCollectibles}
          renderItem={item => {
            const id = item.id.toNumber();

            console.log("IMAGE", item.image);

            return (
              <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                <Card
                  title={
                    <div>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                    </div>
                  }
                >
                  <a
                    href={
                      "https://opensea.io/assets/" +
                      (readContracts && readContracts.ActionCollectible && readContracts.ActionCollectible.address) +
                      "/" +
                      item.id
                    }
                    target="_blank"
                  >
                    <img src={item.image} />
                  </a>
                  <div>{item.description}</div>
                </Card>

                <div>
                  owner:{" "}
                  <Address
                    address={item.owner}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={16}
                  />
                  <AddressInput
                    ensProvider={mainnetProvider}
                    placeholder="transfer to address"
                    value={transferToAddresses[id]}
                    onChange={newValue => {
                      const update = {};
                      update[id] = newValue;
                      setTransferToAddresses({ ...transferToAddresses, ...update });
                    }}
                  />
                  <Button
                    onClick={() => {
                      console.log("writeContracts", writeContracts);
                      tx(writeContracts.ActionCollectible.transferFrom(address, transferToAddresses[id], id));
                    }}
                  >
                    Transfer
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Home;
