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
 * @param {string | number | BigNumber} amount Amount of tokens available in the balance.
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
    amount: string | number | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [redeem] | ';

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

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    return eth.trx(pool, 'redeemUnderlying', [amount], trxOptions);
}

/**
 * Create new creditLine
 *
 * @param {string} tokenId NFT asset ID.
 * @param {string} pool Pool address.
 *
 * @example
 * ```
 * (async function () {
 *   const creditLine = await amplify.createCreditLine('1','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Credit line:', creditLine);
 * })().catch(console.error);
 * ```
 */
export async function createCreditLine(tokenId: string, pool: string, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [createCreditLine] | ';

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

    return eth.trx(pool, 'createCreditLine', [tokenId], trxOptions);
}

/**
 * Close credit line
 *
 * @param {string} loanId loanId ID.
 * @param {string} pool Pool address.
 *
 * @example
 * ```
 * (async function () {
 *   const creditLine = await amplify.closeCreditLine('1','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Credit Line:', creditLine);
 * })().catch(console.error);
 * ```
 */
export async function closeCreditLine(loanId: string, pool: string, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [closeCreditLine] | ';

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

    return eth.trx(pool, 'closeCreditLine', [loanId], trxOptions);
}

/**
 * Borrow tokens from the Pool.
 * @param {string} pool Pool address.
 * @param {string} loanId Loan ID.
 * @param {string | number | BigNumber} amount Amount tokens to borrow.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the tokenizeAsset
 *     transaction.
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.borrow('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '1', '100');
 *   console.log('Transaction:', tx);
 * })().catch(console.error);
 * ```
 */
export async function borrow(
    pool: string,
    loanId: string,
    amount: string | number | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [borrow] | ';

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

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    return eth.trx(pool, 'borrow', [loanId, amount], trxOptions);
}

/**
 * Repay tokens into the Pool.
 * @param {string} pool Pool address.
 * @param {string} loanId Loan ID.
 * @param {string | number | BigNumber} amount Amount tokens to repay.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the tokenizeAsset
 *     transaction.
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.repay('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '100');
 *   console.log('Transaction:', tx);
 * })().catch(console.error);
 * ```
 */
export async function repay(
    pool: string,
    loanId: string,
    amount: string | number | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [repay] | ';

    if (
        typeof amount !== 'number' &&
        typeof amount !== 'string' &&
        !ethers.BigNumber.isBigNumber(amount)
    ) {
        throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
    }

    if (!BigNumber.from(amount).eq(ethers.constants.MaxUint256)) {
        amount = ethers.utils.parseEther(amount.toString());
    }

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

    return eth.trx(pool, 'repay', [loanId, amount], trxOptions);
}

/**
 * Unlock NFT asset.
 * @param {string} pool Pool address.
 * @param {string} loanId Loan ID.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the tokenizeAsset
 *     transaction.
 * @example
 * ```
 * (async function () {
 *   const tx = await amplify.unlockAsset('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '1');
 *   console.log('Transaction:', tx);
 * })().catch(console.error);
 * ```
 */
export async function unlockAsset(
    pool: string,
    loanId: string,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [unlockAsset] | ';

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

    return eth.trx(pool, 'unlockAsset', [loanId], trxOptions);
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
 * Get borrower debt amount without penalty
* @param {string} loanId Loan ID.
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for funds to be repayed.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getBorrowerDebtAmount('1','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Borrowed:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getBorrowerDebtAmount(
    loanId: string,
    pool: string,
    options: CallOptions = {}
): Promise<string[]> {
    await netId(this);
    const errorPrefix = 'Amplify [borrowerSnapshot] | ';
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

    const result = await eth.read(pool, 'borrowerSnapshot', [loanId], trxOptions);
    return result;
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

    createCreditLine(tokenId: string, pool: string, options?: CallOptions): Promise<TrxResponse>;
    closeCreditLine(loanId: string, pool: string, options?: CallOptions): Promise<TrxResponse>;

    borrow(pool: string, loanId: string, amount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    repay(pool: string, loanId: string, amount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    unlockAsset(pool: string, loanId: string, options?: CallOptions): Promise<TrxResponse>;

    getLenderBalance(lender: string, pool: string): Promise<string>;
    getBorrowerDebtAmount(loanId: string, pool: string): Promise<string[]>;
    poolLpToken(pool: string, options?: CallOptions): Promise<string>;
}