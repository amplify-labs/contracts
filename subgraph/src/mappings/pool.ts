import { dataSource, BigInt, Bytes, Address } from '@graphprotocol/graph-ts';

import { Lend, Withdrawn, Borrowed, Repayed, AssetUnlocked } from '../../generated/templates/Pool/PoolAbi';
import { LoanCreated, PoolCreated } from '../../generated/Factory/FactoryAbi';
import { Pool, Asset, Transaction } from '../../generated/schema';


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

    if (pool) {
        pool.totalDeposited = pool.totalDeposited.plus(event.params._amount);
    }

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "LEND",
        event.params._from,
        Address.fromString(pool.id),
        event.params._amount,
        event.block.timestamp);
    pool.save();
}

export function handlePoolWithdraw(event: Withdrawn): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.totalDeposited = pool.totalDeposited.minus(event.params._amount);
    }

    handleAddTransaction(
        event.transaction.hash.toHex(),
        "WITHDRAW",
        Address.fromString(pool.id),
        event.params._from,
        event.params._amount,
        event.block.timestamp);
    pool.save();
}

export function handlePoolBorrow(event: Borrowed): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.totalBorrowed = pool.totalBorrowed.plus(event.params._amount);
    }

    pool.save();
}

export function handlePoolRepay(event: Repayed): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.totalBorrowed = pool.totalBorrowed.minus(event.params._amount);
    }

    pool.save();
}

export function handleAssetlock(event: LoanCreated): void {
    let pool = Pool.load(event.params.pool.toHex());

    if (pool) {
        let poolAssets = pool.assetsLocked;
        poolAssets.push(event.params.tokenId.toHex());
        pool.assetsLocked = poolAssets;
    }

    updateTokenIntoTheAsset(event.params.tokenId.toHex(), true)
    pool.save();
}

export function handleAssetUnlock(event: AssetUnlocked): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    if (pool) {
        let poolAssets = pool.assetsLocked;
        poolAssets.splice(poolAssets.indexOf(event.params.tokenId.toHex()), 1);
        pool.assetsLocked = poolAssets;
    }
    updateTokenIntoTheAsset(event.params.tokenId.toHex(), false)
    pool.save();
}

function updateTokenIntoTheAsset(tokenId: string, status: boolean): void {
    let asset = Asset.load(tokenId);

    if (asset) {
        asset.isLocked = status;
    }
    asset.save();
}

function handleAddTransaction(txId: string, type: string, from: Bytes, to: Bytes, amount: BigInt, timestamp: BigInt): void {
    let transaction = new Transaction(txId);
    transaction.from = from;
    transaction.to = to;
    transaction.type = type;

    transaction.amount = amount;
    transaction.createdAt = timestamp;

    transaction.save();
}