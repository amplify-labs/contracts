/**
 * @file Loan
 * @desc These methods facilitate interactions with the Loan smart contract.
 */
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { abi } from './constants';
import { CallOptions, TrxResponse } from './types';

/**
 * Close the loan.
 * @param {string} loan Loan address.
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
 *   const trx = await amplify.closeLoan('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function closeLoan(
    loan: string,
    options: CallOptions = {}
): Promise<TrxResponse> {
    await netId(this);
    const errorPrefix = 'Amplify [closeLoan] | ';

    if (
        typeof loan !== 'string' &&
        !ethers.utils.isAddress(loan)
    ) {
        throw Error(errorPrefix + 'Argument `loan` must be an address');
    }


    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Loan,
        ...options
    };

    return eth.trx(loan, 'close', [], trxOptions);
}

/**
 * Get total allowed loan amount
* @param {string} loan Loan address.
 * @returns {string} Returns a string of the numeric total for amount allowed to borrow.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.loanTotalAllowed('address');
 *   console.log('Total Allowed:', total);
 * })().catch(console.error);
 * ```
 */
export async function loanTotalAllowed(
    loan: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Loan,
        ...options
    };

    const result = await eth.read(loan, 'getAllowanceAmount', [], trxOptions);
    return result.toString();
}

/**
 * Get total available loan amount
* @param {string} loan Loan address.
 * @returns {string} Returns a string of the numeric total for token available to borrow.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.loanTotalAvailable('address');
 *   console.log('Total Borrowed:', total);
 * })().catch(console.error);
 * ```
 */
export async function loanTotalAvailable(
    loan: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Loan,
        ...options
    };

    const result = await eth.read(loan, 'getAvailableAmount', [], trxOptions);
    return result.toString();
}

/**
 * Get debt amount
* @param {string} loan Loan address.
 * @returns {string} Returns a string of the numeric total amount token debt.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.loanDebtAmount('address');
 *   console.log('Total Debt:', total);
 * })().catch(console.error);
 * ```
 */
export async function loanDebtAmount(
    loan: string,
    options: CallOptions = {}
): Promise<string> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Loan,
        ...options
    };

    const result = await eth.read(loan, 'getDebtAmount', [], trxOptions);
    return result.toString();
}

/**
 * Check if the loan is closed
* @param {string} loan Loan address.
 * @returns {string} Returns a boolean if loan is closed.
 *
 * @example
 * ```
 * (async function () {
 *   const isClosed = await amplify.isLoanClosed('address');
 *   console.log('Loan closed:', isClosed);
 * })().catch(console.error);
 * ```
 */
export async function isLoanClosed(
    loan: string,
    options: CallOptions = {}
): Promise<boolean> {
    await netId(this);
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Loan,
        ...options
    };

    const result = await eth.read(loan, 'isClosed', [], trxOptions);
    return result;
}

export interface LoanInterface {
    closeLoan(loan: string, options?: CallOptions): Promise<TrxResponse>;
    loanTotalAllowed(loan: string, options?: CallOptions): Promise<string>;
    loanTotalAvailable(loan: string, options?: CallOptions): Promise<string>;
    loanDebtAmount(loan: string, options?: CallOptions): Promise<string>;
    isLoanClosed(loan: string, options?: CallOptions): Promise<string>;
}