import { Bytes, DataSourceContext, store } from '@graphprotocol/graph-ts';

import {
    PoolCreated,
    PoolClosed,
    BorrowerCreated,
    BorrowerWhitelisted,
    BorrowerBlacklisted,
    LenderCreated,
    LenderWhitelisted,
    LenderBlacklisted,
    LenderDepositWithdrawn
} from '../../generated/Controller/ControllerAbi';
import { Pool } from '../../generated/templates';
import { Borrower, LenderApplication, Pool as PoolEntity } from '../../generated/schema';
import { createNewPool } from './pool';

export function handlePoolCreation(event: PoolCreated): void {
    let context = new DataSourceContext();

    context.setBytes("pool", event.params.pool);
    context.setBytes("owner", event.params.owner);
    context.setBytes("stablecoin", event.params.stableCoin);
    Pool.createWithContext(event.params.pool, context);

    createNewPool(event);
    handleBorrowerPool(event);
}

export function handlePoolClose(event: PoolClosed): void {
    let pool = PoolEntity.load(event.params.pool.toHex());

    if (pool != null) {
        pool.isClosed = true;
        pool.save();
    }

}

// borrower entity
export function handleBorrowerCreation(event: BorrowerCreated): void {
    let borrower = Borrower.load(event.params.borrower.toHex());

    if (borrower == null) {
        borrower = new Borrower(event.params.borrower.toHex());
        borrower.status = "NOT_LISTED";
        borrower.pools = [];
        borrower.whitelists = [];

        borrower.save();
    }
}

export function handleBorrowerWhitelist(event: BorrowerWhitelisted): void {
    let borrower = Borrower.load(event.params.borrower.toHex());

    borrower.status = "WHITELISTED";
    borrower.save();
}

export function handleBorrowerBlacklist(event: BorrowerBlacklisted): void {
    let borrower = Borrower.load(event.params.borrower.toHex());

    borrower.status = "BLACKLISTED";
    borrower.save();
}

function handleBorrowerPool(event: PoolCreated): void {
    let pool = event.params.pool;
    let owner = event.params.owner;

    let borrower = Borrower.load(owner.toHex());
    if (borrower != null) {
        let bP = borrower.pools;
        bP.push(pool.toHex());
        borrower.pools = bP;

        // update pools members
        for (let i = 0; i < bP.length; i++) {
            updatePoolMembers(bP[i], borrower.whitelists)
        }
        borrower.save();
    }
}

// lender application entity
export function handleLenderCreation(event: LenderCreated): void {
    let lenderId = createLenderId(event.params.lender.toHex(), event.params.pool.toHex());
    let application = LenderApplication.load(lenderId);

    if (application == null) {
        application = new LenderApplication(lenderId);

        let pool = PoolEntity.load(event.params.pool.toHex());

        application.pool = event.params.pool.toHex();
        application.poolOwner = pool.owner.toHex();
        application.amount = event.params.amount;
        application.account = event.params.lender;
        application.status = "NOT_LISTED";
        application.createdAt = event.block.timestamp;

        application.save();
    }
}

export function handleLenderWhitelist(event: LenderWhitelisted): void {
    let lender = event.params.lender;
    let borrower = Borrower.load(event.params.borrower.toHex());

    if (!borrower.whitelists.includes(lender)) {
        let bW = borrower.whitelists;
        bW.push(lender);

        borrower.whitelists = bW;
    };

    // update pools members
    let bP = borrower.pools;
    for (let i = 0; i < bP.length; i++) {
        updatePoolMembers(bP[i], borrower.whitelists)
        _changeLenderStatus(lender.toHex(), bP[i], "WHITELISTED");
    }

    borrower.save();
};

export function handleLenderBlacklist(event: LenderBlacklisted): void {
    let lender = event.params.lender;
    let borrower = Borrower.load(event.params.borrower.toHex());

    if (borrower.whitelists.includes(lender)) {
        let bW = borrower.whitelists;

        let index = 0;
        for (let i = 0; i < bW.length; i++) {
            if (bW[i] === lender) {
                index = i;
                break;
            }
        }
        bW.splice(index, 1);
        borrower.whitelists = bW;
    };

    // update pools members
    let bP = borrower.pools;
    for (let i = 0; i < bP.length; i++) {
        updatePoolMembers(bP[i], borrower.whitelists)
        _changeLenderStatus(lender.toHex(), bP[i], "BLACKLISTED");
    }

    borrower.save();
}

export function handleLenderWithrawn(event: LenderDepositWithdrawn): void {
    let lenderId = createLenderId(event.params.lender.toHex(), event.params.pool.toHex());

    store.remove('LenderApplication', lenderId);
}

function _changeLenderStatus(lender: string, pool: string, status: string): void {
    let lenderId = createLenderId(lender, pool);
    let application = LenderApplication.load(lenderId);

    if (application !== null) {
        application.status = status;
        application.save();
    }
}

function createLenderId(lender: string, poolId: string,): string {
    return lender.concat("-").concat(poolId);
}

function updatePoolMembers(pool: string, whitelists: Array<Bytes>): void {
    let p = PoolEntity.load(pool);

    if (p != null) {
        p.members = whitelists;
        p.save();
    }
}