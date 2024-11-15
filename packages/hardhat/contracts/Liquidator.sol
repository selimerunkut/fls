// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface Liquidator {
    // The Liquidator is responsible for selling the asset to recover at least the debt (if possible)
    function liquidate(address asset, uint256 assetAmount, uint256 debtAmount) external;
}
