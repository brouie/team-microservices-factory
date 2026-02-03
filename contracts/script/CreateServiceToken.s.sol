// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ServiceTokenFactory.sol";

contract CreateServiceToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("FACTORY_ADDRESS");
        string memory serviceId = vm.envString("SERVICE_ID");
        string memory tokenName = vm.envString("TOKEN_NAME");
        string memory tokenSymbol = vm.envString("TOKEN_SYMBOL");
        address serviceOwner = vm.envAddress("SERVICE_OWNER");
        
        vm.startBroadcast(deployerPrivateKey);
        
        ServiceTokenFactory factory = ServiceTokenFactory(factoryAddress);
        address tokenAddress = factory.createToken(serviceId, tokenName, tokenSymbol, serviceOwner);
        
        vm.stopBroadcast();
        
        console.log("ServiceToken created at:", tokenAddress);
        console.log("Service ID:", serviceId);
    }
}
