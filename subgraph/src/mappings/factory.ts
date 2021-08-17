import { DataSourceContext } from '@graphprotocol/graph-ts';

import { PoolCreated, LoanCreated } from '../../generated/Factory/FactoryAbi';
import { Pool, Loan } from '../../generated/templates';
import { createNewPool } from './pool';
import { createNewLoan } from './loan';

export function handlePoolCreation(event: PoolCreated): void {
    let context = new DataSourceContext();

    context.setBytes("pool", event.params.pool);
    context.setBytes("factor", event.params.factor);
    Pool.createWithContext(event.params.pool, context);

    createNewPool(event);
}

export function handleLoanCreation(event: LoanCreated): void {
    let context = new DataSourceContext();

    context.setBytes("loan", event.params.loan);
    context.setBytes("factor", event.params.factor);
    Loan.createWithContext(event.params.loan, context);

    createNewLoan(event);
}