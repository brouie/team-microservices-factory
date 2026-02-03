# Contracts

Stack: Solidity + Foundry.

## Contracts

### ServiceToken
ERC20 token with linear bonding curve for service access gating.

Features:
- Linear bonding curve: price = BASE_PRICE + (supply * PRICE_SLOPE)
- Buy/sell tokens with ETH
- Slippage protection
- Access gating via `hasAccess(address)` or `balanceOf(address)`

### ServiceTokenFactory
Factory contract for deploying ServiceToken contracts per microservice.

Features:
- Deploy new tokens per service ID
- Track all deployed tokens
- Prevent duplicate tokens for same service

### IAccessToken
Minimal interface for token-gating checks in the gateway.

## Deployment

### Prerequisites
1. Install Foundry: `https://book.getfoundry.sh/getting-started/installation`
2. Set environment variables:
   - `PRIVATE_KEY` (deployer wallet)
   - `RPC_URL` (Base RPC endpoint)

### Deploy Factory
```bash
forge script script/CreateToken.s.sol:CreateToken --rpc-url $RPC_URL --broadcast
```

PowerShell:
```powershell
./scripts/deploy_token.ps1 -RpcUrl $RPC_URL -PrivateKey $PRIVATE_KEY
```

## Bonding Curve Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| BASE_PRICE | 0.001 ETH | Starting price per token |
| PRICE_SLOPE | 0.0001 ETH | Price increase per token |
| MAX_SUPPLY | 1,000,000 | Maximum token supply |

## Integration

Gateway queries `balanceOf(wallet)` to check access:
- If balance > 0, user has access to the service API
- Users buy tokens via `buy(minTokens)` with ETH
- Users sell tokens via `sell(amount, minPayout)` for ETH
