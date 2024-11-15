// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IPriceOracle} from "./interfaces/IPriceOracle.sol";
import {ILiquidator} from "./interfaces/ILiquidator.sol";

/**
 * @title RiskHub
 * @notice Contract that actually concentrates the risk of all the Bang protocol, receiving notification of
 *         swaps from different chains and refunding them.
 */
contract RiskHub is AccessControl {
  using SafeERC20 for IERC20Metadata;

  bytes32 public constant DEX_ADMIN_ROLE = keccak256("DEX_ADMIN_ROLE");
  bytes32 public constant DEX_LIQUIDITY_ROLE = keccak256("DEX_LIQUIDITY_ROLE");
  bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE");
  bytes32 public constant DEX_MESSENGER_ROLE = keccak256("DEX_MESSENGER_ROLE");
  uint256 public constant WAD = 1e18;

  IERC20Metadata public immutable payToken;  // USDC or other token that will use to pay for the acquired tokens

  struct DEX {
    address bangDex;
    uint32 slotSize;
  }

  // Token chainId => DEX
  mapping(uint32 => DEX) public dexes;

  error NotImplemented();

  constructor(IERC20Metadata payToken_, address admin) {
    payToken = payToken_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function addDex(uint32 chainId, address bangDex, uint32 slotSize) external onlyRole(DEX_ADMIN_ROLE) {
    dexes[chainId].bangDex = bangDex;
    dexes[chainId].slotSize = slotSize;
  }

  function withdraw(uint256 amount, address destination) external onlyRole(WITHDRAW_ROLE) {
    payToken.safeTransfer(destination, amount);
  }

  function deposit(uint256 amount) external {
    payToken.safeTransferFrom(msg.sender, address(this), amount);
  }

  /**
   * Sends money to a DEX to increase its liquidity
   */
  function sendToDex(uint32 chainId, uint256 amount) external onlyRole(DEX_LIQUIDITY_ROLE) {
    // TODO
  }

  function withdrawFromDex(uint32 chainId, uint256 amount) external onlyRole(DEX_LIQUIDITY_ROLE) {
    // TODO
  }

  /**
   * Called from a DEX when a trade happens
   */
  function tradeFromDex(uint32 chainId, uint40 timestamp, IERC20Metadata tokenIn, uint256 amountIn, uint256 amountOut)
  external onlyRole(DEX_MESSENGER_ROLE) {
    // TODO
  }
}
