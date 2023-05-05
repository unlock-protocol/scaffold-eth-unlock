// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.15;

interface ISimpleBridge {
  function xTransfer (
    address token,
    uint256 amount, 
    address recipient, 
    uint32 destinationDomain,
    uint256 slippage, 
    uint256 relayerFee
  ) external payable;

  function xTransferEth (
    address destinationUnwrapper,
    address weth,
    uint256 amount,
    address recipient,
    uint32 destinationDomain,
    uint256 slippage,
    uint256 relayerFee
  ) external payable;

}