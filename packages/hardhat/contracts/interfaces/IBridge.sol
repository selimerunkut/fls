// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { ITransferBridge } from "./ITransferBridge.sol";
import { IRemoteCallBridge } from "./IRemoteCallBridge.sol";

// solhint-disable-next-line no-empty-blocks
interface IBridge is IRemoteCallBridge, ITransferBridge {}
