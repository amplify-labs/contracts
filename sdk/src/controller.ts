/**
 * @file Controller
 * @desc These methods facilitate interactions with the Controller smart contract.
 */

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address, abi } from './constants';
import { CallOptions, TrxResponse } from './types';

/**
 * Submit the lender application
 *
 * @param {string} pool Pool contract address
 * @param {string | number | BigNumber} depositAmount Amount of tokens intended to be deposited
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the submitLenderApplication
 *     transaction.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 *
 * (async function () {
 *   const trx = await amplify.submitLenderApplication('0x....0a', 100);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function submitLenderApplication(pool: string, depositAmount: string | number | BigNumber, options?: CallOptions): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [requestPoolWhitelist] | ';

    if (
        typeof depositAmount !== 'number' &&
        typeof depositAmount !== 'string' &&
        !ethers.BigNumber.isBigNumber(depositAmount)
    ) {
        throw Error(errorPrefix + 'Argument `depositAmount` must be a string, number, or BigNumber.');
    }
    depositAmount = ethers.utils.parseEther(depositAmount.toString());

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const parameters = [pool, depositAmount];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    return eth.trx(controllerAddr, 'requestPoolWhitelist', parameters, trxOptions);
}


/**
 * Withdraw tokens deposited during application
 *
 * @param {string} pool Pool contract address
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the withdrawLenderDeposit
 *     transaction.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 *
 * (async function () {
 *   const trx = await amplify.withdrawLenderDeposit('0x....0a');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function withdrawLenderDeposit(pool: string, options?: CallOptions): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [withdrawApplicationDeposit] | ';

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const parameters = [pool];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    return eth.trx(controllerAddr, 'withdrawApplicationDeposit', parameters, trxOptions);
}


/**
 * Create a borrrowing pool
 *
 * @param {string} name Name of the pool
 * @param {string | number | BigNumber} depositAmount Amount of tokens intended to be deposited
 * @param {string} stableCoin address of the stable coin
 * @param {number} poolAccess Access level of the pool
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the createPool
 *     transaction.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 *
 * (async function () {
 *   const trx = await amplify.createPool('Test', 100000000, '0x....0a', 0);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function createPool(name: string, minDeposit: string | number | BigNumber, stableCoin: string, poolAccess: 0 | 1, options?: CallOptions): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [requestPoolWhitelist] | ';

    if (
        typeof minDeposit !== 'number' &&
        typeof minDeposit !== 'string' &&
        !ethers.BigNumber.isBigNumber(minDeposit)
    ) {
        throw Error(errorPrefix + 'Argument `minDeposit` must be a string, number, or BigNumber.');
    }
    minDeposit = ethers.utils.parseEther(minDeposit.toString());

    if (
        typeof stableCoin !== 'string' &&
        !ethers.utils.isAddress(stableCoin)
    ) {
        throw Error(errorPrefix + 'Argument `stableCoin` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const parameters = [name, minDeposit, stableCoin, poolAccess];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    return eth.trx(controllerAddr, 'createPool', parameters, trxOptions);
}


/**
 * Get factory supported stable coins
 * @returns {array} Returns an array of addresesd.
 *
 * @example
 * ```
 * (async function () {
 *   const stableCoins = await amplify.getStableCoins();
 *   console.log('Supported coin:', stableCoins);
 * })().catch(console.error);
 * ```
 */
export async function getStableCoins(options: CallOptions = {}): Promise<string[]> {
    await netId(this);

    const factoryAddress = address[this._network.name].Controller;
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    const result = await eth.read(factoryAddress, 'getStableCoins', [], trxOptions);
    return result;
}


/**
 * Get lender reward balance
* @param {string} lender Lender address.
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for funds deposited.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getSupplyRewardAmount('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7','0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Deposited:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getSupplyRewardAmount(
    lender: string,
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [getSupplyReward] | ';
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
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

    const controllerAddr = address[this._network.name].Controller;
    const result = await eth.read(controllerAddr, 'getSupplyReward', [lender, pool], trxOptions);
    return result.toString();
}


export type ControllerInterface = {
    submitLenderApplication: (pool: string, depositAmount: string | number | BigNumber, options?: CallOptions) => Promise<TrxResponse>;
    withdrawLenderDeposit: (pool: string, options?: CallOptions) => Promise<TrxResponse>;
    createPool: (name: string, minDeposit: string | number | BigNumber, stableCoin: string, poolAccess: 0 | 1, options?: CallOptions) => Promise<TrxResponse>;
    getStableCoins(options?: CallOptions): Promise<string[]>;
    getSupplyRewardAmount(lender: string, pool: string, options?: CallOptions): Promise<string>;
}
