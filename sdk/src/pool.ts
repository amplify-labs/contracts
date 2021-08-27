/**
 * @file Pool
 * @desc These methods facilitate interactions with the Pool smart contract.
 */

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { abi, address } from './constants';
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
 * Withdraw tokens from the Pool deposit.
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
 *   const tx = await amplify.withdraw('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', '100');
 *   console.log('Transaction:', tx);
 * })().catch(console.error);
 * ```
 */
export async function withdraw(
    pool: string,
    tokenAmount: string | number | BigNumber,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [withdraw] | ';

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

    return eth.trx(pool, 'withdraw', [tokenAmount], trxOptions);
}

/**
 * Create new loan
 *
 * @param {string} tokenId NFT asset ID.
 * @param {string} pool Pool address.
 *
 * @example
 * ```
 * (async function () {
 *   const loan = await amplify.createLoan('1','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Loan:', loan);
 * })().catch(console.error);
 * ```
 */
export async function createLoan(tokenId: string, pool: string, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [createLoan] | ';

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const nftAsset = address[this._network.name].Asset;
    const parameters = [nftAsset, tokenId];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    return eth.trx(pool, 'createLoan', parameters, trxOptions);
}

/**
 * Close loan
 *
 * @param {string} loanId loanId ID.
 * @param {string} pool Pool address.
 *
 * @example
 * ```
 * (async function () {
 *   const loan = await amplify.closeLoan('1','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Loan:', loan);
 * })().catch(console.error);
 * ```
 */
export async function closeLoan(loanId: string, pool: string, options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [closeLoan] | ';

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const parameters = [loanId];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    return eth.trx(pool, 'closeLoan', parameters, trxOptions);
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
 * Get total deposit (amount) in the pool
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for token deposited.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.poolTotalDeposited('address');
 *   console.log('Total Deposited:', total);
 * })().catch(console.error);
 * ```
 */
export async function poolTotalDeposited(
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [totalDeposited] | ';
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

    const result = await eth.read(pool, 'totalDeposited', [], trxOptions);
    return result.toString();
}

/**
 * Get total borrowed amount of the pool
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for token borrowed.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.poolTotalBorrowed('address');
 *   console.log('Total Borrowed:', total);
 * })().catch(console.error);
 * ```
 */
export async function poolTotalBorrowed(
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [totalBorrowed] | ';

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

    const result = await eth.read(pool, 'totalBorrowed', [], trxOptions);
    return result.toString();
}

/**
 * Get total available borrow amount of the pool
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for token available.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.poolTotalAvailable('address');
 *   console.log('Total Borrowed:', total);
 * })().catch(console.error);
 * ```
 */
export async function poolTotalAvailable(
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [totalAvailable] | ';
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

    const result = await eth.read(pool, 'totalAvailable', [], trxOptions);
    return result.toString();
}


/**
 * Get deposited balance
* @param {string} lender Lender address.
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for funds deposited.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.depositedBalance('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Deposited:', amount);
 * })().catch(console.error);
 * ```
 */
export async function depositedBalance(
    lender: string,
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [balances] | ';
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

    const result = await eth.read(pool, 'balances', [lender], trxOptions);
    return result.toString();
}


export interface PoolInterface {
    depositedBalance(lender: string, pool: string): Promise<string>,
    lend(pool: string, amount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    withdraw(pool: string, tokenAmount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    createLoan(tokenId: string, pool: string, options?: CallOptions): Promise<TrxResponse>;
    closeLoan(loanId: string, pool: string, options?: CallOptions): Promise<TrxResponse>;
    borrow(pool: string, loanId: string, amount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    repay(pool: string, loanId: string, amount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse>;
    unlockAsset(pool: string, loanId: string, options?: CallOptions): Promise<TrxResponse>;
    poolTotalDeposited(pool: string, options?: CallOptions): Promise<string>;
    poolTotalBorrowed(pool: string, options?: CallOptions): Promise<string>;
    poolTotalAvailable(pool: string, options?: CallOptions): Promise<string>;
}