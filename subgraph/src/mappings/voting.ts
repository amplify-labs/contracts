import { BigInt } from '@graphprotocol/graph-ts';

import { Withdrawn, Deposited } from '../../generated/VotingEscrow/VotingAbi';
import { VotingInfo, Lock } from '../../generated/schema';

export function handleLockDeposit(event: Deposited): void {
    let votingInfo = VotingInfo.load(event.transaction.to.toHex());

    if (votingInfo == null) {
        votingInfo = new VotingInfo(event.transaction.to.toHex());
        votingInfo.locked = new BigInt(0);
    }

    votingInfo.locked = votingInfo.locked.plus(event.params.value);
    handleLock(event.params.provider.toHex(), event.params.value, event.block.timestamp, event.params.lockTime, event.params.actionType);
    votingInfo.save();
}

export function handleLockWithdraw(event: Withdrawn): void {
    let votingInfo = VotingInfo.load(event.transaction.to.toHex());

    if (votingInfo == null) {
        votingInfo = new VotingInfo(event.transaction.to.toHex());
        votingInfo.locked = new BigInt(0);
    }

    votingInfo.locked = votingInfo.locked.minus(event.params.value);
    handleLock(event.params.provider.toHex(), BigInt.fromI32(0), event.block.timestamp, BigInt.fromI32(0), BigInt.fromI32(4));

    votingInfo.save();
}

function handleLock(id: string, value: BigInt, startTime: BigInt, time: BigInt, eventType: BigInt): void {
    let lock = Lock.load(id);

    if (lock === null) { // create new lock
        lock = new Lock(id);
        lock.amount = value;
        lock.start = startTime;
        lock.end = time;
    } else {
        switch (true) {
            case eventType.equals(BigInt.fromI32(2)): // increase lock amount
            case eventType.equals(BigInt.fromI32(0)): // deposit
                lock.amount = lock.amount.plus(value);
                break;
            case eventType.equals(BigInt.fromI32(3)): // increase unlock time
                lock.start = startTime;
                lock.end = time;
                break;
            default: // withdrawn
                lock.amount = value;
                lock.start = time;
                lock.end = time;
                break;
        }
    }
    lock.save();
}