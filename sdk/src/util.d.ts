/**
 * @file Utility
 * @desc These methods are helpers for the Amplify class.
 */
import { AbiType } from './types';
/**
 * A generic HTTP request method that works in Node.js and the Web Browser.
 *
 * @param {object} options HTTP request options. See Node.js http.request
 *     documentation for details.
 *
 * @hidden
 *
 * @returns {Promise<object>} Returns a promise and eventually an HTTP response
 *     (JavaScript object).
 */
export declare function request(options: any): Promise<any>;
/**
 * Gets the contract address of the named contract. This method supports
 *     contracts used by the Amplify Protocol.
 *
 * @param {string} contract The name of the contract.
 * @param {string} [network] Optional name of the Ethereum network. Main net and
 *     all the popular public test nets are supported.
 *
 * @returns {string} Returns the address of the contract.
 *
 * @example
 * ```
 * console.log('cETH Address: ', Amplify.util.getAddress(Amplify.cETH));
 * ```
 */
export declare function getAddress(contract: string, network?: string): string;
/**
 * Gets a contract ABI as a JavaScript array. This method supports
 *     contracts used by the Amplify Protocol.
 *
 * @param {string} contract The name of the contract.
 *
 * @returns {Array} Returns the ABI of the contract as a JavaScript array.
 *
 * @example
 * ```
 * console.log('cETH ABI: ', Amplify.util.getAbi('cEther'));
 * ```
 */
export declare function getAbi(contract: string): AbiType[];
/**
 * Gets the name of an Ethereum network based on its chain ID.
 *
 * @param {string} chainId The chain ID of the network.
 *
 * @returns {string} Returns the name of the Ethereum network.
 *
 * @example
 * ```
 * console.log('Mumbai : ', Amplify.util.getNetNameWithChainId(80001));
 * ```
 */
export declare let networks: ({
    name: string;
    chainId: number;
    shortName: string;
    chain: string;
    network: string;
    networkId: number;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpc: string[];
    faucets: any[];
    explorers: {
        name: string;
        url: string;
        standard: string;
    }[];
    infoURL: string;
} | {
    name: string;
    chainId: number;
    shortName: string;
    chain: string;
    network: string;
    networkId: number;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpc: string[];
    faucets: string[];
    explorers: any[];
    infoURL: string;
})[];
export declare let getNetworkInfo: (chainId: string) => any;
export declare function getNetNameWithChainId(chainId: number): string;
