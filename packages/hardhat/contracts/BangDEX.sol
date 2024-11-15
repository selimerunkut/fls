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
 * @title BangDEX
 * @notice Contract following the interface of ISwapRouter that executes the swaps with the users in the different
 *         chains, using a linear price curve based on the utilized capacity of each token for each slot.
 *
 *         Colaborates with liquidators that are the ones that later (probably asynchronously and cross-chain) will
 *         liquidate the tokens.
 */
contract BangDEX is ISwapRouter, AccessControl {
  using SafeERC20 for IERC20Metadata;
  using Math for uint256;

  bytes32 public constant SET_SLOT_SIZE_ROLE = keccak256("SET_SLOT_SIZE_ROLE");
  bytes32 public constant MARKET_ADMIN_ROLE = keccak256("MARKET_ADMIN_ROLE");
  bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");
  bytes32 public constant LIQUIDATOR_ADMIN_ROLE = keccak256("LIQUIDATOR_ADMIN_ROLE");
  uint256 public constant WAD = 1e18;

  IERC20Metadata public immutable payToken;  // USDC or other token that will use to pay for the acquired tokens
  uint256 public slotSize;  // Duration in seconds of the time slots

  struct MarketState {
    uint256 minDiscount;    // in wad - Expressed as 1-d, so for 2% this should be 0.98 (simplifies math)
    uint256 discountDelta;  // maxDiscount = minDiscount - discountDelta
                            // Expressed as 1-d - in Wad
    uint256 maxCapacity;
    uint256 usedCapacity;
  }

  // Struct used to have
  type SlotIndex is uint256;  // slotSize << 128 + block.timestamp / slotSize

  // Token Address => Slot => MarketState
  mapping(IERC20Metadata => mapping (SlotIndex => MarketState)) public markets;

  mapping(IERC20Metadata => ILiquidator) public liquidators;

  IPriceOracle public priceOracle;

  error NotImplemented();

  constructor(IERC20Metadata payToken_, IPriceOracle priceOracle_, uint256 slotSize_, address admin) {
    payToken = payToken_;
    priceOracle = priceOracle_;
    slotSize = slotSize_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function _getSlotIndex(uint256 slotSize_, uint256 slot) internal pure returns (SlotIndex) {
    return SlotIndex.wrap(slotSize_ << 128 + slot);
  }

  function _getMarket(IERC20Metadata token) internal view returns (MarketState storage ret) {
    ret = markets[token][_getSlotIndex(slotSize, block.timestamp / slotSize)];
  }

  function _getDiscount(MarketState storage market, uint256 amountToBuy) internal view returns (uint256 discount) {
    // Already fails if market doesn't exist (zero div), but a custom error would be better
    discount = market.minDiscount - market.discountDelta * (market.usedCapacity + amountToBuy) / market.maxCapacity;
  }

  /**
   * @inheritdoc ISwapRouter
   */
  function exactInputSingle(
    ExactInputSingleParams calldata params
  ) external payable returns (uint256 amountOut) {
    // TODO: change to custom error
    require(msg.value == 0, "Sorry, we don't support the native token yet");
    require(params.recipient != address(0), "Recipient cannot be zero address");
    require(params.deadline >= block.timestamp, "Deadline in the past");
    require(params.amountIn > 0, "amountIn cannot be zero");

    require(IERC20Metadata(params.tokenOut) == payToken, "We can swap only against payToken");
    ILiquidator liquidator = liquidators[IERC20Metadata(params.tokenIn)];
    require(address(liquidator) != address(0), "The token is not supported");

    uint256 oraclePrice = priceOracle.getCurrentPrice(IERC20Metadata(params.tokenIn), payToken);

    MarketState storage market = _getMarket(IERC20Metadata(params.tokenIn));
    uint256 discount = _getDiscount(market, params.amountIn);

    amountOut = params.amountIn.mulDiv(oraclePrice, WAD).mulDiv(discount, WAD);

    require(amountOut >= params.amountOutMinimum, "The output amount is less minimum acceptable");

    payToken.safeTransfer(params.recipient, amountOut);
    IERC20Metadata(params.tokenIn).safeTransferFrom(msg.sender, address(liquidator), params.amountIn);
    liquidator.liquidate(params.tokenIn, params.amountIn, amountOut);
    _sendToRiskHub(IERC20Metadata(params.tokenIn), params.amountIn, amountOut);
  }

  function _sendToRiskHub(IERC20Metadata tokenIn, uint256 amountIn, uint256 amountOut) internal {
    // TODO
  }

  /**
   * @inheritdoc ISwapRouter
   */
  function exactOutputSingle(
    ExactOutputSingleParams calldata params
  ) external payable returns (uint256 amountIn) {
    // TODO - Can be implemented, just need a bit more of math...
    revert NotImplemented();
  }

  function setPriceOracle(IPriceOracle priceOracle_) external onlyRole(ORACLE_ADMIN_ROLE) {
    priceOracle = priceOracle_;
    // TODO: emit event
  }

  function setSlotSize(uint256 newSlotSize) external onlyRole(SET_SLOT_SIZE_ROLE) {
    slotSize = newSlotSize;
    // TODO: emit event
  }

  function setLiquidator(IERC20Metadata token, ILiquidator newLiquidator) external onlyRole(LIQUIDATOR_ADMIN_ROLE) {
    liquidators[token] = newLiquidator;
    // TODO: emit event
  }

  function setMarketParameters(IERC20Metadata token, uint256 slotSize_, uint256 slot, uint256 minDiscount, uint256
                               discountDelta, uint256 maxCapacity) external onlyRole(MARKET_ADMIN_ROLE) {
    SlotIndex slotIndex = _getSlotIndex(slotSize_, slot);
    MarketState storage newState = markets[token][slotIndex];
    newState.minDiscount = minDiscount;
    newState.discountDelta = discountDelta;
    newState.maxCapacity = maxCapacity;
    // usedCapacity remains unchanged. As zero if it's a new market, otherwise the previous value remains
    // TODO: emit event
  }

  /**
   * @inheritdoc ISwapRouter
   * @notice This function is not implemented
   */
  function exactOutput(ExactOutputParams calldata) external payable returns (uint256) {
    revert NotImplemented();
  }

  /**
   * @inheritdoc ISwapRouter
   * @notice This function is not implemented
   */
  function exactInput(ExactInputParams calldata) external payable returns (uint256) {
    revert NotImplemented();
  }

  /**
   * @notice This function is not implemented
   */
  function uniswapV3SwapCallback(int256, int256, bytes calldata) external pure {
    revert NotImplemented();
  }
}
