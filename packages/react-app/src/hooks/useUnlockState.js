import { useState, useEffect } from "react";
/*
  ~ What it does? ~
  Checks whether an address has valid key to a lock.
  ~ How can I use ? ~
  const myConst = useUnlockState(publicLock, address);

  ~ Features ~
  - checks address for valid key to the lock
  - Returns a boolean: true/false
*/

const useUnlockState = (publicLock, address) => {
  const [hasValidKey, sethasValidKey] = useState({});

  useEffect(() => {
    const loadFunc = async () => {
      if (publicLock) {
        const result = await publicLock.getHasValidKey(address);
        sethasValidKey(result);
      }
    };
    void loadFunc();
  }, [publicLock, address]);
  return hasValidKey;
};
export default useUnlockState;