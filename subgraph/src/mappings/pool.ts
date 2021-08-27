import { dataSource, BigInt, Bytes, Address } from '@graphprotocol/graph-ts';

import { Lend, Withdrawn, Borrowed, Repayed, AssetUnlocked, CreditLineOpened, CreditLineClosed } from '../../generated/templates/Pool/PoolAbi';
import { PoolCreated } from '../../generated/Factory/FactoryAbi';
import { Pool, Loan, Transaction, Balance } from '../../generated/schema';
import { handleAssetLock, handleAssetRedeem, handleAssetUnlock } from './asset';

// Pool
export function createNewPool(event: PoolCreated): void {
    let pool = new Pool(event.params.pool.toHex());
    pool.name = event.params.name;
    pool.stableCoin = event.params.stableCoin;
    pool.structureType = event.params.structureType;
    pool.factor = event.params.factor;
    pool.minDeposit = event.params.minDeposit;
    pool.totalDeposited = new BigInt(0);
    pool.totalBorrowed = new BigInt(0);
    pool.createdAt = event.block.timestamp;
    pool.assetsLocked = [];

    pool.save();
}

export function handlePoolLend(event: Lend): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalDeposited = pool.totalDeposited.plus(event.params._amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "LEND",
        event.params.lender,
        Address.fromString(pool.id),
        event.params._amount,
        event.block.timestamp);

    handleBalance(pool.id, event.params.lender, "LEND", event.params._amount);
    pool.save();
}

export function handlePoolWithdraw(event: Withdrawn): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalDeposited = pool.totalDeposited.minus(event.params._amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "WITHDRAW",
        Address.fromString(pool.id),
        event.params.lender,
        event.params._amount,
        event.block.timestamp);
    handleBalance(pool.id, event.params.lender, "WITHDRAW", event.params._amount);
    pool.save();
}

export function handlePoolBorrow(event: Borrowed): void {
    let context = dataSource.context();
    let factor = context.getBytes("factor");
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalBorrowed = pool.totalBorrowed.plus(event.params._amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "BORROW",
        factor,
        Address.fromString(pool.id),
        event.params._amount,
        event.block.timestamp);

    handleAddLoanTx(event.params.loanId.toHex(), event.transaction.hash.toHex());
    pool.save();
}

export function handlePoolRepay(event: Repayed): void {
    let context = dataSource.context();
    let factor = context.getBytes("factor");
    let pool = Pool.load(context.getBytes("pool").toHex());

    pool.totalBorrowed = pool.totalBorrowed.minus(event.params._amount);

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "REPAY",
        Address.fromString(pool.id),
        factor,
        event.params._amount,
        event.block.timestamp);

    handleAddLoanTx(event.params.loanId.toHex(), event.transaction.hash.toHex());
    pool.save();
}

export function handlePoolUnlockedAsset(event: AssetUnlocked): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    let poolAssets = pool.assetsLocked;
    poolAssets.splice(poolAssets.indexOf(event.params.tokenId.toHex()), 1);
    pool.assetsLocked = poolAssets;

    handleAssetUnlock(event.params.tokenId.toHex())
    pool.save();
}


// Loan
export function handleCreateCreditLine(event: CreditLineOpened): void {
    let context = dataSource.context();
    let pool = context.getBytes("pool").toHex();

    let loan = new Loan(event.params.loanId.toHex());

    loan.amount = event.params.amount;
    loan.debt = new BigInt(0);
    loan.factor = event.params.borrower;
    loan.asset = event.params.tokenId.toHex()
    loan.pool = pool;
    loan.createdAt = event.block.timestamp;
    loan.isClosed = false;
    loan.transactions = [];

    handlePoolLockedAsset(pool, event.params.tokenId.toHex());
    loan.save();
}

export function handlePoolLockedAsset(poolAddr: string, tokenId: string): void {
    let pool = Pool.load(poolAddr);

    let poolAssets = pool.assetsLocked;
    poolAssets.push(tokenId);
    pool.assetsLocked = poolAssets;

    handleAssetLock(tokenId);
    pool.save();
}

export function handleLoanClose(event: CreditLineClosed): void {
    let loan = Loan.load(event.params.loanId.toHex());
    loan.isClosed = true;

    handleAssetRedeem(loan.asset);
    loan.save();
}

// Transaction
function handleAddTransaction(txId: string, type: string, from: Bytes, to: Bytes, amount: BigInt, timestamp: BigInt): void {
    let transaction = new Transaction(txId);
    transaction.from = from;
    transaction.to = to;
    transaction.type = type;

    transaction.amount = amount;
    transaction.createdAt = timestamp;

    transaction.save();
}

export function handleAddLoanTx(loanId: string, txId: string): void {
    let loan = new Loan(loanId);

    let currentTx = loan.transactions;
    currentTx.push(txId);
    loan.transactions = currentTx;

    loan.save();
}

// Balance
function handleBalance(id: string, lender: Bytes, type: string, amount: BigInt): void {
    let balance = Balance.load(id);

    if (balance == null) {
        balance = new Balance(id);
        balance.lender = lender;

        switch (true) {
            case type === "LEND":
                balance.lend = amount;
                break;
            default:
                break;
        }
    } else {
        switch (true) {
            case type === "LEND":
                balance.lend = balance.lend.plus(amount);
                break;
            case type === "WITHDRAW":
                balance.lend = balance.lend.minus(amount);
                break;
            default:
                break;
        }
    }
    balance.save();
}