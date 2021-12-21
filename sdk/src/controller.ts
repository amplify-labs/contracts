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
 * Submit the borrower application
 *
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the submitBorrowerApplication
 *     transaction.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 *
 * (async function () {
 *   const trx = await amplify.submitBorrowerApplication('0x....0a');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function submitBorrowerApplication(options?: CallOptions): Promise<TrxResponse> {
    await netId(this);

    const controllerAddr = address[this._network.name].Controller;

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    return eth.trx(controllerAddr, 'submitBorrower', [], trxOptions);
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
 * Change lender status during application
 *
 * @param {string} lender Lender address
 * @param {string} pool Pool contract address
 * @param {string} status New lender status
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the changeLenderStatus
 *     transaction.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 *
 * (async function () {
 *   const trx = await amplify.changeLenderStatus('0x....0a', '0x....0a', 'whitelist');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function changeLenderStatus(lender: string, pool: string, status: string, options?: CallOptions): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [changeLenderStatus] | ';

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

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    if (status === 'whitelist') {
        return eth.trx(controllerAddr, 'whitelistLender', [lender, pool], trxOptions);
    } else if (status === 'blacklist') {
        return eth.trx(controllerAddr, 'blacklistLender', [lender], trxOptions);
    } else {
        throw Error(errorPrefix + 'Argument `status` must be either `whitelist` or `blacklist`');
    }

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
    const errorPrefix = 'Amplify [createPool] | ';

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
 * Claim the AMPT rewards
 *
 * @param {string} account Address of the account to claim rewards for
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
 *   const trx = await amplify.claimRewards('0x....0a');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function claimRewards(account: string, options?: CallOptions): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [claimRewards] | ';

    if (
        typeof account !== 'string' &&
        !ethers.utils.isAddress(account)
    ) {
        throw Error(errorPrefix + 'Argument `account` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const parameters = [account];

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    return eth.trx(controllerAddr, 'claimAMPT(address)', parameters, trxOptions);
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
 * Get pool APY
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for funds deposited.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getPoolAPY('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('APY:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getPoolAPY(
    pool: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [getPoolAPY] | ';
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    if (
        typeof pool !== 'string' &&
        !ethers.utils.isAddress(pool)
    ) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const result = await eth.read(controllerAddr, 'getPoolAPY', [pool], trxOptions);
    return result.toString();
}

/**
 * Get total supply balance
* @param {string} account Lender address.
 * @returns {string} Returns a string of the numeric total for tokens supplied.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getTotalSuppliedBalance('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('balance:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getTotalSuppliedBalance(
    account: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [getTotalSuppliedBalance] | ';
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    if (
        typeof account !== 'string' &&
        !ethers.utils.isAddress(account)
    ) {
        throw Error(errorPrefix + 'Argument `account` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const result = await eth.read(controllerAddr, 'getTotalSupplyBalance', [account], trxOptions);
    return result.toString();
}

/**
 * Get total borrowed balance
* @param {string} account Borrower address.
 * @returns {string} Returns a string of the numeric total for tokens borrowed.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getTotalBorrowedBalance('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('balance:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getTotalBorrowedBalance(
    account: string,
    options: CallOptions = {}
): Promise<string[]> {
    await netId(this);
    const errorPrefix = 'Amplify [getTotalBorrowedBalance] | ';
    const controllerOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    const poolOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Pool,
        ...options
    };

    if (
        typeof account !== 'string' &&
        !ethers.utils.isAddress(account)
    ) {
        throw Error(errorPrefix + 'Argument `account` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;
    const borrowerPools = await eth.read(controllerAddr, "getBorrowerPools", [account], controllerOptions);

    let loanIds = {};
    for (let i = 0; i < borrowerPools.length; i++) {
        const _loanIds = await eth.read(borrowerPools[i], "getBorrowerLoans", [account], poolOptions);
        loanIds = Object.assign(loanIds, {
            [borrowerPools[i]]: _loanIds
        });
    }

    const promises: Array<Promise<Array<string>>> = [];
    for (let i = 0; i < Object.keys(loanIds).length; i++) {
        const key = Object.keys(loanIds)[i];
        const values = loanIds[key];

        values.forEach((loan: BigNumber) => {
            promises.push(eth.read(key, "borrowerSnapshot", [loan], poolOptions))
        });
    }

    let totalBorrowedBalance = BigNumber.from(0);
    let totalPenalties = BigNumber.from(0);

    const values = await Promise.all(promises);
    values.forEach(([t, p]) => {
        totalBorrowedBalance = totalBorrowedBalance.add(t);
        totalPenalties = totalPenalties.add(p);
    });

    return [totalBorrowedBalance.toString(), totalPenalties.toString()];
}

/**
 * Get supply rewards balance
* @param {string} account Lender address.
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for tokens rewarded.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getSupplyReward('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('reward:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getSupplyReward(
    account: string,
    pool?: string,
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
        typeof account !== 'string' &&
        !ethers.utils.isAddress(account)
    ) {
        throw Error(errorPrefix + 'Argument `account` must be an address');
    }

    if (pool && typeof pool !== 'string' && !ethers.utils.isAddress(pool)) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;

    if (pool) {
        const result = await eth.read(controllerAddr, 'getSupplyReward', [account, pool], trxOptions);
        return result.toString();
    }
    const result = await eth.read(controllerAddr, 'getTotalSupplyReward', [account], trxOptions);
    return result.toString();
}

/**
 * Get borrow rewards balance
* @param {string} account Borrower address.
* @param {string} pool Pool address.
 * @returns {string} Returns a string of the numeric total for tokens rewarded.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getBorrowReward('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('reward:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getBorrowReward(
    account: string,
    pool?: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const errorPrefix = 'Amplify [getBorrowReward] | ';
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };

    if (
        typeof account !== 'string' &&
        !ethers.utils.isAddress(account)
    ) {
        throw Error(errorPrefix + 'Argument `account` must be an address');
    }

    if (pool && typeof pool !== 'string' && !ethers.utils.isAddress(pool)) {
        throw Error(errorPrefix + 'Argument `pool` must be an address');
    }

    const controllerAddr = address[this._network.name].Controller;

    if (pool) {
        const result = await eth.read(controllerAddr, 'getBorrowReward', [account, pool], trxOptions);
        return result.toString();
    }
    const result = await eth.read(controllerAddr, 'getTotalBorrowReward', [account], trxOptions);
    return result.toString();
}

/**
 * Get fees amount
 * @returns {string} Returns a string array of the amounts.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getFeesAmount();
 *   console.log('reward:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getFeesAmount(options: CallOptions = {}): Promise<string[]> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };
    const controllerAddr = address[this._network.name].Controller;

    const lossProvisionPoolAddr = await eth.read(controllerAddr, 'provisionPool', [], trxOptions);

    const lossTrxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.LossProvisionPool,
        ...options
    }

    let result = await eth.read(lossProvisionPoolAddr, 'lossProvisionFee', [], lossTrxOptions);
    const lossProvisionFee = result.toString();

    result = await eth.read(lossProvisionPoolAddr, 'buyBackProvisionFee', [], lossTrxOptions);
    const treasuryFee = result.toString();

    return [lossProvisionFee, treasuryFee];
}


/**
 * Get earnest amount
 * @returns {string} Returns a string array of the earnest amount.
 *
 * @example
 * ```
 * (async function () {
 *   const amount = await amplify.getEarnestAmount();
 *   console.log('earnest:', amount);
 * })().catch(console.error);
 * ```
 */
export async function getEarnestAmount(options: CallOptions = {}): Promise<string> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Controller,
        ...options
    };
    const controllerAddr = address[this._network.name].Controller;
    const result = await eth.read(controllerAddr, 'amptDepositAmount', [], trxOptions)
    return result.toString();
}

export type ControllerInterface = {
    submitLenderApplication: (pool: string, depositAmount: string | number | BigNumber, options?: CallOptions) => Promise<TrxResponse>;
    submitBorrowerApplication: (options?: CallOptions) => Promise<TrxResponse>;
    withdrawLenderDeposit: (pool: string, options?: CallOptions) => Promise<TrxResponse>;
    changeLenderStatus: (lender: string, pool: string, status: string, options?: CallOptions) => Promise<TrxResponse>;
    createPool: (name: string, minDeposit: string | number | BigNumber, stableCoin: string, poolAccess: 0 | 1, options?: CallOptions) => Promise<TrxResponse>;
    claimRewards(account: string, options?: CallOptions): Promise<TrxResponse>;
    getStableCoins(options?: CallOptions): Promise<string[]>;
    getPoolAPY(pool: string, options?: CallOptions): Promise<string>;
    getTotalSuppliedBalance(lender: string, options?: CallOptions): Promise<string>;
    getTotalBorrowedBalance(borrower: string, options?: CallOptions): Promise<string[]>;
    getSupplyReward(address: string, pool?: string, options?: CallOptions): Promise<string>;
    getBorrowReward(address: string, pool?: string, options?: CallOptions): Promise<string>;
    getFeesAmount(options?: CallOptions): Promise<string[]>;
    getEarnestAmount(options?: CallOptions): Promise<string>;
}
