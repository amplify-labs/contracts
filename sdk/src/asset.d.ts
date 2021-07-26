/**
 * @file Asset
 * @desc These methods facilitate interactions with the Asset smart contract.
 */
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { CallOptions, TrxResponse } from './types';
/**
 * Tokenize a given asset
 *
 * @param {string} to Owner address.
 * @param {string} tokenId Token Id.
 * @param {string | number | BigNumber} value Value of the asset in USD.
 * @param {string | number | BigNumber} maturity Maturity of the asset.
 * @param {string} tokenURI URI for Token.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the tokenizeAsset
 *     transaction.
 *
 * @example
 * ```
 * const amplify = new Amplify(window.ethereum);
 *
 * (async function () {
 *   const trx = await amplify.tokenizeAsset('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', 'token-001', 20000, 1, 'asset-uri://token-001');
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export declare function tokenizeAsset(to: string, tokenId: string, value: string | number | BigNumber, maturity: string | number | BigNumber, tokenURI: string, options?: CallOptions): Promise<TrxResponse>;
/**
 * Get token total supply
 *
 * @returns {string} Returns a string of the numeric total for token supplied.
 *
 * @example
 * ```
 * (async function () {
 *   const total = await amplify.totalSupply();
 *   console.log('Total Supply:', total);
 * })().catch(console.error);
 * ```
 */
export declare function totalSupply(options?: CallOptions): Promise<string>;
/**
 * Get tokens for an owner
 *
 * @param {string} owner Owner address.
 *
 * @returns {string} Returns tokens for an owner
 *
 * @example
 * ```
 * (async function () {
 *   const tokens = await amplify._tokensOfOwner('0x916cCC0963dEB7BEA170AF7822242A884d52d4c7');
 *   console.log('Tokens:', tokens);
 * })().catch(console.error);
 * ```
 */
export declare function _tokensOfOwner(owner: string, options?: CallOptions): Promise<string>;
