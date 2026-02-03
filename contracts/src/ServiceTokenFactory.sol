// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ServiceToken.sol";

/// @title ServiceTokenFactory
/// @notice Factory for deploying ServiceToken contracts for new microservices.
contract ServiceTokenFactory {
    event TokenCreated(
        string indexed serviceId,
        address tokenAddress,
        address serviceOwner
    );

    mapping(string => address) public serviceTokens;
    address[] public allTokens;

    /// @notice Deploy a new ServiceToken for a given service
    /// @param serviceId Unique identifier for the service
    /// @param name Token name
    /// @param symbol Token symbol
    /// @param serviceOwner Address of the service owner
    function createToken(
        string calldata serviceId,
        string calldata name,
        string calldata symbol,
        address serviceOwner
    ) external returns (address) {
        require(serviceTokens[serviceId] == address(0), "Token already exists for service");
        require(serviceOwner != address(0), "Invalid service owner");

        ServiceToken token = new ServiceToken(name, symbol, serviceId, serviceOwner);
        address tokenAddress = address(token);

        serviceTokens[serviceId] = tokenAddress;
        allTokens.push(tokenAddress);

        emit TokenCreated(serviceId, tokenAddress, serviceOwner);
        return tokenAddress;
    }

    /// @notice Get the token address for a service
    function getTokenForService(string calldata serviceId) external view returns (address) {
        return serviceTokens[serviceId];
    }

    /// @notice Get all deployed token addresses
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /// @notice Get total number of deployed tokens
    function tokenCount() external view returns (uint256) {
        return allTokens.length;
    }
}
