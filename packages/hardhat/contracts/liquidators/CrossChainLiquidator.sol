// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ILiquidator } from "../interfaces/ILiquidator.sol";
import { ITransferBridge } from "../interfaces/ITransferBridge.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/// @title CrossChainLiquidator.sol
/// @notice Bridges tokens to another Liquidator on another chain
contract CrossChainLiquidator is ILiquidator, AccessControl {
  ITransferBridge public transferBridge; // Address of the TransferBridge contract
  address public hubLiquidator; // Address of the liquidator in the hub chain
  uint32 public hubChainId;

  bytes32 public constant LIQUIDATOR_ADMIN_ROLE = keccak256("LIQUIDATOR_ADMIN_ROLE");

  constructor(ITransferBridge _transferBridge, address _hubLiquidator, uint32 _hubChainId, address admin) {
    require(address(_transferBridge) != address(0), "Invalid transfer bridge address");
    require(_hubLiquidator != address(0), "Invalid hub liquidator address");

    transferBridge = _transferBridge;
    hubLiquidator = _hubLiquidator;
    hubChainId = _hubChainId;
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  function liquidate(
    address asset,
    uint256 assetAmount,
    uint256 debtAmount
  ) external override onlyRole(LIQUIDATOR_ADMIN_ROLE) {
    transferBridge.transferTokenAndData(
      IERC20Metadata(asset),
      hubChainId,
      hubLiquidator,
      assetAmount,
      abi.encode(debtAmount) // TODO: Check the data
    );
  }
}
