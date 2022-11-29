import { Button, Radio, Input, Select, List, Card } from "antd";
import React, { useState, useEffect } from "react";
import { useContractReader } from "eth-hooks";
import { loogieActiveStateHandlers } from "../helpers";

const ethers = require("ethers");
const { Option } = Select;
function Actions({ readContracts, writeContracts, tx, address }) {
  const [receivableActions, setReceivableActions] = useState([]);
  const [sendableActions, setSendableActions] = useState([]);
  const [contractData, setContractData] = useState({});
  const [selectedAction, setSelectedAction] = useState();
  const [fromTokenId, setFromTokenId] = useState();
  const [actionForApproval, setActionForApproval] = useState();
  const [isApprovedForAction, setIsApprovedForAction] = useState(ethers.constants.AddressZero);
  const [toTokenId, setToTokenId] = useState();
  const [actionCollectibles, setActionCollectibles] = useState();
  const [castType, setCastType] = useState();
  const [balance, setBalance] = useState();
  const [tokenIdToRegister, setTokenIdToRegister] = useState();
  const { handleTokenState, handleTokenVibe } = loogieActiveStateHandlers;
  const balanceContract = useContractReader(readContracts, "ActionCollectible", "balanceOf", [address]);

  useEffect(() => {
    if (balanceContract) {
      setBalance(balanceContract);
    }
  }, [balanceContract]);

  useEffect(() => {
    let stateContractAddress, loogieContractAddress, castActionSelector, slapActionSelector, data;
    const readyContractData = async () => {
      try {
        stateContractAddress = await readContracts.ActionCollectibleState.address;
        loogieContractAddress = await readContracts.ActionCollectible.address;
        castActionSelector = await readContracts.ActionCollectible.CAST_SELECTOR();
        slapActionSelector = await readContracts.ActionCollectible.SLAP_SELECTOR();
        data = {
          stateContract: stateContractAddress,
          fromContract: loogieContractAddress,
          toContract: loogieContractAddress,
          castSelector: castActionSelector,
          slapSelector: slapActionSelector,
        };
        setContractData(data);
      } catch (e) {
        console.log(e);
      }
    };
    readyContractData();
  }, [readContracts]);

  useEffect(() => {
    let approvedAddr;
    const getApprovalFor = async () => {
      try {
        if (actionForApproval || selectedAction) {
          approvedAddr = await readContracts.ActionCollectible.getApprovedForAction(
            address,
            actionForApproval ? actionForApproval : selectedAction,
          );
          setIsApprovedForAction(approvedAddr);
        }
      } catch (e) {
        console.log("error getting approvalFor", e);
      }
    };
    getApprovalFor();
  }, [readContracts, address, selectedAction, actionForApproval]);

  useEffect(() => {
    const _actions = [];
    const readyReceivableActions = async () => {
      try {
        const contractReceivableActions = await readContracts.ActionCollectible.receivableActions();
        let myArr = [...contractReceivableActions];
        if (myArr && myArr.length) {
          for (let i = 0; i < myArr.length; i++) {
            _actions.push({ name: myArr[i], selector: ethers.utils.id(myArr[i]).substring(0, 10) });
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    readyReceivableActions();
    setReceivableActions(_actions);
  }, [readContracts]);

  useEffect(() => {
    const _actions = [];
    const readySendableActions = async () => {
      try {
        const contractSendableActions = await readContracts.ActionCollectible.sendableActions();
        let myArr = [...contractSendableActions];
        if (myArr && myArr.length) {
          for (let i = 0; i < myArr.length; i++) {
            _actions.push({ name: myArr[i], selector: ethers.utils.id(myArr[i]).substring(0, 10) });
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    readySendableActions();
    setSendableActions(_actions);
  }, [readContracts]);

  useEffect(() => {
    const updateActionCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; ++tokenIndex) {
        try {
          console.log("Getting token index " + tokenIndex);
          const tokenId = await readContracts.ActionCollectible.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId: " + tokenId);
          const tokenURI = await readContracts.ActionCollectible.tokenURI(tokenId);
          const loogiesAddress = await readContracts.ActionCollectible.address;
          const tokenStats = await readContracts.ActionCollectibleState.getTokenStats(loogiesAddress, tokenId);
          const strength = await readContracts.ActionCollectibleState.getStrength(loogiesAddress, tokenId);
          const jsonManifestString = Buffer.from(tokenURI.substring(29), "base64").toString();
          console.log("jsonManifestString: " + jsonManifestString);

          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            console.log("jsonManifest: " + jsonManifest);
            collectibleUpdate.push({
              id: tokenId,
              uri: tokenURI,
              strength,
              tokenStats,
              owner: address,
              ...jsonManifest,
            });
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

  const handleActionSelect = e => {
    setSelectedAction(e);
  };
  const selectActionForApproval = e => {
    setActionForApproval(e);
  };

  const handleCastSelect = e => {
    const value = e.target.value;
    setCastType(value);
  };
  const capitalizeString = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div>
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        {sendableActions.length ? (
          <div>
            <div style={{ marginTop: 20, padding: "0 100px" }}>
              <h2 className="actions-form-group">Register Token</h2>
              <p>Register newly minted NFTs to the state to have your NFT stats initialized </p>
              <Input
                className="actions-form-group"
                value={tokenIdToRegister}
                type="number"
                onChange={e => {
                  const _tokenId = e.target.value;
                  setTokenIdToRegister(_tokenId);
                }}
                placeholder="Token ID"
              />
              <Button
                className="actions-form-group"
                type="primary"
                onClick={() => {
                  const registerToken = async () => {
                    try {
                      const txn = await tx(
                        writeContracts.ActionCollectibleState.registerToken(
                          contractData.fromContract,
                          tokenIdToRegister,
                        ),
                      );
                      console.log(txn.hash);
                    } catch (e) {
                      console.log(e);
                    }
                  };
                  registerToken();
                }}
              >
                Register token
              </Button>
            </div>
            <div>
              <h2>Approve action</h2>
              <p>Get your address approved to send actions</p>
              <Select
                style={{
                  width: 180,
                  textAlign: "left",
                }}
                onChange={selectActionForApproval}
              >
                {sendableActions.map(item => (
                  <Option value={item.selector}>{capitalizeString(item.name)}</Option>
                ))}
              </Select>
              <Button
                disabled={isApprovedForAction !== ethers.constants.AddressZero}
                type="primary"
                onClick={() => {
                  const approveForAction = async () => {
                    try {
                      const txn = await tx(
                        writeContracts.ActionCollectible.approveForAction(
                          address,
                          actionForApproval,
                          contractData.stateContract,
                        ),
                      );
                      console.log(txn.hash);
                    } catch (e) {
                      console.log(e);
                    }
                  };
                  approveForAction();
                }}
              >
                {isApprovedForAction !== ethers.constants.AddressZero ? "Approved" : "Approve for action"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
        <List
          bordered
          dataSource={actionCollectibles}
          renderItem={item => {
            const id = item.id.toNumber();
            const strength = item.strength.toNumber();
            const state = item.tokenStats[1];
            const vibe = item.tokenStats[2];
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
                  <img src={item.image} />
                  <div>{item.description}</div>
                  <div>
                    <span className="token-properties">Strength: {strength}</span>
                    <span className="token-properties">State: {handleTokenState(state)}</span>
                    <span className="token-properties">Vibes: {handleTokenVibe(vibe)}</span>
                  </div>
                </Card>
                <div className="action-controls" style={{ width: "100%", padding: 15 }}>
                  {sendableActions.length && receivableActions.length ? (
                    <div style={{ textAlign: "left" }}>
                      <h3 style={{ textAlign: "center" }}>Send Action</h3>
                      <div className="actions-form-group">
                        <span>Choose action: </span>
                        <Select
                          placeholder="select"
                          style={{
                            width: 180,
                            textAlign: "left",
                          }}
                          onChange={handleActionSelect}
                        >
                          {sendableActions.map(item => (
                            <Option value={item.selector}>{capitalizeString(item.name)}</Option>
                          ))}
                        </Select>
                      </div>
                      {selectedAction && selectedAction === ethers.utils.id("cast").substring(0, 10) ? (
                        <div className="actions-form-group">
                          <Radio.Group onChange={handleCastSelect} value={castType}>
                            {receivableActions.map(item =>
                              item.name !== "slap" ? (
                                <Radio value={item.selector}>{capitalizeString(item.name)}</Radio>
                              ) : (
                                ""
                              ),
                            )}
                          </Radio.Group>
                        </div>
                      ) : null}

                      <div className="actions-form-group">
                        <span>From tokenID: </span>
                        <Input name="fromToken" disabled type="number" value={id} placeholder="Token ID" />
                      </div>
                      <div className="actions-form-group">
                        <span>To tokenID: </span>
                        <Input
                          name="fromToken"
                          type="number"
                          value={toTokenId}
                          onChange={e => {
                            const _tokenId = e.target.value;
                            setToTokenId(_tokenId);
                            setFromTokenId(id);
                          }}
                          placeholder="Token ID"
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                          disabled={isApprovedForAction === ethers.constants.AddressZero}
                          onClick={() => {
                            const sendAction = async () => {
                              try {
                                const sendParams = [
                                  selectedAction,
                                  address,
                                  [contractData.fromContract, fromTokenId],
                                  [contractData.toContract, toTokenId],
                                  contractData.stateContract,
                                  castType ? castType : selectedAction,
                                ];
                                console.log("send params", sendParams);
                                const sendAction = await tx(writeContracts.ActionCollectible.sendAction(sendParams));
                                console.log("send action txn ", sendAction.hash);
                              } catch (e) {
                                console.log(e);
                              }
                            };
                            sendAction();
                          }}
                          type="primary"
                        >
                          Send action
                        </Button>
                        <Button
                          danger
                          onClick={() => {
                            const healAfterExpiry = async () => {
                              try {
                                const result = await tx(
                                  writeContracts.ActionCollectibleState.healAfterExpiry(contractData.fromContract, id),
                                );
                                console.log("send action txn ", result.hash);
                              } catch (e) {
                                console.log(e);
                              }
                            };
                            healAfterExpiry();
                          }}
                          type="primary"
                        >
                          Heal after action
                        </Button>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Actions;
