// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IBridge} from "./interfaces/IBridge.sol";

/// @title MockBridge
/// @notice A mock implementation of the IBridge interface for testing purposes.
contract MockBridge is IBridge {
    event TokenTransferred(
        address indexed token,
        uint32 indexed chainId,
        address indexed target,
        uint256 amount
    );

    event TokenTransferredWithData(
        address indexed token,
        uint32 indexed chainId,
        address indexed target,
        uint256 amount,
        bytes data
    );

    event CrossChainCalled(
        uint32 indexed chainId,
        address indexed target,
        bytes data
    );

    /// @notice Mock implementation of transferToken
    /// @param token The token to transfer
    /// @param chainId The chain ID to transfer the token to
    /// @param target The target address on the destination chain
    /// @param amount The amount of tokens to transfer
    function transferToken(
        IERC20Metadata token,
        uint32 chainId,
        address target,
        uint256 amount
    ) external override {
        emit TokenTransferred(address(token), chainId, target, amount);
    }

    /// @notice Mock implementation of transferTokenAndData
    /// @param token The token to transfer
    /// @param chainId The chain ID to transfer the token to
    /// @param target The target address on the destination chain
    /// @param amount The amount of tokens to transfer
    /// @param data Additional data to send with the transfer
    function transferTokenAndData(
        IERC20Metadata token,
        uint32 chainId,
        address target,
        uint256 amount,
        bytes calldata data
    ) external override {
        emit TokenTransferredWithData(address(token), chainId, target, amount, data);
    }

    /// @notice Mock implementation of callCrossChain
    /// @param chainId The chain ID to call on
    /// @param target The target contract address on the destination chain
    /// @param data The calldata to send to the target contract
    function callCrossChain(
        uint32 chainId,
        address target,
        bytes calldata data
    ) external override {
        emit CrossChainCalled(chainId, target, data);
    }
}
