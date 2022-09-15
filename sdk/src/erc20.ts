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

import { coins } from "./stablecoins";

/**
 * Approve tokens transfer
 *
 * @param {string} tokenAddress ERC20 token address.
 * @param {string} spender Spender address.
 * @param {string | BigNumber} amount Amount to transfer.
 * @param {number} decimals Token decimals.
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
    decimals = 18,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [approve] | ';

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

    if (
        typeof amount !== 'string' &&
        !ethers.BigNumber.isBigNumber(amount)
    ) {
        throw Error(errorPrefix + 'Argument `amount` must be a string, or BigNumber.');
    }
    const stableCoinInfo = coins(this._network.id)[tokenAddress.toLowerCase()];
    if (!stableCoinInfo) {
        amount = ethers.utils.parseUnits(amount.toString(), decimals);
    } else {
        amount = ethers.utils.parseUnits(amount.toString(), stableCoinInfo.decimals);
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
): Promise<string> {
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
    return result.toString();
}

/**
 * Get account balance
 * @param {string} tokenAddress ERC20 token address.
 * @param {string} addr Account address.
* @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {string} Returns a string.
 *
 * @example
 * ```
 * (async function () {
 *   const balance = await amplify.getBalance('0x34324431242314142daa');
 *   console.log('balance:', balance);
 * })().catch(console.error);
 * ```
 */
export async function getBalance(tokenAddress: string, addr: string, options?: CallOptions): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [balanceOf] | ';

    if (
        typeof addr !== 'string' &&
        !ethers.utils.isAddress(addr)
    ) {
        throw Error(errorPrefix + 'Argument `addr` must be an address');
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

    const result = await eth.read(tokenAddress, 'balanceOf', [addr], trxOptions);
    return result.toString();
}


export type Erc20Interface = {
    getBalance(tokenAddress: string, account: string, options?: CallOptions): Promise<string>;
    checkAllowance(tokenAddress: string, spender: string, options?: CallOptions): Promise<string>;
    approveTransfer(tokenAddress: string, spender: string, amount: string | BigNumber, decimals?: number, options?: CallOptions): Promise<TrxResponse>;
}
