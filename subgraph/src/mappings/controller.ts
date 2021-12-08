import { DataSourceContext } from '@graphprotocol/graph-ts';

import { PoolCreated } from '../../generated/Controller/ControllerAbi';
import { Pool } from '../../generated/templates';
import { createNewPool } from './pool';

export function handlePoolCreation(event: PoolCreated): void {
    let context = new DataSourceContext();

    context.setBytes("pool", event.params.pool);
    context.setBytes("owner", event.params.owner);
    context.setBytes("stablecoin", event.params.stableCoin);
    Pool.createWithContext(event.params.pool, context);

    createNewPool(event);
}