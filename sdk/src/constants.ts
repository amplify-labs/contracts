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

export const abi = {
  Asset: [
    "function totalSupply() view returns (uint256)",
    "function tokenizeAsset(address to, string tokenId, uint256 value, uint256 maturity, string tokenURI)",
    "function balanceOf(address) view returns (uint256)",
  ],
};

export const decimals = {
  'cBAT': 8,
  'cDAI': 8,
  'cETH': 8,
  'cLINK': 8,
  'cREP': 8,
  'cSAI': 8,
  'cTUSD': 8,
  'cUNI': 8,
  'cUSDC': 8,
  'cUSDT': 8,
  'cWBTC': 8,
  'cZRX': 8,
  'BAT': 18,
  'BTC': 8,
  'DAI': 18,
  'ETH': 18,
  'GRT': 18,
  'KNC': 18,
  'LINK': 18,
  'REP': 18,
  'SAI': 18,
  'SNX': 18,
  'TUSD': 18,
  'UNI': 18,
  'USDC': 6,
  'USDT': 6,
  'WBTC': 8,
  'XTZ': 6,
  'ZRX': 18,
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