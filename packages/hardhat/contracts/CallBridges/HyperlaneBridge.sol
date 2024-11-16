// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {CallLib} from "@hyperlane-xyz/core/contracts/middleware/libs/Call.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";
import {IBridge} from "../interfaces/IBridge.sol";

interface IInterchainAccountRouter {
  function callRemote(
    uint32 _destinationDomain,
    CallLib.Call[] calldata calls
  ) external returns (bytes32);

  function getRemoteInterchainAccount(uint32 _destination, address _owner)
  external
  view
  returns (address);
}

contract HyperlaneCallBridge is IBridge {
  IInterchainAccountRouter public interchainAccountRouter;
  IInterchainAccountRouter public interchainAccountRouter;

  constructor(IInterchainAccountRouter _interchainAccountRouter) {
    interchainAccountRouter = _interchainAccountRouter;
  }

  function getRemoteInterchainAccount(uint32 _destination) public view returns (address) {
    return interchainAccountRouter.getRemoteInterchainAccount(_destination, address(this));
  }

  function callCrossChain(uint32 chainId, address target, bytes calldata data) external {
    // TODO: Check if it's the chainId
    interchainAccountRouter.callRemote(chainId, CallLib.Call({
    to: TypeCasts.addressToBytes32(address(target)),
    data: data,
    value: 0
    }));
  }
}
