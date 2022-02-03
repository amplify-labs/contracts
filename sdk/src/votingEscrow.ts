/**
 * @file Voting Escrow
 * @desc These methods facilitate interactions with the VotingEscrow smart contract.
 */

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { abi, address } from './constants';
import { CallOptions, TrxResponse } from './types';


/**
 * Create lock
 *
 * @param {string | number | BigNumber} value Locked amount.
 * @param {string | number | BigNumber} unlockTime Lock period in seconds.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const lock = await amplify.createLock('100','15435940249');
 *   console.log('lock:', lock);
 * })().catch(console.error);
 * ```
 */
export async function createLock(value: string | number | BigNumber, unlockTime: string | number | BigNumber, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [createLock] | ';

    if (
        typeof value !== 'number' &&
        typeof value !== 'string' &&
        !ethers.BigNumber.isBigNumber(value)
    ) {
        throw Error(errorPrefix + 'Argument `value` must be a string, number, or BigNumber.');
    }
    value = ethers.utils.parseEther(value.toString());

    if (
        typeof unlockTime !== 'number' &&
        typeof unlockTime !== 'string' &&
        !ethers.BigNumber.isBigNumber(unlockTime)
    ) {
        throw Error(errorPrefix + 'Argument `unlockTime` must be a string, number, or BigNumber.');
    }
    unlockTime = ethers.BigNumber.from(unlockTime.toString());

    const votingContract = address[this._network.name].VotingEscrow;
    const parameters = [value, unlockTime];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    return eth.trx(votingContract, 'createLock', parameters, trxOptions);
}


/**
 * Increase lock amount
 *
 * @param {string | number | BigNumber} value Locked amount to be added.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const increaseLockAmount = await amplify.increaseLockAmount('100');
 *   console.log('increaseLockAmount:', increaseLockAmount);
 * })().catch(console.error);
 * ```
 */
export async function increaseLockAmount(value: string | number | BigNumber, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [increaseLockAmount] | ';

    if (
        typeof value !== 'number' &&
        typeof value !== 'string' &&
        !ethers.BigNumber.isBigNumber(value)
    ) {
        throw Error(errorPrefix + 'Argument `value` must be a string, number, or BigNumber.');
    }
    value = ethers.utils.parseEther(value.toString());

    const votingContract = address[this._network.name].VotingEscrow;
    const parameters = [value];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    return eth.trx(votingContract, 'increaseLockAmount', parameters, trxOptions);
}

/**
 * Increase lock time
 *
 * @param {string | number | BigNumber} newUnlockTime Locked duration to be added in seconds.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const increaseLockTime = await amplify.increaseLockTime('154353485309');
 *   console.log('increaseLockTime:', increaseLockTime);
 * })().catch(console.error);
 * ```
 */
export async function increaseLockTime(newUnlockTime: string | number | BigNumber, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [increaseLockTime] | ';

    if (
        typeof newUnlockTime !== 'number' &&
        typeof newUnlockTime !== 'string' &&
        !ethers.BigNumber.isBigNumber(newUnlockTime)
    ) {
        throw Error(errorPrefix + 'Argument `newUnlockTime` must be a string, number, or BigNumber.');
    }
    newUnlockTime = ethers.BigNumber.from(newUnlockTime.toString());

    const votingContract = address[this._network.name].VotingEscrow;
    const parameters = [newUnlockTime];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    return eth.trx(votingContract, 'increaseLockTime', parameters, trxOptions);
}

/**
 * Withdraw locked amount
 *
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const withdrawLockedAmount = await amplify.withdrawLockedAmount();
 *   console.log('withdrawLockedAmount:', withdrawLockedAmount);
 * })().catch(console.error);
 * ```
 */
export async function withdrawLockedAmount(options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);

    const votingContract = address[this._network.name].VotingEscrow;

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    return eth.trx(votingContract, 'withdraw', [], trxOptions);
}

/**
 * Delegate voting power
 * @param {string} delegatee delegatee address. 
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.delegateVotePower('0xaadsad');
 *   console.log('tx:', tx);
 * })().catch(console.error);
 * ```
 */
export async function delegateVotePower(delegatee: string, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [delegate] | ';

    if (
        typeof delegatee !== 'string' &&
        !ethers.utils.isAddress(delegatee)
    ) {
        throw Error(errorPrefix + 'Argument `delegatee` must be an address');
    }

    const votingContract = address[this._network.name].VotingEscrow;

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    return eth.trx(votingContract, 'delegate', [delegatee], trxOptions);
}

/**
 * Get contract symbol
 * @returns {string} Returns a string.
 *
 * @example
 * ```
 * (async function () {
 *   const symbol = await amplify.voteSymbol();
 *   console.log('Symbol:', symbol);
 * })().catch(console.error);
 * ```
 */
export async function voteSymbol(): Promise<string> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow
    };

    const votingContract = address[this._network.name].VotingEscrow;
    const result = await eth.read(votingContract, 'symbol', [], trxOptions);
    return result.toString();
}

/**
 * Get account vote power
 * @param {string} addr Account address.
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {string} Returns a string.
 *
 * @example
 * ```
 * (async function () {
 *   const votePower = await amplify.votePower('0x34324431242314142daa');
 *   console.log('votePower:', votePower);
 * })().catch(console.error);
 * ```
 */
export async function votePower(addr: string, options?: CallOptions): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [balanceOf] | ';

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    if (
        typeof addr !== 'string' &&
        !ethers.utils.isAddress(addr)
    ) {
        throw Error(errorPrefix + 'Argument `addr` must be an address');
    }

    const votingContract = address[this._network.name].VotingEscrow;
    const result = await eth.read(votingContract, 'balanceOf', [addr], trxOptions);
    return result.toString();
}

/**
 * Get account locked balance
 * @param {string} addr Account address.
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {Array} Returns a string array.
 *
 * @example
 * ```
 * (async function () {
 *   const lockedAmount = await amplify.lockedAmount('0x34324431242314142daa');
 *   console.log('lockedAmount:', lockedAmount);
 * })().catch(console.error);
 * ```
 */
export async function lockedAmount(addr: string, options?: CallOptions): Promise<string[]> {
    await netId(this);
    const errorPrefix = 'Amplify [locked] | ';

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    if (
        typeof addr !== 'string' &&
        !ethers.utils.isAddress(addr)
    ) {
        throw Error(errorPrefix + 'Argument `addr` must be an address');
    }

    const votingContract = address[this._network.name].VotingEscrow;
    const result = await eth.read(votingContract, 'locked', [addr], trxOptions);
    return result.map(r => r.toString());
}

/**
 * Get total vote power
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {string} Returns a string.
 *
 * @example
 * ```
 * (async function () {
 *   const totalVotePower = await amplify.totalVotePower();
 *   console.log('totalVotePower:', totalVotePower);
 * })().catch(console.error);
 * ```
 */
export async function totalVotePower(options?: CallOptions): Promise<string> {
    await netId(this);

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    const votingContract = address[this._network.name].VotingEscrow;
    const result = await eth.read(votingContract, 'totalSupply', [], trxOptions);
    return result.toString();
}


/**
 * Get total locked balance
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {string} Returns a string.
 *
 * @example
 * ```
 * (async function () {
 *   const totalLocked = await amplify.totalLocked();
 *   console.log('totalLocked:', totalLocked);
 * })().catch(console.error);
 * ```
 */
export async function totalLocked(options?: CallOptions): Promise<string> {
    await netId(this);

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VotingEscrow,
        ...options
    };

    const votingContract = address[this._network.name].VotingEscrow;
    const result = await eth.read(votingContract, 'totalLocked', [], trxOptions);
    return result.toString();
}

export interface VotingEscrowInterface {
    createLock(value: string | number | BigNumber, unlockTime: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    increaseLockAmount(value: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    increaseLockTime(newUnlockTime: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    withdrawLockedAmount(options?: CallOptions): Promise<TrxResponse>;
    delegateVotePower(delegatee: string, options?: CallOptions): Promise<TrxResponse>
    voteSymbol(): Promise<string>;
    votePower(addr: string, options?: CallOptions): Promise<string>;
    lockedAmount(addr: string, options?: CallOptions): Promise<string[]>;
    totalVotePower(options?: CallOptions): Promise<string>;
    totalLocked(options?: CallOptions): Promise<string>;
}