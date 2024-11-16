// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface ITransferBridge {
  function transferToken(IERC20Metadata token, uint64 chainId, address target, uint256 amount) external;

  function transferTokenAndData(IERC20Metadata token, uint64 chainId, address target, uint256 amount, bytes calldata
    data) external;
}
