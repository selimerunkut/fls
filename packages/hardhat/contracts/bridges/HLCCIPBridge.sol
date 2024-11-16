// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IRouterClient } from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import { HyperlaneRemoteCallBridge, IInterchainAccountRouter } from "./HyperlaneRemoteCallBridge.sol";
import { CCIPBridge } from "./CCIPBridge.sol";

contract HLCCIPBridge is HyperlaneRemoteCallBridge, CCIPBridge {
  constructor(
    IRouterClient ccipRouter_,
    IERC20Metadata linkToken_,
    address admin,
    IInterchainAccountRouter _interchainAccountRouter
  ) CCIPBridge(ccipRouter_, linkToken_, admin) HyperlaneRemoteCallBridge(_interchainAccountRouter) {}
}
