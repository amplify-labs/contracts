// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./PoolToken.sol";

interface PoolInterface {
    function deposit(uint256 amount) external returns (bool success);
    function withdraw(uint256 _tokenAmount) external returns (bool success);
    function totalDeposited() external view returns (uint256);
    function totalBorrowed() external view returns (uint256);

    event Deposited(address indexed _from, uint256 _amount);
    event Withdrawn(address indexed _from, uint256 _amount);
}

abstract contract PoolStorage is PoolInterface, Context {
    string public name;
    string public structureType;
    address public stableCoin;
    uint256 public minDeposit;
    PoolToken public lpToken;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public lockedTokens;

    function isStructured(string memory structure)
        internal
        pure
        returns (bool)
    {
        return
            keccak256(bytes(structure)) == keccak256(bytes("factoring")) ||
            keccak256(bytes(structure)) == keccak256(bytes("discounting"));
    }
}

contract Pool is PoolStorage {
    using SafeMath for uint256;

    uint256 private _totalDeposited;
    uint256 private _totalBorrowed;

    constructor(
        string memory name_,
        string memory structureType_,
        address stableCoin_,
        uint256 minDeposit_
    ) {
        require(isStructured(structureType_));

        name = name_;
        minDeposit = minDeposit_;
        structureType = structureType_;
        stableCoin = stableCoin_;

        ERC20 token = ERC20(stableCoin);
        string memory lpTokenSymbol = createPoolTokenSymbol(
            "lp",
            token.symbol()
        );
        lpToken = new PoolToken("PoolToken", lpTokenSymbol);
    }

    function deposit(uint256 amount) external override returns (bool success) {
        require(amount >= minDeposit, "deposit: Amount lower than minDeposit");
        
        ERC20 token = ERC20(stableCoin);
        require(token.balanceOf(_msgSender()) >= amount, "ERC20: Insufficient funds");
        require(token.transferFrom(_msgSender(), address(this), amount), "ERC20: Transfer failed");

        balances[_msgSender()] = balances[_msgSender()].add(amount);
        _totalDeposited = _totalDeposited.add(amount);
        lockedTokens[_msgSender()] = lockedTokens[_msgSender()].add(amount);
        emit Deposited( _msgSender(), amount);

        lpToken.mint(_msgSender(), amount);
        return true;
    }

    function withdraw(uint256 _tokenAmount) external override returns (bool success) {
        require(_tokenAmount > 0, "withdraw: Amount lower than 0");
        require(lockedTokens[_msgSender()] >= _tokenAmount);

        _totalDeposited = _totalDeposited.sub(_tokenAmount);
        balances[_msgSender()] = balances[_msgSender()].sub(_tokenAmount);
        lockedTokens[_msgSender()] = lockedTokens[_msgSender()].sub(_tokenAmount);
        lpToken.burnFrom(_msgSender(), _tokenAmount);

        ERC20 token = ERC20(stableCoin);
        require(token.balanceOf(address(this)) >= _tokenAmount, "ERC20: Insufficient funds");
        require(token.transfer(_msgSender(), _tokenAmount), "ERC20: Transfer failed");

        emit Withdrawn(_msgSender(), _tokenAmount);
        return true;
    }

    function totalDeposited() external view override returns (uint256) {
        return _totalDeposited;
    }

    function totalBorrowed() external view override returns (uint256) {
        return _totalBorrowed;
    }

    function createPoolTokenSymbol(string memory prefix, string memory symbol)
        internal
        pure
        returns (string memory)
    {
        return string(abi.encodePacked(prefix, symbol));
    }
}
