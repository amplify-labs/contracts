import { Network } from "./types";

import * as ControllerAbi from "./abis/Controller";
import * as ERC20Abi from "./abis/ERC20";
import * as PoolAbi from "./abis/Pool";
import * as AssetAbi from "./abis/Asset";
import * as LossProvisionPoolAbi from "./abis/LossProvisionPool";

export const address = {
  "mainnet": {
    "Asset": "",
    "Factory": "",
    "DAI": "",
    "USDC": "",
    "USDT": "",
    "AMPT": "",
    "VotingEscrow": "",
    "Faucet": "",
    "VestingFactory": "",
    "VestingEscrow": ""
  },
  "polygon_mainet": {
    "Asset": "",
    "Factory": "",
    "DAI": "",
    "USDC": "",
    "USDT": "",
    "AMPT": "",
    "VotingEscrow": "",
    "SmartWalletChecker": "",
    "Faucet": "",
    "VestingFactory": "",
    "VestingEscrow": ""
  },
  "polygon_mumbai": {
    "Controller": "0xd2cD49a38Dda3F817ec07375Ad2b3277cC622Dfa",
    "Asset": "0xf8DF27003d4D6FaFa5f3dF432dB124ceA6Cf0607",
    "DAI": "0x86321ca156c655d151474a054f25970acb5b42a8",
    "USDC": "0xeb80b946d57902d92c5b90bd8f4968ce3c8c4f9e",
    "USDT": "0x6861fa406ff83036fb127c7f462a1906f776c3c1",
    "AMPT": "0xBd6bfE86C3d4E10E0f2f12E480f7fd293640E7f2",
    "SmartWalletChecker": "0x7fDd86264C1A9212cB74Fea48BE93c105A7813f5",
    "VotingEscrow": "0xd8d193853AF5b70B8Eff61bE038CfDe90C83204B",
    "Faucet": "0xe7F2C52f1Dd2732EadAdD0a9523081fd3d216D07",
    "VestingFactory": "0x100dE7c586f9B0932487426F208bd8B8E8eD8994",
    "VestingLibrary": "0x0D654d6C51DA05F1AF530223D58bb301f1894B96",
    "VestingEscrow": "0xdA6d0aa8d945F048d61Ef423071D62Bb0C6E68b2"
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
  AMPT: [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) returns (uint256)"
  ],
  VotingEscrow: [
    "function symbol() view returns (string)",
    "function createLock(uint256 value, uint256 unlockTime)",
    "function increaseLockAmount(uint256 value)",
    "function increaseLockTime(uint256 newUnlockTime)",
    "function withdraw()",
    "function balanceOf(address addr) view returns(uint256)", // user votePower
    "function votePower() view returns (uint256)", // total votePower
    "function locked(address addr) view returns(LockedBalance)", // user balance struct
    "function totalSupply() view returns (uint256)", // total locked amount
  ],
  Faucet: [
    "function balanceOf() view returns (uint2567)",
    "function getTokens() returns (bool)",
    "function distributions(address addr) view returns (bool)",
  ],
  VestingEscrow: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "oldAdmin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "AdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Claimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "entryId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "start",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "end",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cliff",
          "type": "uint256"
        }
      ],
      "name": "EntryCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "entryId",
          "type": "uint256"
        }
      ],
      "name": "EntryFired",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_entryId",
          "type": "uint256"
        }
      ],
      "name": "_balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_entryId",
          "type": "uint256"
        }
      ],
      "name": "_lockedOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "start",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "end",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cliff",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "unlocked",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isFireable",
              "type": "bool"
            }
          ],
          "internalType": "struct Vesting.EntryVars[]",
          "name": "_entries",
          "type": "tuple[]"
        }
      ],
      "name": "createEntries",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "start",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "end",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cliff",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "unlocked",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isFireable",
              "type": "bool"
            }
          ],
          "internalType": "struct Vesting.EntryVars",
          "name": "entry",
          "type": "tuple"
        }
      ],
      "name": "createEntry",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "entries",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "start",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "end",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "cliff",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "lastUpdated",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "claimed",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isFireable",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isFired",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "entryIdsByRecipient",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "entryId",
          "type": "uint256"
        }
      ],
      "name": "fireEntry",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBlockTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getSnapshot",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "start",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "end",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cliff",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "claimed",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "available",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isFired",
              "type": "bool"
            }
          ],
          "internalType": "struct Vesting.Snapshot[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner_",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "token_",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "lockedOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "token",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "destination",
          "type": "address"
        }
      ],
      "name": "withdraw",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};