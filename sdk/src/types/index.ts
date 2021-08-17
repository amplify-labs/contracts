import {
  Signer as AbstractSigner
} from '@ethersproject/abstract-signer/lib/index';
import {
  FallbackProvider
} from '@ethersproject/providers/lib/fallback-provider';
import {
  BlockTag, TransactionRequest, TransactionResponse
} from '@ethersproject/abstract-provider';
import { Deferrable } from '@ethersproject/properties';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';


import type * as PoolContract from '../pool';
import type * as LoanContract from '../loan';
import type * as AssetContract from '../asset';
import type * as FactoryContract from '../factory';

// =-=-=-=-=-= /src/index.ts =-=-=-=-=-=
export interface AmplifyInstance {
  _networkPromise: Promise<ProviderNetwork>;
  pool: typeof PoolContract;
  loan: typeof LoanContract;
  asset: typeof AssetContract;
  factory: typeof FactoryContract;
}
export interface AmplifyOptions {
  privateKey?: string;
  mnemonic?: string;
  provider?: Provider | string;
}


// =-=-=-=-=-= /src/eth.ts =-=-=-=-=-=

export interface AbiType {
  internalType?: string;
  name?: string;
  type?: string;
  components?: AbiType[],
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
  // blockNumber?: string;
  // id?: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any[];
}

export type TrxResponse = EthersTrx | TrxError;

export interface Connection {
  url?: string;
}

export interface Network {
  chainId: number,
  name: string
}

export interface ProviderNetwork {
  id?: number;
  name?: string;
}

type GenericGetBalance = (
  addressOrName: string | number | Promise<string | number>,
  blockTag?: string | number | Promise<string | number>
) => Promise<BigNumber>;

type GenericGetTransactionCount = (
  addressOrName: string | number | Promise<string>,
  blockTag?: BlockTag | Promise<BlockTag>
) => Promise<number>;

type GenericSendTransaction = (
  transaction: string | Promise<string> | Deferrable<TransactionRequest>
) => Promise<TransactionResponse>;

export interface Provider extends AbstractSigner, FallbackProvider {
  connection?: Connection;
  _network: Network;
  call: AbstractSigner['call'] | FallbackProvider['call'];
  getBalance: GenericGetBalance;
  getTransactionCount: GenericGetTransactionCount;
  resolveName: AbstractSigner['resolveName'] | FallbackProvider['resolveName'];
  sendTransaction: GenericSendTransaction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send?: (method: string, parameters: string[]) => any;
}

