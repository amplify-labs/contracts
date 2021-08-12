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
 * Add an stable coin to the factory contract.
 *
 * @param {string} stableCoin Token address.
 *
 * @example
 * ```
 * const amplify = new Amplify(window.ethereum);
 * 
 * (async function () {
 *   const trx = await amplify.addStableCoin('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function addStableCoin(stableCoin: string, options: CallOptions = {}): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Amplify [addStableCoin] | ';

  if (
    typeof stableCoin !== 'string' &&
    !ethers.utils.isAddress(stableCoin)
  ) {
    throw Error(errorPrefix + 'Argument `stableCoin` must be an address');
  }

  const factoryAddress = address[this._network.name].Factory;
  const parameters = [stableCoin];

  const trxOptions: CallOptions = {
    _amplifyProvider: this._provider,
    abi: abi.Factory,
    ...options
  };

  return eth.trx(factoryAddress, 'addStableCoin', parameters, trxOptions);
}

/**
 * Remove a stable coin to the factory contract.
 *
 * @param {string} stableCoin Token address.
 *
 * @example
 * ```
 * const amplify = new Amplify(window.ethereum);
 * 
 * (async function () {
 *   const trx = await amplify.removeStableCoin('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function removeStableCoin(stableCoin: string, options: CallOptions = {}): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Amplify [removeStableCoin] | ';

  if (
    typeof stableCoin !== 'string' &&
    !ethers.utils.isAddress(stableCoin)
  ) {
    throw Error(errorPrefix + 'Argument `stableCoin` must be an address');
  }

  const factoryAddress = address[this._network.name].Factory;
  const parameters = [stableCoin];

  const trxOptions: CallOptions = {
    _amplifyProvider: this._provider,
    abi: abi.Factory,
    ...options
  };

  return eth.trx(factoryAddress, 'removeStableCoin', parameters, trxOptions);
}


/**
 * Create new pool
 *
 * @param {string} owner Owner address.
 * @param {string} structureType Pool structure Type.
 * @param {string} stableCoin Pool stableCoin.
 * @param {number} minDeposit Pool min Deposit amount.
 *
 * @example
 * ```
 * (async function () {
 *   const tokens = await amplify.createPool('USDT-1','discounting', '0x916cCC0963dEB7BEA170AF7822242A884d52d4c7', 0.1);
 *   console.log('Tokens:', tokens);
 * })().catch(console.error);
 * ```
 */
export async function createPool(name: string, structureType: string, stableCoin: string, minDeposit: number, options: CallOptions = {}): Promise<TrxResponse> {
  await netId(this);
  const errorPrefix = 'Amplify [createPool] | ';

  if (
    typeof stableCoin !== 'string' &&
    !ethers.utils.isAddress(stableCoin)
  ) {
    throw Error(errorPrefix + 'Argument `stableCoin` must be an address');
  }

  const factoryAddress = address[this._network.name].Factory;
  const minDepositVal = ethers.BigNumber.from(String(minDeposit));
  const parameters = [name, structureType, stableCoin, minDepositVal];

  const trxOptions: CallOptions = {
    _amplifyProvider: this._provider,
    abi: abi.Factory,
    ...options
  };

  return eth.trx(factoryAddress, 'createPool', parameters, trxOptions);
}