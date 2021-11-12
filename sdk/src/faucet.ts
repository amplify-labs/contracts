/**
 * @file Factory
 * @desc These methods facilitate interactions with the Factory smart contract.
 */
import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address, abi } from './constants';
import { CallOptions, TrxResponse } from './types';


/**
 * Get faucet total supply
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 * 
 * (async function () {
 *   const trx = await amplify.faucetBalanceOf();
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function faucetBalanceOf(options: CallOptions = {}): Promise<string> {
    await netId(this);

    const contractAddr = address[this._network.name].Faucet;

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Faucet,
        ...options
    };

    const result = await eth.read(contractAddr, 'balanceOf', [], trxOptions);
    return result.toString();
}

/**
 * Receive faucet AMPT tokens
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 *
 * @example
 * ```
 * const amplify = Amplify.createInstance(window.ethereum);
 * 
 * (async function () {
 *   const trx = await amplify.getFaucetTokens();
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function getFaucetTokens(options: CallOptions = {}): Promise<TrxResponse> {
    await netId(this);

    const contractAddr = address[this._network.name].Faucet;

    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Faucet,
        ...options
    };

    return eth.trx(contractAddr, 'getTokens', [], trxOptions);
}

/**
 * Check is already receive faucet AMPT tokens
 * @param addr Address to check
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 * transaction. A passed `gasLimit` will be used in both the `approve` (if
 * not supressed) and `mint` transactions.
 * @returns {boolean} Returns a boolean is received.
 *
 * @example
 * ```
 * (async function () {
 *   const receivedTokens = await amplify.receivedFaucetTokens('0xf234424234324234');
 *   console.log('Received tokens:', receivedTokens);
 * })().catch(console.error);
 * ```
 */
export async function receivedFaucetTokens(addr: string, options: CallOptions = {}): Promise<boolean> {
    await netId(this);
    const errorPrefix = 'Amplify [distributions] | ';

    const contractAddr = address[this._network.name].Faucet;
    const trxOptions: CallOptions = {
        _amplifyProvider: this._provider,
        abi: abi.Faucet,
        ...options
    };

    if (
        typeof addr !== 'string' &&
        !ethers.utils.isAddress(addr)
    ) {
        throw Error(errorPrefix + 'Argument `addr` must be an address');
    }

    const result = await eth.read(contractAddr, 'distributions', [addr], trxOptions);
    return result;
}

export interface FaucetInterface {
    faucetBalanceOf(options?: CallOptions): Promise<string>;
    getFaucetTokens(options?: CallOptions): Promise<TrxResponse>;
    receivedFaucetTokens(addr: string, options?: CallOptions): Promise<boolean>;
}