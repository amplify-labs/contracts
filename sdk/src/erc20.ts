/**
 * @file Erc20
 * @desc These methods facilitate interactions with the ERC20 smart contracts.
 */

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { abi } from './constants';
import { CallOptions, TrxResponse } from './types';

/**
 * Approve tokens transfer
 *
 * @param {string} tokenAddress ERC20 token address.
 * @param {string} spender Spender address.
 * @param {string | BigNumber} amount Amount to transfer.
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *  transaction. A passed `gasLimit` will be used in both the `approve` (if
 *  not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.approveTransfer('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', 100);
 *   console.log('Tx:', tx);
 * })().catch(console.error);
 * ```
 */
export async function approveTransfer(
    tokenAddress: string,
    spender: string,
    amount: string | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [approve] | ';


    if (
        typeof amount !== 'string' &&
        !ethers.BigNumber.isBigNumber(amount)
    ) {
        throw Error(errorPrefix + 'Argument `amount` must be a string, or BigNumber.');
    }
    amount = ethers.utils.parseEther(amount.toString());

    if (
        typeof spender !== 'string' &&
        !ethers.utils.isAddress(spender)
    ) {
        throw Error(errorPrefix + 'Argument `spender` must be an address');
    }

    if (
        typeof tokenAddress !== 'string' &&
        !ethers.utils.isAddress(tokenAddress)
    ) {
        throw Error(errorPrefix + 'Argument `tokenAddress` must be an address');
    }

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.ERC20,
        ...options
    };

    return eth.trx(tokenAddress, 'approve', [spender, amount], trxOptions);
}


/**
 * Check spender allowance
 *
 * @param {string} tokenAddress ERC20 token address.
 * @param {string} spender Spender address.
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *  transaction. A passed `gasLimit` will be used in both the `approve` (if
 *  not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.checkAllowance('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Tx:', tx);
 * })().catch(console.error);
 * ```
 */
export async function checkAllowance(
    tokenAddress: string,
    spender: string,
    options: CallOptions = {}
): Promise<boolean> {
    await netId(this);
    const errorPrefix = 'Amplify [allowance] | ';

    if (
        typeof spender !== 'string' &&
        !ethers.utils.isAddress(spender)
    ) {
        throw Error(errorPrefix + 'Argument `spender` must be an address');
    }

    if (
        typeof tokenAddress !== 'string' &&
        !ethers.utils.isAddress(tokenAddress)
    ) {
        throw Error(errorPrefix + 'Argument `tokenAddress` must be an address');
    }

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.ERC20,
        ...options
    };

    const result = await eth.read(tokenAddress, 'allowance', [options.from, spender], trxOptions);
    return result > 0;
}

export type Erc20Interface = {
    checkAllowance(tokenAddress: string, spender: string, options?: CallOptions): Promise<boolean>;
    approveTransfer(tokenAddress: string, spender: string, amount: string | BigNumber, options?: CallOptions): Promise<TrxResponse>;
}
