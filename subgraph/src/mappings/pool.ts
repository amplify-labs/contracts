import { dataSource, BigInt, Bytes, Address } from '@graphprotocol/graph-ts';

import { Lend, Redeem, CreditLineOpened, CreditLineClosed } from '../../generated/templates/Pool/PoolAbi';
import { PoolCreated } from '../../generated/Controller/ControllerAbi';
import { handleAssetLock, handleAssetRedeem } from "./asset";
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

    if (!pool.members.includes(event.params.account)) {
        let currentMembers = pool.members;
        currentMembers.push(event.params.account);
        pool.members = currentMembers;
    }

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

// export function handlePoolBorrow(event: Borrowed): void {
//     let context = dataSource.context();
//     let factor = context.getBytes("factor");
//     let pool = Pool.load(context.getBytes("pool").toHex());

//     pool.totalBorrowed = pool.totalBorrowed.plus(event.params._amount);

//     handleAddTransaction(
//         event.transaction.hash.toHex(),
//         "BORROW",
//         factor,
//         Address.fromString(pool.id),
//         event.params._amount,
//         event.block.timestamp);
//     handleLoanAddDebt(event.params.loanId.toHex(), event.params._amount);
//     handleAddLoanTx(event.params.loanId.toHex(), event.transaction.hash.toHex());
//     pool.save();
// }

// export function handlePoolRepay(event: Repayed): void {
//     let context = dataSource.context();
//     let factor = context.getBytes("factor");
//     let pool = Pool.load(context.getBytes("pool").toHex());

//     pool.totalBorrowed = pool.totalBorrowed.minus(event.params._amount);

//     handleAddTransaction(
//         event.transaction.hash.toHex(),
//         "REPAY",
//         Address.fromString(pool.id),
//         factor,
//         event.params._amount,
//         event.block.timestamp);

//     handleLoanSubDebt(event.params.loanId.toHex(), event.params._amount);
//     handleAddLoanTx(event.params.loanId.toHex(), event.transaction.hash.toHex());
//     pool.save();
// }

// export function handlePoolUnlockedAsset(event: AssetUnlocked): void {
//     let context = dataSource.context();
//     let pool = Pool.load(context.getBytes("pool").toHex());

//     let poolAssets = pool.assetsLocked;
//     poolAssets.splice(poolAssets.indexOf(event.params.tokenId.toHex()), 1);
//     pool.assetsLocked = poolAssets;

//     handleAssetUnlock(event.params.tokenId.toHex())
//     pool.save();
// }

export function handleCreateCreditLine(event: CreditLineOpened): void {
    let context = dataSource.context();
    let pool = context.getBytes("pool").toHex();

    let loan = new Loan(event.params.loanId.toHex());

    loan.createdAt = event.block.timestamp;
    loan.isClosed = false;

    loan.borrower = event.params.borrower;
    loan.available = event.params.amount;
    loan.borrowCeiling = event.params.amount;

    loan.asset = event.params.tokenId.toHex()
    loan.pool = pool;

    loan.transactions = [];

    handlePoolLockedAsset(pool, event.params.tokenId.toHex(), event.params.loanId.toHex());
    loan.save();
}

// export function handleLoanAddDebt(loanId: string, amount: BigInt): void {
//     let loan = Loan.load(loanId);

//     if (loan !== null) {
//         loan.debt = loan.debt.plus(amount);
//         loan.save();
//     }
// }

// export function handleLoanSubDebt(loanId: string, amount: BigInt): void {
//     let loan = Loan.load(loanId);
//     if (loan !== null) {
//         loan.debt = loan.debt.minus(amount);
//         loan.save();
//     }
// }

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
    let loan = Loan.load(event.params.loanId.toHex());
    if (loan !== null) {
        loan.isClosed = true;
        handleAssetRedeem(loan.asset);
        loan.save();
    }
}

// // Transaction
function handleAddTransaction(txId: string, type: string, from: Bytes, to: Bytes, amount: BigInt, timestamp: BigInt): void {
    let transaction = new Transaction(txId);
    transaction.from = from;
    transaction.to = to;
    transaction.type = type;

    transaction.amount = amount;
    transaction.createdAt = timestamp;

    transaction.save();
}

// export function handleAddLoanTx(loanId: string, txId: string): void {
//     let loan = Loan.load(loanId);

//     if (loan !== null) {
//         let currentTx = loan.transactions;
//         currentTx.push(txId);
//         loan.transactions = currentTx;
//         loan.save();
//     }
// }