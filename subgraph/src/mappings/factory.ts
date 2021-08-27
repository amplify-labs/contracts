import { DataSourceContext } from '@graphprotocol/graph-ts';

import { PoolCreated } from '../../generated/Factory/FactoryAbi';
import { Pool } from '../../generated/templates';
import { createNewPool } from './pool';

export function handlePoolCreation(event: PoolCreated): void {
    let context = new DataSourceContext();

    context.setBytes("pool", event.params.pool);
    context.setBytes("factor", event.params.factor);
    Pool.createWithContext(event.params.pool, context);

    createNewPool(event);
}