// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { ITransferBridge } from "./ITransferBridge.sol";
import { IRemoteCallBridge } from "./IRemoteCallBridge.sol";

interface IBridge is IRemoteCallBridge, ITransferBridge {}
