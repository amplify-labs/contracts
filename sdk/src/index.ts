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
import * as factory from './factory';
import * as constants from './constants';
import { Provider, AmplifyOptions, AmplifyInstance } from './types';

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
 * var amplify = new Amplify(window.ethereum); // web browser
 * 
 * var amplify = new Amplify('http://127.0.0.1:8545'); // HTTP provider
 * 
 * var amplify = new Amplify(); // Uses Ethers.js fallback mainnet (for testing only)
 * 
 * var amplify = new Amplify('polygon_mumbai'); // Uses Ethers.js fallback (for testing only)
 * 
 * // Init with private key (server side)
 * var amplify = new Amplify('https://rpc-mumbai.maticvigil.com', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 * 
 * // Init with HD mnemonic (server side)
 * var amplify = new Amplify('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of the Amplify.js SDK.
 */
const Amplify = function (
  provider: Provider | string = 'mainnet', options: AmplifyOptions = {}
): AmplifyInstance {
  const originalProvider = provider;

  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = {
    _originalProvider: originalProvider,
    _provider: provider,
    ...asset,
    asset,
    factory,
    pool,
    loan
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
};

Amplify.eth = eth;
Amplify.util = util;
Amplify._ethers = ethers;
Amplify.constants = constants;

export = Amplify;
