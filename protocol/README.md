# Amplify Contracts

## Introduction

### Related technology

-   **[Openzeppelin](https://docs.openzeppelin.com/contracts/4.x/)**: OpenZeppelin provides a complete suite of security products to build, manage, and inspect all aspects of software development and operations for Ethereum projects.
-   **[Hardhat](https://hardhat.org/getting-started/)**: Hardhat is a development environment to compile, deploy, test, and debug your Ethereum software.
-   **[Matic Network](https://docs.matic.network/docs/develop/getting-started)**: Matic Network is a scaling solution for public blockchains. Based on an adapted implementation of Plasma framework (Plasma MoreVP) - with an account based implementation, Matic supports all the existing Ethereum tooling along with faster and cheaper transactions.

## Contracts Development

### Development Prerequisites

-   [Node.js v10+ LTS and npm](https://nodejs.org/en/) (comes with Node)
-   solidity 0.8.0
-   Create `.secret` file into the root folder and store your private key of [Polygon Testnet(aka. Mumbai)](https://mumbai.polygonscan.com/) in it, this is a mandatory step for network `polygon_mumbai`

### Getting started

Install dependancies by npm:

```bash
cd contracts
npm install
```

### Compiling Your Contracts

Compile after contract development is completed with `hardhat compile` command:

```
npx hardhat compile
```

### Deploy Your Contracts

#### Local Network

1. Run `npx hardhat node` to setup a local blockchian node `http://127.0.0.1:8545`, several account addresses and their corresponding private keys will be listed on screen. Use them to deploy contracts or transfer tokens. Keep the terminal running in background.
1. Open a new terminal tab
1. Run `npx hardhat run --network localhost scripts/deploy.js` to deploy the contract. Deployed contract address will be returned if succeed, it's an address started with `0x`

#### Polygon Testnet (Mumbai)

-   `.secret` has to be existed with correct `Polygon Testnet` account private key in it
-   Get some matic tokens that will be used as gas by [Matic Faucet](https://faucet.matic.network/)
-   Run `npx hardhat run scripts/deploy.js --network polygon_mumbai` to deploy the ERC721 contract. After successful deployment, an address started with `0x` will be showed. [Mumbai Explorer](https://mumbai.polygonscan.com) can be used to query detail information about deployed contract by the returned contract address.

### Verify Your Contracts

Use `hardhat verify` command with correct `network` and the deployed contract address to verify the deployed contract

```
npx hardhat verify --network [$network] [$contractAddress]
```

**A deployed contract should always be verified!**

**Note:** Contract name and ticker are both hardcoded. To change them, update the constructor methond from `Asset.sol` file.

### Testing Your Contracts

#### Using console

-   Run `npx hardhat console --network [networkName]` to Enter the console interface, the networkName such as localhost, polygon_mumbai or other networks if defined in `hardhat.config.js`

#### Token minting

```javascript
const Asset = await ethers.getContractFactory("Asset");
// Repace the following contract address with the one deployed by you on corresponding network
const asset = await Asset.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Set owner address
const address = "[$ownerAddress]";

// - `tokenId` is an custom unique ID
// - `value` is value in USD
// - `tokenURI` is file name
const token = await asset.tokenizeAsset(
    address,
    "[$tokenId]",
    [$value],
    [$maturity],
    "[$tokenURI]"
);
```

## Using Contracts By SDK (Browser)

-   Refer to [SDK Readme](../sdk/README.md) and [SDK Documents](../sdk/scripts/out.md) for more details
-   Install with local path: `npm install PATH-TO-REPO-ROOT/sdk/dist/browser/`
-   Import and use

```js
import Amplify from "@amplify-labs/amplify-js";
const amplify = Amplify.createInstance(window.ethereum);

const trx = await amplify.tokenizeAsset(
    "0x916cCC0963dEB7BEA170AF7822242A884d52d4c7",
    "token-004",
    20000,
    1,
    "asset-uri://token-001"
);
console.log("Ethers.js transaction object", trx);

const total = await amplify.totalSupply();
console.log(total);
```
