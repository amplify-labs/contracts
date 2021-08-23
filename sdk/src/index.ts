/**
 * @file Amplify
 * @desc This file defines the constructor of the `Amplify` class.
 * @hidden
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as asset from './asset';
import * as pool from './pool';
import * as loan from './loan';
import * as erc20 from './erc20';
import * as factory from './factory';
import * as constants from './constants';
import * as types from './types';

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Amplify.js SDK.
 *
 * @param {Provider | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {object} [options] Optional provider options.
 *
 * @example
 * ```
 * var amplify = Amplify.createInstance(window.ethereum); // web browser
 * 
 * var amplify = Amplify.createInstance('http://127.0.0.1:8545'); // HTTP provider
 * 
 * var amplify = Amplify.createInstance(); // Uses Ethers.js fallback mainnet (for testing only)
 * 
 * var amplify = Amplify.createInstance('polygon_mumbai'); // Uses Ethers.js fallback (for testing only)
 * 
 * // Init with private key (server side)
 * var amplify = Amplify.createInstance('https://rpc-mumbai.maticvigil.com', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 * 
 * // Init with HD mnemonic (server side)
 * var amplify = Amplify.createInstance('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of the Amplify.js SDK.
 */
function createInstance(provider: types.Provider | string = 'mainnet', options: types.AmplifyOptions = {}): types.AmplifyInstance {
  const originalProvider = provider;

  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = {
    _originalProvider: originalProvider,
    _provider: provider,
    ...asset,
    ...factory,
    ...pool,
    ...loan,
    ...erc20
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
}


const Amplify = {
  createInstance: createInstance,
  eth,
  util,
  constants,
  _ethers: ethers,
}

export { types as Types }
export default Amplify;
