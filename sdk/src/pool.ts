/**
 * @file Pool
 * @desc These methods facilitate interactions with the Pool smart contract.
 */

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { abi } from './constants';
import { CallOptions, TrxResponse } from './types';

/**
 * Lend tokens in the Pool.
 * @param {string} pool Pool address.
 * @param {string | number | BigNumber} amount Value of the asset in USD.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the tokenizeAsset
 *     transaction.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 * 
 * (async function () {
 *   const trx = await amplify.lend('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '100');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function lend(
    pool: string,
    amount: string | number | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [lend] | ';

    if (
        typeof amount !== 'number' &&
        typeof amount !== 'string' &&
        !ethers.BigNumber.isBigNumber(amount)
    ) {
        throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
    }
    amount = ethers.utils.parseEther(amount.toString());

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }


    const parameters = [amount];
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    return eth.trx(pool, 'lend', parameters, trxOptions);
}

/**
 * Redeem tokens from the Pool deposit.
 * @param {string} pool Pool address.
 * @param {string | number | BigNumber} tokenAmount Amount of LP tokens available in the balance.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the tokenizeAsset
 *     transaction.
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.redeem('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '100');
 *   console.log('Transaction:', tx);
 * })().catch(console.error);
 * ```
 */
export async function redeem(
    pool: string,
    tokenAmount: string | number | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [redeem] | ';

    if (
        typeof tokenAmount !== 'number' &&
        typeof tokenAmount !== 'string' &&
        !ethers.BigNumber.isBigNumber(tokenAmount)
    ) {
        throw Error(errorPrefix + 'Argument `tokenAmount` must be a string, number, or BigNumber.');
    }
    tokenAmount = ethers.utils.parseEther(tokenAmount.toString());

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    return eth.trx(pool, 'redeem', [tokenAmount], trxOptions);
}

/**
 * Get lender balance
* @param {string} lender Lender address.
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for funds deposited.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getLenderBalance('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Deposited:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getLenderBalance(
    lender: string,
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [balanceOfUnderlying] | ';
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    if (
        typeof lender !== 'string' &&
        !ethers.utils.isAddress(lender)
    ) {
        throw Error(errorPrefix + 'Argument `lender` must be an address');
    }

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const result = await eth.read(pool, 'balanceOfUnderlying', [lender], trxOptions);
    return result.toString();
}

/**
 * Get Pool LP token address
* @param {string} pool Pool address.
 *
 * @example
 * ```
 * (async function () {
 *   const addr = await amplify.poolLpToken('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Address:', addr);
 * })().catch(console.error);
 * ```
 */
export async function poolLpToken(
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [lpToken] | ';
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const result = await eth.read(pool, 'lpToken', [], trxOptions);
    return result.toString();
}

export interface PoolInterface {
    lend(pool: string, amount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    redeem(pool: string, tokenAmount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    getLenderBalance(lender: string, pool: string): Promise<string>;
    poolLpToken(pool: string, options?: CallOptions): Promise<string>;
}