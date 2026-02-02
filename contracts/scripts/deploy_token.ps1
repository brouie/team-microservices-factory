param(
  [Parameter(Mandatory = $true)]
  [string]$RpcUrl,
  [Parameter(Mandatory = $true)]
  [string]$PrivateKey
)

$env:RPC_URL = $RpcUrl
$env:PRIVATE_KEY = $PrivateKey

forge script script/CreateToken.s.sol:CreateToken --rpc-url $env:RPC_URL --broadcast
