// hardhat.config.js
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");

const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {
    },
    polygon_mumbai: {
      chainId: 80001,
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey],
      gas: 2100000,
      gasPrice: 8000000000
    },
    polygon_mainet: {
      chainId: 137,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey],
      gas: 2100000,
      gasPrice: 8000000000
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    // apiKey: "5H7T16BMTBV5FHYJ4KYT5QSEKMJ67BQUNM"
    // Your API key for Polygon
    // Obtain one at https://polygonscan.com/myaccount
    apiKey: "T5EE3A81HMYUJYZE7TH2RQBKPQY2FRBGD3"
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};
