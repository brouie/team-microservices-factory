// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import {MintClubConfig} from "../src/MintClubConfig.sol";

interface IMCV2Bond {
    struct TokenParams {
        string name;
        string symbol;
    }

    struct BondParams {
        uint16 mintRoyalty;
        uint16 burnRoyalty;
        address reserveToken;
        uint128 maxSupply;
        uint128[] stepRanges;
        uint128[] stepPrices;
    }

    function createToken(
        TokenParams calldata tokenParams,
        BondParams calldata bondParams
    ) external payable returns (address token);
}

/// @notice Script skeleton for creating a bonding-curve token on Mint Club V2.
contract CreateToken is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        IMCV2Bond.TokenParams memory tokenParams = IMCV2Bond.TokenParams({
            name: "Microservices Factory",
            symbol: "MSF"
        });

        uint128[] memory stepRanges = new uint128[](3);
        stepRanges[0] = 100_000 ether;
        stepRanges[1] = 500_000 ether;
        stepRanges[2] = 1_000_000 ether;

        uint128[] memory stepPrices = new uint128[](3);
        stepPrices[0] = 0.001 ether;
        stepPrices[1] = 0.005 ether;
        stepPrices[2] = 0.01 ether;

        IMCV2Bond.BondParams memory bondParams = IMCV2Bond.BondParams({
            mintRoyalty: 100,
            burnRoyalty: 100,
            reserveToken: MintClubConfig.OPENWORK,
            maxSupply: 1_000_000 ether,
            stepRanges: stepRanges,
            stepPrices: stepPrices
        });

        IMCV2Bond(MintClubConfig.MCV2_BOND).createToken(tokenParams, bondParams);

        vm.stopBroadcast();
    }
}
