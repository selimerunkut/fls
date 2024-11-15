// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

// The BangPool is responsible for getting the quote of a token
interface BangPool {
    function getPrice(address token) external view returns (uint256);
}
