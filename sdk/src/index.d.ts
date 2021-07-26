/**
 * @file Amplify
 * @desc This file defines the constructor of the `Amplify` class.
 * @hidden
 */
import * as eth from './eth';
import * as util from './util';
import * as constants from './constants';
import { Provider, AmplifyOptions, AmplifyInstance } from './types';
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
declare const Amplify: {
    (provider?: Provider | string, options?: AmplifyOptions): AmplifyInstance;
    eth: typeof eth;
    util: typeof util;
    _ethers: any;
    constants: typeof constants;
};
export = Amplify;
