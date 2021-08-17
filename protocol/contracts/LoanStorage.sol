// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract LoanStorage {
    struct Data {
        uint256 lockedAsset;
        address borrower;
        uint256 maturity;
        uint256 amount;
        uint256 debt;
        bool isClosed;
    }
}

abstract contract PoolModifier {
    address public pool;

    modifier onlyThisPool() {
        require(msg.sender == pool, "loan: Only pool can change state");
        _;
    }
}
    