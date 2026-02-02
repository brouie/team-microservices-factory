// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal ERC20 interface for token-gated API checks.
interface IAccessToken {
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}
