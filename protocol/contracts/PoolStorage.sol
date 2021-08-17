// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PoolToken.sol";
import "./Loan.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract PoolStorage {
    string public name;
    address public stableCoin;
    uint256 public minDeposit;
    PoolToken public lpToken;

    uint256 public totalDeposited;  

    mapping(address => uint256) public balances;
    mapping(uint256 => uint256) public loans;
    mapping(address => uint256) public lockedTokens;
}

abstract contract Structured {
    string public structureType;

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

abstract contract Loaned is PoolStorage {
    using SafeMath for uint256;

    uint256 public totalBorrowed;

    function totalAvailable() external view returns (uint256) {
        return totalDeposited.sub(totalBorrowed);
    }

    modifier isAvailable(uint256 amount) {
        require(this.totalAvailable() >= amount, "Not enough tokens available");
        _;
    }

    modifier validateLoan(address loan) {
        Loan loanContract = Loan(loan);
        require(loanContract.pool() == address(this), "loan not managed by this pool");
        require(msg.sender == loanContract.getBorrower(), "sender is not the borrower");
        _;
    }
}
