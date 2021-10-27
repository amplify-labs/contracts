// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

contract AMPTChild {

    /// @notice EIP-20 token name for this token
    string public constant name = "Amplify Token";

    /// @notice EIP-20 token symbol for this token
    string public constant symbol = "AMPT";

    /// @notice EIP-20 token decimals for this token
    uint8 public constant decimals = 18;

    /// @notice Total number of tokens in circulation
    uint256 public totalSupply;

    /// @dev Allowance amounts on behalf of others
    mapping (address => mapping (address => uint256)) internal allowances;

    /// @dev Official record of token balances for each account
    mapping (address => uint256) internal balances;

    /// @dev A record of each account's delegate
    mapping (address => address) public delegates;

    /// @notice A checkpoint for marking number of votes from a given block
    struct Checkpoint {
        uint256 fromBlock;
        uint256 votes;
    }

    // keeping it for checking, whether deposit being called by valid address or not
    address public childChainManagerProxy;
    address deployer;

    /// @notice A record of votes checkpoints for each account, by index
    mapping (address => mapping (uint256 => Checkpoint)) public checkpoints;

    /// @notice The number of checkpoints for each account
    mapping (address => uint256) public numCheckpoints;

    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");

    /// @notice The EIP-712 typehash for the delegation struct used by the contract
    bytes32 public constant DELEGATION_TYPEHASH = keccak256("Delegation(address delegatee,uint256 nonce,uint256 expiry)");

    /// @notice A record of states for signing / validating signatures
    mapping (address => uint256) public nonces;

    /// @notice An event that's emitted when an account changes their delegate
    event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);

    /// @notice An event that's emitted when a delegate account's vote balance changes
    event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance);

    /// @notice The standard EIP-20 transfer event
    event Transfer(address indexed from, address indexed to, uint256 amount);

    /// @notice The standard EIP-20 approval event
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    /// @dev A constant to be used in comparing
    uint256 internal constant MAX_UINT256 = 2**256 - 1;

    /**
     * @notice Construct a new AMPT token
     * @param _childChainManagerProxy The initial account for proxy
     */
    constructor(address _childChainManagerProxy) {
        require(_childChainManagerProxy != address(0), "Bad ChildChainManagerProxy address");
        childChainManagerProxy = _childChainManagerProxy;
        deployer = msg.sender;
    }

    // being proxified smart contract, most probably childChainManagerProxy contract's address
    // is not going to change ever, but still, lets keep it 
    function updateChildChainManager(address newChildChainManagerProxy) external {
        require(newChildChainManagerProxy != address(0), "Bad ChildChainManagerProxy address");
        require(msg.sender == deployer, "You're not allowed");

        childChainManagerProxy = newChildChainManagerProxy;
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     * - `to` cannot be the zero address.
     */
    function deposit(address user, bytes calldata depositData) external {
        require(msg.sender == childChainManagerProxy, "You're not allowed to deposit");
        require(user != address(0), "AMPT::deposit: cannot transfer from the zero address");
        
        uint256 amount = abi.decode(depositData, (uint256));

        // `amount` token getting minted here & equal amount got locked in RootChainManager
        totalSupply +=  amount;
        balances[user] += amount;
        
        emit Transfer(address(0), user, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        balances[msg.sender] = safeSub(balances[msg.sender], amount, "ERC20: burn amount exceeds balance");
        totalSupply = safeSub(totalSupply, amount, "AMPT::withdraw: update total suply failed");
        
        emit Transfer(msg.sender, address(0), amount);
    }
