import { dataSource, BigInt } from '@graphprotocol/graph-ts';

import { Lend, Withdrawn, Borrowed, Repayed, AssetUnlocked } from '../../generated/templates/Pool/PoolAbi';
import { LoanCreated, PoolCreated } from '../../generated/Factory/FactoryAbi';
import { Pool } from '../../generated/schema';


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

    pool.save();
}

export function handlePoolWithdraw(event: Withdrawn): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.totalDeposited = pool.totalDeposited.minus(event.params._amount);
    }

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
        pool.assetsLocked.push(event.params.tokenId.toHex());
    }

    pool.save();
}

export function handleAssetUnlock(event: AssetUnlocked): void {
    let context = dataSource.context();
    let pool = Pool.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.assetsLocked.splice(pool.assetsLocked.indexOf(event.params.tokenId.toHex()), 1);
    }

    pool.save();
}