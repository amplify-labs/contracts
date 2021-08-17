// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./PoolStorage.sol";

import "./PoolToken.sol";
import "./Asset.sol";
import "./Loan.sol";

contract Pool is Loaned, Context, Structured {
    using SafeMath for uint256;

    event Lend(address indexed _from, uint256 _amount);
    event Borrowed(address indexed loan, uint256 _amount);
    event Repayed(address indexed loan, uint256 _amount);
    event Withdrawn(address indexed _from, uint256 _amount);

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
        lpToken = new PoolToken("PoolToken", token.symbol());
    }

    function lend(uint256 amount) external returns (bool success) {
        require(amount >= minDeposit, "lend: Amount lower than minDeposit");
        require(_transferTokens(_msgSender(), address(this), amount));

        balances[_msgSender()] += amount;
        totalDeposited += amount;
        lockedTokens[_msgSender()] += amount;
        emit Lend(_msgSender(), amount);

        lpToken.mint(_msgSender(), amount);
        return true;
    }

    function borrow(address loan, uint256 amount) external isAvailable(amount) validateLoan(loan) returns (bool success) {
        Loan loanContract = Loan(loan);

        uint256 availableAmountForLoan = loanContract.getAvailableAmount();
        require(availableAmountForLoan >= amount, "borrow: insufficient available amount");
        
        uint256 lockedAsset = loanContract.getLockedAsset();
        require(loanContract.borrow(amount), "borrow: failed to borrow");

        totalBorrowed += amount;
        loans[lockedAsset] += amount;

        emit Borrowed(loan, amount);
        return _transferTokens(address(this), _msgSender(), amount);
    }

    function unlockAsset(address loan) external validateLoan(loan) returns (bool success) {
        Loan loanContract = Loan(loan);
        uint256 lockedAsset = loanContract.getLockedAsset();
        require(loans[lockedAsset] == 0 || loanContract.isClosed(), "borrow hasn't repayed");

        Asset nftFactory = loanContract.getNftFactory();

        nftFactory.transferFrom(address(this), _msgSender(), lockedAsset);
        return true;
    }

    function repay(address loan, uint256 amount) external validateLoan(loan) returns (bool success) { 
        Loan loanContract = Loan(loan);
        uint256 lockedAsset = loanContract.getLockedAsset();
        address borrower = loanContract.getBorrower();

        require(amount > 0, "repay: amount must be greater than 0");
        require(loanContract.getDebtAmount() >= amount, "repay: amount higher than debt");

        require(loanContract.repay(amount));
        emit Repayed(loan, amount);
        return repayInternal(borrower, lockedAsset, amount);
    }

    function repayInternal(address borrower, uint256 lockedAsset, uint256 amount) internal returns (bool success) {
        // Repay the loan
        totalBorrowed = totalBorrowed.sub(amount);
        loans[lockedAsset] = loans[lockedAsset].sub(amount);
        return _transferTokens(borrower, address(this), amount);
    }

    function withdraw(uint256 _tokenAmount) external isAvailable(_tokenAmount) returns (bool success) {
        require(_tokenAmount > 0, "withdraw: Amount lower than 0");
        require(lockedTokens[_msgSender()] >= _tokenAmount, "withdraw: amount higher then owned tokens");

        totalDeposited -= _tokenAmount;
        balances[_msgSender()] -= _tokenAmount;
        lockedTokens[_msgSender()] -= _tokenAmount;

        lpToken.burnFrom(_msgSender(), _tokenAmount);
        emit Withdrawn(_msgSender(), _tokenAmount);
        
        return _transferTokens(address(this), _msgSender(), _tokenAmount);
    }

    function _transferTokens(address _from, address _to, uint256 _tokenAmount) internal returns (bool success) {
        ERC20 token = ERC20(stableCoin);
        require(token.balanceOf(_from) >= _tokenAmount, "ERC20: Insufficient funds");
        if (_from == address(this)) {
            require(token.transfer(_to, _tokenAmount), "ERC20: Failed to transfer");
        } else {
            require(token.transferFrom(_from, _to, _tokenAmount), "ERC20: Transfer failed");
        }
        return true;
    }
}
