// Publicly revealed on the parent class
export const constants = {
  'Asset': 'Asset',
};

export const address = {
  "mainnet": {
    "Asset": "",
  },
  "polygon_mainet": {
    "Asset": "",
  },
  "polygon_mumbai": {
    "Asset": "0xF341667f7EcEE52B261A1dB70897F636aAb5A9cb",
  },
};

export const networks = [
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

export const abi = {
  Asset: [
    "function totalSupply() view returns (uint256)",
    "function tokenizeAsset(address to, string tokenId, uint256 value, uint256 maturity, string tokenURI)",
    "function balanceOf(address) view returns (uint256)",
  ],
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