// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILiquidator} from "./interfaces/ILiquidator.sol";
import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

/// @title ArbitrumLiquidator
/// @notice Liquidates tokens into USDC using Uniswap on Arbitrum.
contract ArbitrumLiquidator is ILiquidator {
    using SafeERC20 for IERC20;

    ISwapRouter public immutable swapRouter; // Uniswap V3 Router address
    address public immutable usdcToken;      // Address of USDC token
    address public immutable riskHub;        // Address of RiskHub contract

    uint24 public constant poolFee = 3000;   // Uniswap pool fee (0.3%)

    /// @param _swapRouter Address of the Uniswap V3 Router
    /// @param _usdcToken Address of the USDC token on Arbitrum
    /// @param _riskHub Address of the RiskHub contract
    constructor(address _swapRouter, address _usdcToken, address _riskHub) {
        require(_swapRouter != address(0), "Invalid router address");
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_riskHub != address(0), "Invalid RiskHub address");

        swapRouter = ISwapRouter(_swapRouter);
        usdcToken = _usdcToken;
        riskHub = _riskHub;
    }

    /// @inheritdoc ILiquidator
    /// @notice Sells the received `asset` for USDC via Uniswap and sends the USDC to RiskHub.
    /// @param asset Address of the token to liquidate
    /// @param assetAmount Amount of the token to liquidate
    /// @param debtAmount Minimum USDC required to cover the debt
    function liquidate(address asset, uint256 assetAmount, uint256 debtAmount) external override {
        require(asset != address(0), "Invalid asset address");
        require(assetAmount > 0, "Asset amount must be greater than zero");

        // Approve the Uniswap router to spend the asset
        IERC20(asset).safeApprove(address(swapRouter), assetAmount);

        // Define the swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: asset,
            tokenOut: usdcToken,
            fee: poolFee,
            recipient: address(this), // USDC stays in the contract temporarily
            deadline: block.timestamp,
            amountIn: assetAmount,
            amountOutMinimum: debtAmount,
            sqrtPriceLimitX96: 0 // No price limit
        });

        // Execute the swap on Uniswap
        uint256 usdcReceived = swapRouter.exactInputSingle(params);
        require(usdcReceived >= debtAmount, "Insufficient USDC received");

        // Transfer the USDC to the RiskHub
        IERC20(usdcToken).safeTransfer(riskHub, usdcReceived);
    }
}
