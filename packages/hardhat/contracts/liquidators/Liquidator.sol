// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ILiquidator.sol";

/// @title Liquidator
/// @notice Base implementation for liquidating tokens into USDC.
abstract contract Liquidator is ILiquidator, Ownable, ReentrancyGuard {
    // Address of the USDC token used for swaps
    address public immutable override usdcToken;

    // Address of the RiskHub contract
    address public override riskHub;

    // Events for logging actions
    event RiskHubUpdated(address indexed newRiskHub);

    /**
     * @dev Constructor for setting the USDC token address.
     * @param _usdcToken Address of the USDC token.
     */
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid USDC address");
        usdcToken = _usdcToken;
    }

    /**
     * @notice Sets the RiskHub address. Only callable by the owner.
     * @param _riskHub Address of the new RiskHub.
     */
    function setRiskHub(address _riskHub) external override onlyOwner {
        require(_riskHub != address(0), "Invalid RiskHub address");
        riskHub = _riskHub;
        emit RiskHubUpdated(_riskHub);
    }

    /**
     * @notice Abstract function to handle token liquidation.
     * To be implemented by child contracts.
     * @param token Address of the token being liquidated.
     * @param amount Amount of tokens to liquidate.
     */
    function receiveTokens(address token, uint256 amount)
        external
        virtual
        override;

    /**
     * @notice Returns the address of the USDC token.
     * @return Address of the USDC token.
     */
    function getUsdcAddress() external view override returns (address) {
        return usdcToken;
    }

    /**
     * @notice Returns the address of the RiskHub.
     * @return Address of the RiskHub.
     */
    function getRiskHubAddress() external view override returns (address) {
        return riskHub;
    }
}
