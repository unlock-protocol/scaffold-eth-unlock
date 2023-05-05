import { useEffect, useState } from "react";

export default function useLoogieStrength(readContracts, tokenId) {
  const [loogieStrength, setLoogieStrength] = useState();
  
  useEffect(() => {
    const loogieData = async () => {
      try {
        const loogiesAddress = await readContracts.ActionCollectible.address;
        const strength = await readContracts.ActionCollectibleState.getStrength(loogiesAddress, tokenId);

        setLoogieStrength(strength);
      } catch (e) {
        console.log("loogie strength error", e);
      }
    }
    void loogieData();
  }, [readContracts, tokenId]);
  return loogieStrength;
}
