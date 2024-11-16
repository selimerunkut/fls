// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IRiskHub {
  function tradeFromDex(uint64 chainId, uint40 timestamp, IERC20Metadata tokenIn, uint256 amountIn, uint256 amountOut)
  external;
}
