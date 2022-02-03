import { BigInt, store, Address } from '@graphprotocol/graph-ts';

import { Withdrawn, Deposited, IncreasedAmount, IncreasedTime, DelegateChanged } from '../../generated/VotingEscrow/VotingAbi';
import { VotingInfo, Lock } from '../../generated/schema';

export function handleLockDeposit(event: Deposited): void {
    let votingInfo = VotingInfo.load(event.transaction.to.toHex());

    if (votingInfo == null) {
        votingInfo = new VotingInfo(event.transaction.to.toHex());
        votingInfo.locked = new BigInt(0);
    }

    votingInfo.locked = votingInfo.locked.plus(event.params.value);

    let lock = Lock.load(event.params.provider.toHex());
    if (lock == null) {
        lock = new Lock(event.params.provider.toHex());

        lock.amount = event.params.value;
        lock.end = event.params.lockTime;
        lock.delegatee = new Address(0);

        lock.save();
    }
    votingInfo.save();
}

export function handleLockIncreaseAmount(event: IncreasedAmount): void {
    let votingInfo = VotingInfo.load(event.transaction.to.toHex());
    votingInfo.locked = votingInfo.locked.plus(event.params.amount);

    let lock = Lock.load(event.params.provider.toHex());
    if (lock != null) {
        lock.amount = lock.amount.plus(event.params.amount);
        lock.save();
    }

    votingInfo.save();
}

export function handleLockIncreaseTime(event: IncreasedTime): void {
    let lock = Lock.load(event.params.provider.toHex());
    if (lock != null) {
        lock.end = event.params.time;
    }
    lock.save();
}

export function handleLockDelegate(event: DelegateChanged): void {
    let lock = Lock.load(event.params.delegator.toHex());
    if (lock != null) {
        lock.delegatee = event.params.delegatee;
    }
    lock.save();
}

export function handleLockWithdraw(event: Withdrawn): void {
    let votingInfo = VotingInfo.load(event.transaction.to.toHex());

    if (votingInfo == null) {
        votingInfo = new VotingInfo(event.transaction.to.toHex());
        votingInfo.locked = new BigInt(0);
    }

    votingInfo.locked = votingInfo.locked.minus(event.params.value);
    store.remove('Lock', event.params.provider.toHex());
    votingInfo.save();
};