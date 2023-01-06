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
      CLAIM ENS
    </div>
  );
}

export default Actions;
