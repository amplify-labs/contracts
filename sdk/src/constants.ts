import { Network } from "./types";

import * as ControllerAbi from "./abis/Controller";
import * as ERC20Abi from "./abis/ERC20";
import * as PoolAbi from "./abis/Pool";
import * as AssetAbi from "./abis/Asset";
import * as LossProvisionPoolAbi from "./abis/LossProvisionPool";
import * as AmptAbi from "./abis/Ampt";
import * as VotingAbi from "./abis/Voting";
import * as VestingAbi from "./abis/Vesting";

export const address = {
  "mainnet": {
    "Controller": "",
    "Asset": "",
    "SmartWalletChecker": "",
    "VotingEscrow": "",
    "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "AMPT": "0x3f17cfad23c2014c5a32722557df87dff46819da",
    "Faucet": "",
    "VestingFactory": "",
    "VestingLibrary": "",
    "VestingEscrow": ""
  },
  "polygon_mainet": {
    "Controller": "0xCCc4Ca1a879b0eBA980ED682685619982881F321",
    "Asset": "0x9de343e728783268C5905492012Ac77f593E06B5",
    "SmartWalletChecker": "",
    "VotingEscrow": "",
    "DAI": "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    "USDC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "USDT": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    "AMPT": "0x4ED92A1De77EE2638A2a42bE48DD4720B3A2734a",
    "Faucet": "",
    "VestingFactory": "0xC2FD447DbF4C8ABBB7e952d4605cdEbC58E23aBD",
    "VestingLibrary": "0x59699F096d51c0Ca936dEaca4e2Fc6590AC5eFB0",
    "VestingEscrow": "0x2673e2Cf4AaD5359D7961627F97E5F85A94cE497"
  },
  "polygon_mumbai": {
    "Controller": "0xd54c2030c82eE11bEf7C26F4111A022FDEcbc46e",
    "Asset": "0xcC91E89aA32A4c76d9f9D4f24Fc8bF69eA0a70B6",
    "SmartWalletChecker": "0x46BE7f9ED7360E0782570E032b3BdCF3aD21e1f1",
    "VotingEscrow": "0x1499bf7f8309EfDE551ACC1128fA3068f053981D",
    "DAI": "0x86321ca156c655d151474a054f25970acb5b42a8",
    "USDC": "0xeb80b946d57902d92c5b90bd8f4968ce3c8c4f9e",
    "USDT": "0x6861fa406ff83036fb127c7f462a1906f776c3c1",
    "AMPT": "0x5224EDEE5eeB2A22a319BB9D0D9610fD925FD44f",
    "Faucet": "0xAA2138959B314298A065dF2ed5F9cC83b6F4d9d9",
    "VestingFactory": "0x100dE7c586f9B0932487426F208bd8B8E8eD8994",
    "VestingLibrary": "0x0D654d6C51DA05F1AF530223D58bb301f1894B96",
    "VestingEscrow": "0xEEa8Eb9ba32aFE59bD28880935A760E73E790a29"
  },
  "velas_testnet": {
    "Asset": "0xb8A7E3Ac3010eF846e9cAC18895AA82D35b50865",
    "DAI": "0xBdf5575Ec1cC0a14Bd3e94648a2453fdC7B56943",
    "USDC": "0x78539503451048575ee5d003f1CAaE66d1cd9552",
    "USDT": "0x281Af75C2919A1F579b507F4Ab8ce77fcAcD4197",
    "AMPT": "0x428d561f82bbb9322e5a634490722F26714d4DcA",
    "SmartWalletChecker": "0x7593E8fC59cB7fB3839A2B4815576C68b3df23FF",
    "VotingEscrow": "0x7A05280940A23749106D8Fb2cA4b10B9D1C89067",
    "Faucet": "0xF3f43F5490D1d86CF186d5B3474E21FD96BD4395",
    "VestingFactory": "0xD5279eEC28361352F644c800BaE754cC353E8FBb",
    "VestingLibrary": "0xD70307659Ef7870F452Ee01031f45A2f66b65243",
    "VestingEscrow": "0x3723a8F55431aB3175F83D25fEE68715E8f86f73"
  }
};

export const supportedStableCoins = {
  DAI: {
    symbol: "DAI",
    decimals: 18,
    logoUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=002",
  },
  USDC: {
    symbol: "USDC",
    decimals: 18,
    logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=002",
  },
  USDT: {
    symbol: "USDT",
    decimals: 18,
    logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=002",
  },
  AMPT: {
    symbol: "AMPT",
    decimals: 18,
    logoUrl: "https://ampt.finance/logo-small.png",
  },
}

export const networks: Network[] = [
  {
    "name": "Ethereum Mainnet",
    "chainId": 1,
    "shortName": "eth",
    "chain": "Ethereum",
    "network": "mainnet",
    "networkId": 1,
    "nativeCurrency": {
      "name": "Ether",
      "symbol": "ETH",
      "decimals": 18
    },
    "rpc": [
      `https://mainnet.infura.io/v3/9db365cb1fb444c4afbe9a3a3f1e7faf`,
      `wss://mainnet.infura.io/ws/v3/9db365cb1fb444c4afbe9a3a3f1e7faf`,
      "https://api.mycryptoapi.com/eth",
      "https://cloudflare-eth.com"
    ],
    "faucets": [],
    "explorers": [
      {
        "name": "etherscan",
        "url": "https://etherscan.io/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://ethereum.org"
  },
  {
    "name": "Ethereum Testnet Ropsten",
    "chainId": 3,
    "shortName": "rop",
    "chain": "Ethereum",
    "network": "ropsten",
    "networkId": 3,
    "nativeCurrency": {
      "name": "Ropsten Ether",
      "symbol": "ROP",
      "decimals": 18
    },
    "rpc": [
      `https://ropsten.infura.io/v3/9db365cb1fb444c4afbe9a3a3f1e7faf`,
      `wss://ropsten.infura.io/ws/v3/9db365cb1fb444c4afbe9a3a3f1e7faf`
    ],
    "faucets": [
      "https://faucet.ropsten.be?${ADDRESS}"
    ],
    "explorers": [
      {
        "name": "etherscan",
        "url": "https://ropsten.etherscan.io/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://github.com/ethereum/ropsten"
  },
  {
    "name": "Ethereum Testnet Rinkeby",
    "chainId": 4,
    "shortName": "rin",
    "chain": "Ethereum",
    "network": "rinkeby",
    "networkId": 4,
    "nativeCurrency": {
      "name": "Rinkeby Ether",
      "symbol": "RIN",
      "decimals": 18
    },
    "rpc": [
      `https://rinkeby.infura.io/v3/9db365cb1fb444c4afbe9a3a3f1e7faf`,
      `wss://rinkeby.infura.io/ws/v3/9db365cb1fb444c4afbe9a3a3f1e7faf`
    ],
    "faucets": [
      "https://faucet.rinkeby.io"
    ],
    "explorers": [
      {
        "name": "etherscan",
        "url": "https://rinkeby.etherscan.io/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://www.rinkeby.io"
  },
  {
    "name": "Ethereum Testnet G??rli",
    "chainId": 5,
    "shortName": "gor",
    "chain": "Ethereum",
    "network": "goerli",
    "networkId": 5,
    "nativeCurrency": {
      "name": "G??rli Ether",
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
    "explorers": [
      {
        "name": "etherscan",
        "url": "https://goerli.etherscan.io/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://goerli.net/#about"
  },
  {
    "name": "Matic Mainnet",
    "chainId": 137,
    "shortName": "matic",
    "chain": "Polygon",
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
    "explorers": [
      {
        "name": "polygonscan",
        "url": "https://polygonscan.com/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://matic.network/"
  },
  {
    "name": "Matic Testnet Mumbai",
    "chainId": 80001,
    "shortName": "maticmum",
    "chain": "Polygon",
    "network": "testnet",
    "networkId": 80001,
    "nativeCurrency": {
      "name": "Matic",
      "symbol": "MATIC",
      "decimals": 18
    },
    "rpc": [
      "https://rpc-mumbai.maticvigil.com/",
      "https://rpc-mumbai.matic.today",
      "wss://ws-mumbai.matic.today"
    ],
    "faucets": [
      "https://faucet.matic.network/"
    ],
    "explorers": [
      {
        "name": "polygonscan",
        "url": "https://mumbai.polygonscan.com/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://matic.network/"
  },
  {
    "name": "Velas Testnet",
    "chainId": 111,
    "shortName": "velastest",
    "chain": "Velas",
    "network": "testnet",
    "networkId": 111,
    "nativeCurrency": {
      "name": "Velas",
      "symbol": "VLX",
      "decimals": 18
    },
    "rpc": [
      "https://testnet.velas.com/rpc",
      "https://evmexplorer.testnet.velas.com/rpc",
    ],
    "faucets": [
      "Testnet Faucet Bot"
    ],
    "explorers": [
      {
        "name": "evmexplorer",
        "url": "https://explorer.testnet.velas.com/",
        "standard": "EIP3091"
      }
    ],
    "infoURL": "https://velas.com/"
  }
]
// TODO: Should be updated after each deploy
export const abi = {
  Asset: AssetAbi.abi,
  Pool: PoolAbi.abi,
  Controller: ControllerAbi.abi,
  ERC20: ERC20Abi.abi,
  LossProvisionPool: LossProvisionPoolAbi.abi,
  AMPT: AmptAbi.abi,
  VotingEscrow: VotingAbi.abi,
  Faucet: [
    "function balanceOf() view returns (uint2567)",
    "function getTokens() returns (bool)",
    "function distributions(address addr) view returns (bool)",
  ],
  VestingEscrow: VestingAbi.abi
};