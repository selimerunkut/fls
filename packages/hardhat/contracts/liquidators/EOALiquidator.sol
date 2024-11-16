// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ILiquidator } from "../interfaces/ILiquidator.sol";

/// @title EOALiquidator.sol
/// @notice Sends the tokens to another address (an EOA) and we prey that EOA isn't corrupt and behaves well and
//          liquidates the token sending the results to the RiskHub
contract EOALiquidator is ILiquidator, AccessControl {
  using SafeERC20 for IERC20;

  bytes32 public constant EOA_ADMIN_ROLE = keccak256("EOA_ADMIN_ROLE");

  address public eoa;

  event EOAChanged(address indexed newEOA, address indexed oldEOA);
  event TokensToLiquidate(address indexed eoa, address indexed asset, uint256 assetAmount, uint256 debtAmount);

  /// @param eoa_ Address of the EOA that will perform the liquidation
  /// @param admin Address of the administrator of the contract
  constructor(address eoa_, address admin) {
    require(eoa_ != address(0), "Must define an EOA");
    eoa = eoa_;
    emit EOAChanged(eoa_, address(0));
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function setEOA(address newEOA) external onlyRole(EOA_ADMIN_ROLE) {
    emit EOAChanged(newEOA, eoa);
    eoa = newEOA;
  }

  /// @inheritdoc ILiquidator
  /// @notice Sells the received `asset` for USDC via Uniswap and sends the USDC to RiskHub.
  /// @param asset Address of the token to liquidate
  /// @param assetAmount Amount of the token to liquidate
  /// @param debtAmount Minimum USDC required to cover the debt
  function liquidate(
    address asset,
    uint256 assetAmount,
    uint256 debtAmount
  ) external override {
    IERC20(asset).safeTransfer(eoa, assetAmount);
    emit TokensToLiquidate(eoa, asset, assetAmount, debtAmount);
  }
}
