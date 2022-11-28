import { useEffect, useState } from "react";
import { ethers } from "ethers";

const handleTokenState = number => {
  if (number === 0) {
    return "Default";
  } else if (number === 1) {
    return "Slapped";
  } else if (number === 2) {
    return "Winner";
  } else if (number === 3) {
    return "Dead";
  }
};
const handleTokenVibe = number => {
  if (number === 0) {
    return "Chill";
  } else if (number === 1) {
    return "Lust";
  } else if (number === 2) {
    return "Rage";
  } else if (number === 3) {
    return "Immune";
  }
};

export default function useLoogieState(readContracts, tokenId) {
  const [loogieState, setLoogieState] = useState();

  useEffect(() => {
    const loogieData = async () => {
      try {
        const loogiesAddress = await readContracts.ActionCollectible.address;
        const tokenStats = await readContracts.ActionCollectibleState.getTokenStats(loogiesAddress, tokenId);
        const state = tokenStats[1];
        const _loogieState = handleTokenState(state);
        setLoogieState(_loogieState);
      } catch (e) {
        console.log("loogie state error", e);
      }
    }

    void loogieData();
  }, [readContracts, tokenId]);
  return loogieState;
}
