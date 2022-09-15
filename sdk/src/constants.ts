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
    "LossProvisionPool": "0x27A9735746eb7a2B048Aad41E5eB2c39986000D2",
    "Controller": "0x46e90D9331958678A3872004dD35785A38c68952",
    "Asset": "0x35D244DFbA76eb56b4Cd42245Df0C90d6cfa262a",
    "SmartWalletChecker": "0x32c22506610C6F4338c76dB02fbF04177f0A023d",
    "VotingEscrow": "0xC61e54A9Fe0A973cf62FF5917B95E866920e5726",
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
    "LossProvisionPool": "0x7E84465305ED8234661cdaD5e0e947635ba6E396",
    "Controller": "0xA9B27ed20A1C4e8683B7BacA3007Dd4D4074D40d",
    "Asset": "0xbA67AEc3de810D7b81D1E5FE88bD46102066b011",
    "SmartWalletChecker": "0xB04C32733259B5dd1efd31F416986176a2fa59CF",
    "VotingEscrow": "0xF8c212517848171eb043d12CE6197Ea9FD8ABe78",
    "DAI": "0xA9d5017985B90A4C4c5a22bd24Cd643f703167f6",
    "USDC": "0x35D244DFbA76eb56b4Cd42245Df0C90d6cfa262a",
    "USDT": "0xc139A04E3f69b1A6BEfbe1261A17B9bf2fb0e23C",
    "AMPT": "0x5224EDEE5eeB2A22a319BB9D0D9610fD925FD44f",
    "Faucet": "0xAA2138959B314298A065dF2ed5F9cC83b6F4d9d9",
    "VestingFactory": "0x7A175967D387b34BE4B45398ccD6a38303b09898",
    "VestingLibrary": "0x4910A54D9fd00069B50959FC9839f23460341e27",
    "VestingEscrow": "0xa02BAeb03D7bb788daC3EE512De65f20607BF547"
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
    decimals: 6,
    logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=002",
  },
  USDT: {
    symbol: "USDT",
    decimals: 6,
    logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
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
    "name": "Ethereum Testnet Görli",
    "chainId": 5,
    "shortName": "gor",
    "chain": "Ethereum",
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