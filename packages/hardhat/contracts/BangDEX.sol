// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ISwapRouter } from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IPriceOracle } from "./interfaces/IPriceOracle.sol";
import { ILiquidator } from "./interfaces/ILiquidator.sol";
import { IBridge } from "./interfaces/IBridge.sol";
import { IRiskHub } from "./interfaces/IRiskHub.sol";
import { IBangDEX } from "./interfaces/IBangDEX.sol";

/**
 * @title BangDEX
 * @notice Contract following the interface of ISwapRouter that executes the swaps with the users in the different
 *         chains, using a linear price curve based on the utilized capacity of each token for each slot.
 *
 *         Colaborates with liquidators that are the ones that later (probably asynchronously and cross-chain) will
 *         liquidate the tokens.
 */
contract BangDEX is ISwapRouter, AccessControl, IBangDEX {
  using SafeERC20 for IERC20Metadata;
  using Math for uint256;

  bytes32 public constant SET_SLOT_SIZE_ROLE = keccak256("SET_SLOT_SIZE_ROLE");
  bytes32 public constant MARKET_ADMIN_ROLE = keccak256("MARKET_ADMIN_ROLE");
  bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");
  // RISK_HUB_ROLE is the role that sends the message that were sent cross-chain from the RiskHub
  bytes32 public constant RISK_HUB_ROLE = keccak256("RISK_HUB_ROLE");
  bytes32 public constant LIQUIDATOR_ADMIN_ROLE = keccak256("LIQUIDATOR_ADMIN_ROLE");
  uint256 public constant WAD = 1e18;
  uint256 public constant DEFAULT_MARKUP = 1e18 + 2e16;  // 1.02%

  address public immutable riskHub;
  uint64 public immutable riskHubChainId;
  IERC20Metadata public immutable payToken; // USDC or other token that will use to pay for the acquired tokens
  uint256 public slotSize; // Duration in seconds of the time slots
  uint256 public markup = DEFAULT_MARKUP;

  struct MarketState {
    uint256 minDiscount; // in wad - Expressed as 1-d, so for 2% this should be 0.98 (simplifies math)
    uint256 discountDelta; // maxDiscount = minDiscount - discountDelta
    // Expressed as 1-d - in Wad
    uint256 fixedCost; // Fixed amount in USDC for each trade
    uint256 maxCapacity;
    uint256 usedCapacity;
  }

  // Struct used to have
  type SlotIndex is uint256; // slotSize << 128 + block.timestamp / slotSize

  // Token Address => Slot => MarketState
  mapping(IERC20Metadata => mapping(SlotIndex => MarketState)) public markets;

  mapping(IERC20Metadata => ILiquidator) public liquidators;

  IBridge public bridge;
  IPriceOracle public priceOracle;

  error NotImplemented();

  constructor(
    uint64 riskHubChainId_,
    address riskHub_,
    IBridge bridge_,
    IERC20Metadata payToken_,
    IPriceOracle priceOracle_,
    uint256 slotSize_,
    address admin
  ) {
    riskHub = riskHub_;
    riskHubChainId = riskHubChainId_;
    bridge = bridge_;
    payToken = payToken_;
    priceOracle = priceOracle_;
    slotSize = slotSize_;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function _getSlotIndex(uint256 slotSize_, uint256 slot) internal pure returns (SlotIndex) {
    return SlotIndex.wrap(slotSize_ << (128 + slot));
  }

  function _getMarket(IERC20Metadata token) internal view returns (MarketState storage ret) {
    ret = markets[token][_getSlotIndex(slotSize, block.timestamp / slotSize)];
  }

  function getDiscount(MarketState storage market, uint256 amountToBuy) internal view returns (uint256 discount) {
    // Already fails if market doesn't exist (zero div), but a custom error would be better
    discount = market.minDiscount - market.discountDelta.mulDiv(
      (market.usedCapacity + amountToBuy).mulDiv(market.maxCapacity, WAD)
    , WAD);
  }

  /**
   * @inheritdoc ISwapRouter
   */
  function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut) {
    // TODO: change to custom error
    require(msg.value == 0, "Sorry, we don't support the native token yet");
    require(params.recipient != address(0), "Recipient cannot be zero address");
    require(params.deadline >= block.timestamp, "Deadline in the past");
    require(params.amountIn > 0, "amountIn cannot be zero");

    require(IERC20Metadata(params.tokenOut) == payToken, "We can swap only against payToken");
    ILiquidator liquidator = liquidators[IERC20Metadata(params.tokenIn)];
    require(address(liquidator) != address(0), "The token is not supported");

    amountOut = computeAmountOut(IERC20Metadata(params.tokenIn), params.amountIn);

    require(amountOut >= params.amountOutMinimum, "The output amount is less minimum acceptable");

    payToken.safeTransfer(params.recipient, amountOut);
    IERC20Metadata(params.tokenIn).safeTransferFrom(msg.sender, address(liquidator), params.amountIn);
    // Apply the markup in the value sent to the liquidator
    liquidator.liquidate(params.tokenIn, params.amountIn, amountOut.mulDiv(markup, WAD));
    _notifyTradeToRiskHub(IERC20Metadata(params.tokenIn), params.amountIn, amountOut);
  }

  function computeAmountOut(IERC20Metadata tokenIn, uint256 amountIn) public view returns (uint256 amountOut) {
    uint256 oraclePrice = priceOracle.getCurrentPrice(tokenIn, payToken);

    MarketState storage market = _getMarket(tokenIn);
    uint256 discount = getDiscount(market, amountIn);

    return amountIn.mulDiv(oraclePrice, WAD).mulDiv(discount, WAD) - market.fixedCost;
  }

  function _notifyTradeToRiskHub(IERC20Metadata tokenIn, uint256 amountIn, uint256 amountOut) internal {
    bytes memory message = abi.encodeWithSelector(
      IRiskHub.tradeFromDex.selector,
      block.chainid,
      block.timestamp,
      tokenIn,
      amountIn,
      amountOut
    );
    bridge.callCrossChain(riskHubChainId, riskHub, message);
  }

  function sendToRiskHub(uint256 amount) external onlyRole(RISK_HUB_ROLE) {
    payToken.approve(address(bridge), amount);
    bridge.transferToken(payToken, riskHubChainId, riskHub, amount);
  }

  /**
   * @inheritdoc ISwapRouter
   */
  function exactOutputSingle(ExactOutputSingleParams calldata) external payable returns (uint256) {
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

  function setMarkup(uint256 newMarkup) external onlyRole(SET_SLOT_SIZE_ROLE) {
    markup = newMarkup;
    // TODO: emit event
  }

  function setLiquidator(IERC20Metadata token, ILiquidator newLiquidator) external onlyRole(LIQUIDATOR_ADMIN_ROLE) {
    liquidators[token] = newLiquidator;
    // TODO: emit event
  }

  function setMarketParameters(
    IERC20Metadata token,
    uint256 slotSize_,
    uint256 slot,
    uint256 minDiscount,
    uint256 discountDelta,
    uint256 maxCapacity,
    uint256 fixedCost
  ) external onlyRole(MARKET_ADMIN_ROLE) {
    SlotIndex slotIndex = _getSlotIndex(slotSize_, slot);
    MarketState storage newState = markets[token][slotIndex];
    newState.minDiscount = minDiscount;
    newState.discountDelta = discountDelta;
    newState.maxCapacity = maxCapacity;
    newState.fixedCost = fixedCost;
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
