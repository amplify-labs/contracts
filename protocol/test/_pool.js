const { ethers } = require("hardhat");
const { send, init, call, connect, uuidv4 } = require("./utils");

const { deployNFT } = require("./_asset");

const PoolType = {
    PUBLIC: 0,
    PRIVATE: 1
}


async function createPool(controller, name, minDeposit, stableCoin, type = PoolType.PUBLIC) {
    let tx = await send(controller, "createPool", [name, minDeposit, stableCoin.address, type]);

    if (!tx.events) {
        return new Error(tx);
    }
    const poolAddr = tx.events[0].args.pool;
    let pool = await init("PoolHarness", poolAddr);
    return pool;
}

async function createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, amount, maturity) {
    await send(stableCoin, "mint", [borrower.address, amount]);
    let connectedStableCoin = await connect(stableCoin, borrower);
    await send(connectedStableCoin, "approve", [pool.address, amount]);

    // create nft
    let connectedFactory = await connect(assetsFactory, borrower);
    let tokenId = await deployNFT(connectedFactory, uuidv4(), "A", amount.mul(2), maturity);
    await send(connectedFactory, "transferFrom", [borrower.address, pool.address, tokenId]);

    let connectedPool = await connect(pool, borrower);
    let tx = await send(connectedPool, "createCreditLine", [tokenId]);

    if (!tx.events) {
        throw new Error(tx);
    }
    return [tx.events[0].args.loanId, tokenId];
}

const ErrorCode = {
    NO_ERROR: 0,
    CONTROLLER_LEND_REJECTION: 1,
    CONTROLLER_REDEEM_REJECTION: 2,
    CONTROLLER_BORRROW_REJECTION: 3,
    CONTROLLER_REPAY_REJECTION: 4,
    CONTROLLER_CREATE_REJECTION: 5,
    INSUFFICIENT_FUNDS: 6,
    AMOUNT_LOWER_THAN_0: 7,
    AMOUNT_HIGHER: 8,
    AMOUNT_LOWER_THAN_MIN_DEPOSIT: 9,
    NOT_ENOUGH_CASH: 10,
    LOAN_HAS_DEBT: 11,
    LOAN_IS_OVERDUE: 12,
    LOAN_IS_NOT_CLOSED: 13,
    LOAN_ASSET_ALREADY_USED: 14,
    LOAN_IS_ALREADY_CLOSED: 15,
    LOAN_PENALTY_NOT_PAYED: 16,
    WRONG_BORROWER: 17,
    TRANSFER_FAILED: 18,
    TRANSFER_IN_RESERVE_POOL_FAILED: 19,
    POOL_NOT_FOUND: 20
};

module.exports = {
    PoolType,
    ErrorCode,
    createPool,
    createCreditLine
}


