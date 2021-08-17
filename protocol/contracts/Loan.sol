// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./LoanStorage.sol";

import "./Asset.sol";

contract Loan is LoanStorage, PoolModifier {
    using SafeMath for uint256;

    event Borrowed(uint256 indexed amount);
    event Repayed(uint256 indexed amount);
    event Closed();

    Data private data;
    Asset private nftFactory;

    constructor(address nftAddress, uint256 tokenId, address borrower_, address pool_) {
        nftFactory = Asset(nftAddress);
        pool = pool_;

        uint256 nftMaturity = nftFactory.getTokenMaturity(tokenId);
        require(nftMaturity >= block.timestamp, "loan: Maturity date expired");

        uint256 loanValue = _calculateLoanAmount(tokenId);

       data = Data(tokenId, borrower_, nftMaturity, loanValue, 0, false);
    }

    modifier onlyIfBorrowed() {
        require(msg.sender == data.borrower, "invalid borrower");
        require(data.debt == 0, "loan: no debt");
        _;
    }

    function _calculateLoanAmount(uint256 tokenId) internal view returns (uint256) {
        uint256 nftValue = nftFactory.getTokenValue(tokenId);
        string memory nftRating = nftFactory.getTokenRating(tokenId);
        uint256 advanceRate = nftFactory.getRiskAdvanceRate(nftRating);

        return nftValue * advanceRate / 100;
    }

    function isClosed() external view returns (bool) {
        return data.isClosed;
    }

    // @notice Amount of tokens to be loaned
    function getAllowanceAmount() external view returns (uint256) {
        return data.amount;
    }

    // @notice Amount of tokens available to be loaned
    function getAvailableAmount() external view returns (uint256) {
        return data.amount.sub(data.debt);
    }

    // @notice Amount of tokens borrowed
    function getDebtAmount() external view returns (uint256) {
        return data.debt;
    }

    function getMaturity() external view returns (uint256) {
        return data.maturity;
    }

    function getLockedAsset() external view returns (uint256) {
        return data.lockedAsset;
    }

    function getBorrower() external view returns (address) {
        return data.borrower;
    }

    function getNftFactory() external view returns (Asset) {
        return nftFactory;
    }

    function borrow(uint256 amount) external onlyThisPool returns (bool success) {
        data.debt += amount;
        emit Borrowed(amount);

        return true;
    }

    function repay(uint256 amount) external onlyThisPool returns (bool success) {
        data.debt -= amount;
        emit Repayed(amount);

        if (data.debt == 0) {
            require(closeInternal(), "loan: Cannot close loan");
        }
        return true;
    }

    function close() external onlyIfBorrowed returns (bool success) {
        return closeInternal();
    }

    function closeInternal() internal returns (bool success) {
        require(data.debt == 0, "loan: Can't close loan with debt");

        data.isClosed = true;
        emit Closed();
        return true;
    }
}