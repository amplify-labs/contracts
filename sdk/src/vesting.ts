/**
 * @file Vesting Escrow
 * @desc These methods facilitate interactions with the Vesting smart contract.
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { abi, address } from './constants';
import { CallOptions, TrxResponse } from './types';


/**
 * Claim AMPT tokens
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.claimAMPT();
 *   console.log('tx:', tx);
 * })().catch(console.error);
 * ```
 */
export async function claimAMPT(options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);

    const _contract = address[this._network.name].VestingEscrow;

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VestingEscrow,
        ...options
    };

    return eth.trx(_contract, 'claim', [], trxOptions);
}

/**
 * Get vesting snapshot info
 * @param {string} addr Account address.
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {array} Returns an array of elements.
 *
 * @example
 * ```
 * (async function () {
 *   const snapshot = await amplify.vestingSnapshot('0x34324431242314142daa');
 *   console.log('snapshot:', snapshot);
 * })().catch(console.error);
 * ```
 */
export async function vestingSnapshot(addr: string, options?: CallOptions): Promise<string[]> {
    await netId(this);
    const errorPrefix = 'Amplify [getSnapshot] | ';

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.VestingEscrow,
        ...options
    };

    if (
        typeof addr !== 'string' &&
        !ethers.utils.isAddress(addr)
    ) {
        throw Error(errorPrefix + 'Argument `addr` must be an address');
    }

    const _contract = address[this._network.name].VestingEscrow;
    return eth.read(_contract, 'getSnapshot', [addr], trxOptions);
}


export interface VestingEscrowInterface {
    claimAMPT(options?: CallOptions): Promise<TrxResponse>;
    vestingSnapshot(addr: string, options?: CallOptions): Promise<string[]>;

    // TODO: add more methods when needed
}