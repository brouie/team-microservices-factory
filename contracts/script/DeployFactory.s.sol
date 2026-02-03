// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ServiceTokenFactory.sol";

contract DeployFactory is Script {
    function run() external returns (ServiceTokenFactory) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        ServiceTokenFactory factory = new ServiceTokenFactory();
        
        vm.stopBroadcast();
        
        console.log("ServiceTokenFactory deployed to:", address(factory));
        
        return factory;
    }
}
