import { dataSource, BigInt, Bytes, Address } from '@graphprotocol/graph-ts';

import { Lend, Redeem, CreditLineOpened, CreditLineClosed, Borrowed, Repayed, AssetUnlocked } from '../../generated/templates/Pool/PoolAbi';
import { PoolCreated } from '../../generated/Controller/ControllerAbi';
import { handleAssetLock, handleAssetRedeem, handleAssetUnlock } from "./asset";
import { Pool, Loan, Transaction } from '../../generated/schema';

// Pool
export function createNewPool(event: PoolCreated): void {
    let pool = new Pool(event.params.pool.toHex());

    pool.name = event.params.name;
    pool.minDeposit = event.params.minDeposit;
    pool.access = event.params.access == 0 ? "PUBLIC" : "PRIVATE";

    pool.stableCoin = event.params.stableCoin;
    pool.owner = event.params.owner;

    pool.totalDeposited = new BigInt(0);
    pool.totalBorrowed = new BigInt(0);

    pool.createdAt = event.block.timestamp;
    pool.assetsLocked = [];
    pool.members = [];

    pool.save();
}

export function handlePoolLend(event: Lend): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalDeposited = pool.totalDeposited.plus(event.params.amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "LEND",
        event.params.account,
        Address.fromString(pool.id),
        event.params.amount,
        event.block.timestamp);
    pool.save();
}

export function handlePoolRedeem(event: Redeem): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalDeposited = pool.totalDeposited.minus(event.params.amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "REDEEM",
        Address.fromString(pool.id),
        event.params.account,
        event.params.amount,
        event.block.timestamp);
    pool.save();
}

export function handleLoanCreation(event: CreditLineOpened): void {
    let context = dataSource.context();
    let pool = context.getBytes("pool").toHex();

    let loanId = createLoanId(event.params.loanId.toHex(), pool);

    let loan = Loan.load(loanId);
    if (loan == null) {
        loan = new Loan(loanId);

        loan.key = event.params.loanId.toHex();
        loan.createdAt = event.block.timestamp;
        loan.isClosed = false;

        loan.borrower = event.params.borrower;
        loan.available = event.params.amount;
        loan.maturity = event.params.maturity;
        loan.borrowCeiling = event.params.amount;

        loan.asset = event.params.tokenId.toHex()
        loan.pool = pool;

        loan.transactions = [];

        handlePoolLockedAsset(pool, event.params.tokenId.toHex(), loanId);
    }

    loan.save();
}

export function handlePoolLockedAsset(poolAddr: string, tokenId: string, loanId: string): void {
    let pool = Pool.load(poolAddr);

    if (pool !== null) {
        let poolAssets = pool.assetsLocked;
        poolAssets.push(tokenId);
        pool.assetsLocked = poolAssets;

        handleAssetLock(tokenId, loanId);
        pool.save();
    }
}

export function handleLoanClose(event: CreditLineClosed): void {
    let context = dataSource.context();
    let pool = context.getBytes("pool").toHex();

    let loanId = createLoanId(event.params.loanId.toHex(), pool);

    let loan = Loan.load(loanId);
    if (loan !== null) {
        loan.isClosed = true;
        handleAssetRedeem(loan.asset);
    }
    loan.save();
}

export function handlePoolBorrow(event: Borrowed): void {
    let context = dataSource.context();
    let borrower = context.getBytes("owner");
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalBorrowed = pool.totalBorrowed.plus(event.params._amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "BORROW",
        borrower,
        Address.fromString(pool.id),
        event.params._amount,
        event.block.timestamp);

    let loanId = createLoanId(event.params.loanId.toHex(), pool.id);
    let loan = Loan.load(loanId);
    if (loan != null) {
        let loanTx = loan.transactions;
        loanTx.push(event.transaction.hash.toHex());
        loan.transactions = loanTx;

        loan.available = loan.available.minus(event.params._amount);
        loan.save();
    }
    pool.save();
}

export function handlePoolRepay(event: Repayed): void {
    let context = dataSource.context();
    let borrower = context.getBytes("owner");
    let pool = Pool.load(context.getBytes("pool").toHex());

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "REPAY",
        Address.fromString(pool.id),
        borrower,
        event.params._amount,
        event.block.timestamp,
        event.params.penaltyAmount);


    let loanId = createLoanId(event.params.loanId.toHex(), pool.id);
    let loan = Loan.load(loanId);
    if (loan != null) {
        let loanTx = loan.transactions;
        loanTx.push(event.transaction.hash.toHex());
        loan.transactions = loanTx;

        let borrowAmount = loan.borrowCeiling.minus(loan.available);

        if (event.params._amount.ge(borrowAmount)) {
            loan.available = loan.borrowCeiling;
            pool.totalBorrowed = pool.totalBorrowed.minus(borrowAmount);
        } else {
            loan.available = loan.available.plus(event.params._amount);
            pool.totalBorrowed = pool.totalBorrowed.minus(event.params._amount);
        }
        loan.save();
    }
    pool.save();
}

export function handlePoolAssetUnlock(event: AssetUnlocked): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    let poolAssets = pool.assetsLocked;
    poolAssets.splice(poolAssets.indexOf(event.params.tokenId.toHex()), 1);
    pool.assetsLocked = poolAssets;

    handleAssetUnlock(event.params.tokenId.toHex())
    pool.save();
}

// // Transaction
function handleAddTransaction(txId: string, type: string, from: Bytes, to: Bytes, amount: BigInt, timestamp: BigInt, penaltyAmount: BigInt = BigInt.fromI32(0)): void {
    let transaction = new Transaction(txId);
    transaction.from = from;
    transaction.to = to;
    transaction.type = type;

    transaction.amount = amount;
    transaction.penaltyAmount = penaltyAmount;
    transaction.createdAt = timestamp;

    transaction.save();
}


function createLoanId(loanId: string, poolId: string,): string {
    return loanId.concat(poolId);
}