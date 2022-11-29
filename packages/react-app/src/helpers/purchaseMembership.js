const abis = require("@unlock-protocol/contracts");
const { ethers } = require("ethers");

export default async function purchaseMembership(userSigner, address, publicLockAddress) {
  const publicLockContract = new ethers.Contract(publicLockAddress, abis.PublicLockV12.abi, userSigner);
  const amount = await publicLockContract.keyPrice();
  const purchaseParams = [
    [amount],
    [address], // receipt
    ["0xCA7632327567796e51920F6b16373e92c7823854"], // UDT receiver (referrer),
    [ethers.constants.AddressZero],
    [[]], //additional data if any
  ];

  let options = {
    value: amount
  };
  try {
    const txn = await publicLockContract.purchase(...purchaseParams, options);
  } catch (e) {
    console.log("error purchasing membership ", e);
  }
}
