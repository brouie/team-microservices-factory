# Contracts

Planned stack: Solidity + Foundry.

## Next Steps
- Implement bonding-curve token via Mint Club V2.
- Add access-gating interface for gateway checks.

## Mint Club V2
- Config: `contracts/src/MintClubConfig.sol`
- Script skeleton: `contracts/script/CreateToken.s.sol`
- Token-gating interface: `contracts/src/IAccessToken.sol`

## Foundry (local)
1. Install Foundry: `https://book.getfoundry.sh/getting-started/installation`
2. Set env vars:
   - `PRIVATE_KEY` (deployer, Base)
   - `RPC_URL` (Base RPC)
3. Run script:
   - `forge script script/CreateToken.s.sol:CreateToken --rpc-url $RPC_URL --broadcast`
