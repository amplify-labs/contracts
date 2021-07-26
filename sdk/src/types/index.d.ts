import { Signer as AbstractSigner } from '@ethersproject/abstract-signer/lib/index';
import { FallbackProvider } from '@ethersproject/providers/lib/fallback-provider';
import { BlockTag, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { Deferrable } from '@ethersproject/properties';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
export interface AmplifyInstance {
    _networkPromise: Promise<ProviderNetwork>;
}
export interface AmplifyOptions {
    privateKey?: string;
    mnemonic?: string;
    provider?: Provider | string;
}
export interface AbiType {
    internalType?: string;
    name?: string;
    type?: string;
    components?: AbiType[];
}
export interface AbiItem {
    constant?: boolean;
    inputs?: AbiType[];
    name?: string;
    outputs?: AbiType[];
    payable?: boolean;
    stateMutability?: string;
    type?: string;
}
export interface CallOptions {
    _amplifyProvider?: Provider;
    abi?: string | string[] | AbiItem[];
    provider?: Provider | string;
    network?: string;
    from?: number | string;
    gasPrice?: number;
    gasLimit?: number;
    value?: number | string | BigNumber;
    data?: number | string;
    chainId?: number;
    nonce?: number;
    privateKey?: string;
    mnemonic?: string;
    blockTag?: number | string;
}
export interface EthersTrx {
    nonce: number;
    gasPrice: BigNumber;
    gasLimit: BigNumber;
    to: string;
    value: BigNumber;
    data: string;
    chainId: number;
    from: string;
    wait: void;
}
export interface TrxError {
    message: string;
    error: Error;
    method: string;
    parameters: any[];
}
export declare type TrxResponse = EthersTrx | TrxError;
export interface Connection {
    url?: string;
}
export interface Network {
    chainId: number;
    name: string;
}
export interface ProviderNetwork {
    id?: number;
    name?: string;
}
declare type GenericGetBalance = (addressOrName: string | number | Promise<string | number>, blockTag?: string | number | Promise<string | number>) => Promise<BigNumber>;
declare type GenericGetTransactionCount = (addressOrName: string | number | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>) => Promise<number>;
declare type GenericSendTransaction = (transaction: string | Promise<string> | Deferrable<TransactionRequest>) => Promise<TransactionResponse>;
export interface Provider extends AbstractSigner, FallbackProvider {
    connection?: Connection;
    _network: Network;
    call: AbstractSigner['call'] | FallbackProvider['call'];
    getBalance: GenericGetBalance;
    getTransactionCount: GenericGetTransactionCount;
    resolveName: AbstractSigner['resolveName'] | FallbackProvider['resolveName'];
    sendTransaction: GenericSendTransaction;
    send?: (method: string, parameters: string[]) => any;
}
export {};
