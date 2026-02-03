// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IAccessToken.sol";

/// @title ServiceToken
/// @notice ERC20 token with linear bonding curve for service access gating.
/// @dev Price increases linearly with supply: price = BASE_PRICE + (supply * PRICE_SLOPE)
contract ServiceToken is IAccessToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Bonding curve parameters
    uint256 public constant BASE_PRICE = 0.001 ether;
    uint256 public constant PRICE_SLOPE = 0.0001 ether;
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    address public immutable serviceOwner;
    string public serviceId;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 payout);

    constructor(string memory _name, string memory _symbol, string memory _serviceId, address _serviceOwner) {
        name = _name;
        symbol = _symbol;
        serviceId = _serviceId;
        serviceOwner = _serviceOwner;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    /// @notice Calculate current price per token based on bonding curve
    function currentPrice() public view returns (uint256) {
        return BASE_PRICE + (totalSupply * PRICE_SLOPE / 10**18);
    }

    /// @notice Calculate cost to buy a given amount of tokens
    /// @param amount Number of tokens to buy (in wei units)
    function calculateBuyCost(uint256 amount) public view returns (uint256) {
        uint256 startSupply = totalSupply;
        uint256 endSupply = startSupply + amount;
        
        // Integral of linear curve: area under the curve
        uint256 startPrice = BASE_PRICE + (startSupply * PRICE_SLOPE / 10**18);
        uint256 endPrice = BASE_PRICE + (endSupply * PRICE_SLOPE / 10**18);
        
        // Average price * amount
        return ((startPrice + endPrice) * amount) / (2 * 10**18);
    }

    /// @notice Calculate payout for selling a given amount of tokens
    /// @param amount Number of tokens to sell (in wei units)
    function calculateSellPayout(uint256 amount) public view returns (uint256) {
        require(totalSupply >= amount, "Insufficient supply");
        
        uint256 startSupply = totalSupply;
        uint256 endSupply = startSupply - amount;
        
        uint256 startPrice = BASE_PRICE + (startSupply * PRICE_SLOPE / 10**18);
        uint256 endPrice = BASE_PRICE + (endSupply * PRICE_SLOPE / 10**18);
        
        return ((startPrice + endPrice) * amount) / (2 * 10**18);
    }

    /// @notice Buy tokens with ETH
    /// @param minTokens Minimum tokens to receive (slippage protection)
    function buy(uint256 minTokens) external payable {
        require(msg.value > 0, "Must send ETH");
        
        // Binary search for tokens that can be bought with msg.value
        uint256 low = 0;
        uint256 high = MAX_SUPPLY - totalSupply;
        uint256 tokens = 0;
        
        while (low <= high) {
            uint256 mid = (low + high) / 2;
            uint256 cost = calculateBuyCost(mid);
            
            if (cost <= msg.value) {
                tokens = mid;
                low = mid + 1;
            } else {
                if (mid == 0) break;
                high = mid - 1;
            }
        }
        
        require(tokens >= minTokens, "Slippage exceeded");
        require(totalSupply + tokens <= MAX_SUPPLY, "Max supply exceeded");
        
        uint256 cost = calculateBuyCost(tokens);
        totalSupply += tokens;
        _balances[msg.sender] += tokens;
        
        emit Transfer(address(0), msg.sender, tokens);
        emit TokensPurchased(msg.sender, tokens, cost);
        
        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }

    /// @notice Sell tokens for ETH
    /// @param amount Number of tokens to sell
    /// @param minPayout Minimum ETH to receive (slippage protection)
    function sell(uint256 amount, uint256 minPayout) external {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        uint256 payout = calculateSellPayout(amount);
        require(payout >= minPayout, "Slippage exceeded");
        require(address(this).balance >= payout, "Insufficient contract balance");
        
        _balances[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Transfer(msg.sender, address(0), amount);
        emit TokensSold(msg.sender, amount, payout);
        
        payable(msg.sender).transfer(payout);
    }

    /// @notice Check if an address has access (holds tokens)
    function hasAccess(address account) external view returns (bool) {
        return _balances[account] > 0;
    }

    /// @notice Get contract ETH balance
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
