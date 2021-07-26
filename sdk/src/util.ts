/**
 * @file Utility
 * @desc These methods are helpers for the Amplify class.
 */

import { address, abi } from './constants';
import { AbiType } from './types';

/* eslint-disable */

let _request: any;
let http: any;
let https: any;

function _nodeJsRequest(options: any) {
  return new Promise<any>((resolve, reject) => {
    let url = options.url || options.hostname;

    // Use 'https' if the protocol is not specified in 'options.hostname'
    if (
      url.indexOf("http://") !== 0 &&
      url.indexOf("https://") !== 0
    ) {
      url = "https://" + url;
    }

    // Choose the right module based on the protocol in 'options.hostname'
    const httpOrHttps = url.indexOf("http://") === 0 ? http : https;

    // Remove the 'http://' so the native node.js module will understand
    options.hostname = url.split('://')[1];

    let body = '';
    const req = httpOrHttps.request(options, (res: any) => {
      res.on("data", (bodyBuffer: any) => {
        body += bodyBuffer.toString();
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          body
        });
      });
    });

    req.on('timeout', () => {
      req.abort();
      return reject({
        status: 408,
        statusText: 'Client HTTP request timeout limit reached.'
      });
    });

    req.on('error', (err: any) => {
      if (req.aborted) return;

      if (err !== null && err.toString() === '[object Object]') {
        console.error(JSON.stringify(err));
      } else {
        console.error(err);
      }

      return reject();
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function _webBrowserRequest(options: any) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let contentTypeIsSet = false;
    options = options || {};
    const method = options.method || "GET";
    let url = options.url || options.hostname;
    url += typeof options.path === "string" ? options.path : "";

    if (typeof url !== "string") {
      return reject("HTTP Request: Invalid URL.");
    }

    // Use 'https' if the protocol is not specified in 'options.hostname'
    if (
      url.indexOf("http://") !== 0 &&
      url.indexOf("https://") !== 0
    ) {
      url = "https://" + url;
    }

    xhr.open(method, url);

    for (const header in options.headers) {
      if ({}.hasOwnProperty.call(options.headers, header)) {
        const lcHeader = header.toLowerCase();
        contentTypeIsSet = lcHeader === "content-type" ? true : contentTypeIsSet;
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }

    if (!contentTypeIsSet) {
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }

    xhr.onload = function () {
      let body;
      if (xhr.status >= 100 && xhr.status < 400) {
        try {
          JSON.parse(xhr.response);
          body = xhr.response;
        } catch (e) {
          body = xhr.statusText;
        }

        return resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          body
        });
      } else {
        return reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };

    if (method !== "GET") {
      xhr.send(JSON.stringify(options.body));
    } else {
      xhr.send();
    }
  });
}

try {
  window;
  _request = _webBrowserRequest;
} catch (e) {
  http = require('http');
  https = require('https');
  _request = _nodeJsRequest;
}

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
export function request(options: any): Promise<any> {
  return _request.apply(null, [options]);
}

/* eslint-enable */

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
export function getAddress(contract: string, network = 'mainnet'): string {
  return address[network][contract];
}

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
export function getAbi(contract: string): AbiType[] {
  return abi[contract];
}

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

export let networks = [
  {
    "name": "Ethereum Mainnet",
    "chainId": 1,
    "shortName": "eth",
    "chain": "ETH",
    "network": "mainnet",
    "networkId": 1,
    "nativeCurrency": {
      "name": "Ether",
      "symbol": "ETH",
      "decimals": 18
    },
    "rpc": [
      "https://mainnet.infura.io/v3/${INFURA_API_KEY}",
      "wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}",
      "https://api.mycryptoapi.com/eth",
      "https://cloudflare-eth.com"
    ],
    "faucets": [],
    "explorers": [
      {
        "name": "etherscan",
        "url": "https://etherscan.io",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://ethereum.org"
  },
  {
    "name": "Ethereum Testnet Ropsten",
    "chainId": 3,
    "shortName": "rop",
    "chain": "ETH",
    "network": "ropsten",
    "networkId": 3,
    "nativeCurrency": {
      "name": "Ropsten Ether",
      "symbol": "ROP",
      "decimals": 18
    },
    "rpc": [
      "https://ropsten.infura.io/v3/${INFURA_API_KEY}",
      "wss://ropsten.infura.io/ws/v3/${INFURA_API_KEY}"
    ],
    "faucets": [
      "https://faucet.ropsten.be?${ADDRESS}"
    ],
    "explorers": [],
    "infoURL": "https://github.com/ethereum/ropsten"
  },
  {
    "name": "Ethereum Testnet Rinkeby",
    "chainId": 4,
    "shortName": "rin",
    "chain": "ETH",
    "network": "rinkeby",
    "networkId": 4,
    "nativeCurrency": {
      "name": "Rinkeby Ether",
      "symbol": "RIN",
      "decimals": 18
    },
    "rpc": [
      "https://rinkeby.infura.io/v3/${INFURA_API_KEY}",
      "wss://rinkeby.infura.io/ws/v3/${INFURA_API_KEY}"
    ],
    "faucets": [
      "https://faucet.rinkeby.io"
    ],
    "explorers": [],
    "infoURL": "https://www.rinkeby.io"
  },
  {
    "name": "Ethereum Testnet Görli",
    "chainId": 5,
    "shortName": "gor",
    "chain": "ETH",
    "network": "goerli",
    "networkId": 5,
    "nativeCurrency": {
      "name": "Görli Ether",
      "symbol": "GOR",
      "decimals": 18
    },
    "rpc": [
      "https://rpc.goerli.mudit.blog/",
      "https://rpc.slock.it/goerli ",
      "https://goerli.prylabs.net/"
    ],
    "faucets": [
      "https://goerli-faucet.slock.it/?address=${ADDRESS}",
      "https://faucet.goerli.mudit.blog"
    ],
    "explorers": [],
    "infoURL": "https://goerli.net/#about"
  },
  {
    "name": "Matic Mainnet",
    "chainId": 137,
    "shortName": "matic",
    "chain": "Matic",
    "network": "mainnet",
    "networkId": 137,
    "nativeCurrency": {
      "name": "Matic",
      "symbol": "MATIC",
      "decimals": 18
    },
    "rpc": [
      "https://rpc-mainnet.matic.network",
      "wss://ws-mainnet.matic.network"
    ],
    "faucets": [],
    "explorers": [],
    "infoURL": "https://matic.network/"
  },
  {
    "name": "Matic Testnet Mumbai",
    "chainId": 80001,
    "shortName": "maticmum",
    "chain": "Matic",
    "network": "testnet",
    "networkId": 80001,
    "nativeCurrency": {
      "name": "Matic",
      "symbol": "tMATIC",
      "decimals": 18
    },
    "rpc": [
      "https://rpc-mumbai.matic.today",
      "wss://ws-mumbai.matic.today"
    ],
    "faucets": [
      "https://faucet.matic.network/"
    ],
    "explorers": [],
    "infoURL": "https://matic.network/"
  }
]

export let getNetworkInfo = (chainId: string) => {
  return networks.find(n => n.chainId === parseInt(chainId));
}

export function getNetNameWithChainId(chainId: number): string {
  const networks = {
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
    42: 'kovan',
    137: 'polygon_mainet',
    80001: 'polygon_mumbai',
  };
  return networks[chainId];
}
