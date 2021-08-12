import { DataSourceContext, dataSource, BigInt } from '@graphprotocol/graph-ts';

import { Deposited, Withdrawn } from '../../generated/templates/Pool/PoolAbi';
import { PoolCreated } from '../../generated/Factory/FactoryAbi';
import { Pool as PoolDataSource } from '../../generated/templates';
import { Pool as PoolEntity } from '../../generated/schema';


export function handlePoolCreation(event: PoolCreated): void {
    let context = new DataSourceContext();

    context.setBytes("pool", event.params.pool);
    context.setBytes("factor", event.params.factor);
    PoolDataSource.createWithContext(event.params.pool, context);

    createNewPool(event);
}


function createNewPool(event: PoolCreated): void {
    let pool = new PoolEntity(event.params.pool.toHex());
    pool.name = event.params.name;
    pool.stableCoin = event.params.stableCoin;
    pool.structureType = event.params.structureType;
    pool.factor = event.params.factor;
    pool.minDeposit = event.params.minDeposit;
    pool.totalDeposited = new BigInt(0);
    pool.totalBorrowed = new BigInt(0);

    pool.save();
}

export function handlePoolDeposit(event: Deposited): void {
    let context = dataSource.context();
    let pool = PoolEntity.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.totalDeposited = pool.totalDeposited.plus(event.params._amount);
    }

    pool.save();
}

export function handlePoolWithdraw(event: Withdrawn): void {
    let context = dataSource.context();
    let pool = PoolEntity.load(context.getBytes("pool").toHex());

    if (pool) {
        pool.totalDeposited = pool.totalDeposited.minus(event.params._amount);
        pool.totalBorrowed = pool.totalBorrowed.minus(event.params._amount);
    }

    pool.save();
}