import { Network } from "./types";

export const address = {
  "mainnet": {
    "Asset": "",
    "Factory": "",
    "DAI": "",
    "USDC": "",
    "USDT": "",
    "AMPT": "",
    "VotingEscrow": ""
  },
  "polygon_mainet": {
    "Asset": "",
    "Factory": "",
    "DAI": "",
    "USDC": "",
    "USDT": "",
    "AMPT": "",
    "VotingEscrow": "",
    "SmartWalletChecker": ""
  },
  "polygon_mumbai": {
    "Asset": "0x4fb9c488cF82BaEBC828BDd1621D1BCB24410CC8",
    "Factory": "0xF1258EBe0C742bf52Db273494c0f750a6B5fd7dD",
    "DAI": "0x86321ca156c655d151474a054f25970acb5b42a8",
    "USDC": "0xeb80b946d57902d92c5b90bd8f4968ce3c8c4f9e",
    "USDT": "0x6861fa406ff83036fb127c7f462a1906f776c3c1",
    "AMPT": "0xBd6bfE86C3d4E10E0f2f12E480f7fd293640E7f2",
    "SmartWalletChecker": "0x7fDd86264C1A9212cB74Fea48BE93c105A7813f5",
    "VotingEscrow": "0xd8d193853AF5b70B8Eff61bE038CfDe90C83204B"
  },
  "velas_testnet": {
    "Asset": "0xb8A7E3Ac3010eF846e9cAC18895AA82D35b50865",
    "Factory": "0x8E557363AC9E5cbf09A2616A302CA3c8f6ab2b7A",
    "DAI": "0xBdf5575Ec1cC0a14Bd3e94648a2453fdC7B56943",
    "USDC": "0x78539503451048575ee5d003f1CAaE66d1cd9552",
    "USDT": "0x281Af75C2919A1F579b507F4Ab8ce77fcAcD4197",
    "AMPT": "0x428d561f82bbb9322e5a634490722F26714d4DcA",
    "SmartWalletChecker": "0x7593E8fC59cB7fB3839A2B4815576C68b3df23FF",
    "VotingEscrow": "0x7A05280940A23749106D8Fb2cA4b10B9D1C89067"
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
      "https://evmexplorer.testnet.velas.com/rpc",
      "https://testnet.velas.com/rpc"
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

export const abi = {
  Asset: [
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function totalSupply() view returns (uint256)",
    "function tokenizeAsset(string tokenId, string tokenRating, uint256 value, uint256 maturity, string tokenURI)",
    "function addRiskItem(string rating, uint256 interestRate, uint256 advanceRate)",
    "function removeRiskItem(string rating)",
    "function getRiskInterestRate(string rating) view returns (uint256)",
    "function getRiskAdvanceRate(string rating) view returns(uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)"
  ],
  Factory: [
    "function addStableCoin(address stableCoin)",
    "function removeStableCoin(address stableCoin)",
    "function getStableCoins() returns (address[])",
    "function createPool(string name, string structure, address stableCoin, uint256 minDeposit)",
  ],
  Pool: [
    "function balances(address lender) view returns (uint256)",
    "function lend(uint256 amount) returns (bool success)",
    "function withdraw(uint256 _tokenAmount) returns (bool success)",
    "function createLoan(address nftAsset, uint256 tokenId) returns (bool success)",
    "function closeLoan(uint256 loanId) returns (bool success)",
    "function borrow(uint256 loanId, uint256 amount) returns (bool success)",
    "function repay(uint256 loanId, uint256 amount) returns (bool success)",
    "function unlockAsset(uint256 loanId) returns (bool success)",
    "function lpToken() view returns (address)",
    "function totalDeposited() view returns (uint256)",
    "function totalBorrowed() view returns (uint256)",
    "function totalAvailable() view returns (uint256)"
  ],
  ERC20: [
    "function allowance(address spender, address spender) returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ],
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
  ]
};

export const errorCodes = {
  'asset': {
    'codes': {
      '0': { 'error': 'NO_ERROR', 'description': 'Not a failure.', 'hint': '', },
      '1': { 'error': 'UNAUTHORIZED', 'description': 'The sender is not authorized to perform this action.', 'hint': '', },
    },
    'info': {
      '0': { 'error': 'ACCEPT_ADMIN_PENDING_ADMIN_CHECK', 'description': '', 'hint': '', },
      '1': { 'error': 'ACCEPT_PENDING_IMPLEMENTATION_ADDRESS_CHECK', 'description': '', 'hint': '', },
    }
  }
};