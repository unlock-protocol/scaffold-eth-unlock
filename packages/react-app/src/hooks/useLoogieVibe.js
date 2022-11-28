import { useEffect, useState } from "react";

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

          // const loogiesAddress = await readContracts.ActionCollectible.address;
          // const tokenStats = await readContracts.ActionCollectibleState.getTokenStats(loogiesAddress, tokenId);
          // const strength = await readContracts.ActionCollectibleState.getStrength(loogiesAddress, tokenId);

export default function useLoogieVibe(readContracts, tokenId) {
  const [loogieVibe, setLoogieVibe] = useState();

  useEffect(() => {
    const loogieData = async () => {
      try {
        const loogiesAddress = await readContracts.ActionCollectible.address;
        const tokenStats = await readContracts.ActionCollectibleState.getTokenStats(loogiesAddress, tokenId);
        const vibe = tokenStats[2];
        const _loogieVibe = handleTokenVibe(vibe);
        setLoogieVibe(_loogieVibe);
      } catch (e) {
        console.log("loogie vibe error", e);
      }
    }

    void loogieData();
  }, [readContracts, tokenId]);
  return loogieVibe;
}
