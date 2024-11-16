// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IRemoteCallBridge {
  function callCrossChain(uint64 chainId, address target, bytes calldata data) external;
}
