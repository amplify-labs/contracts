# Contracts

## Introduction

### Related technology
  **[Openzeppelin](https://docs.openzeppelin.com/contracts/4.x/)**: OpenZeppelin provides a complete suite of security products to build, manage, and inspect all aspects of software development and operations for Ethereum projects.

  **[Hardhat](https://hardhat.org/getting-started/)**: Hardhat is a development environment to compile, deploy, test, and debug your Ethereum software.

  **[Matic Network](https://docs.matic.network/docs/develop/getting-started)**: Matic Network is a scaling solution for public blockchains. Based on an adapted implementation of Plasma framework (Plasma MoreVP) - with an account based implementation, Matic supports all the existing Ethereum tooling along with faster and cheaper transactions.
## Getting started
### Setting up the development environment

There are a few technical requirements before we start. Please install the following:

- [Node.js v10+ LTS and npm](https://nodejs.org/en/) (comes with Node)

1. Once your project is ready, you should run
```bash
cd contracts
npm install
```
2. Create `.secret` file into the root folder
#### Compiling smart-contracts
Compile after contract development is completed
```
npx hardhat compile
```

## Deploy Contract
### Deploy contract to local network
1. Run `npx hardhat node` to setup a local blockchian node `http://127.0.0.1:8545`
The terminal will return a list of local addressed and their private keys. Use them to deploy contracts or transfer tokens.
1. Open a new terminal tab
1. Copy the first private key from terminal and paste it in `.secret` file
1. Run `npx hardhat run --network localhost scripts/deploy.js` to deploy the contract. `0x5FbDB2315678afecb367f032d93F642f64180aa3` will be the Token address

### Deploy contract to Matic network
* Need one account and private key
* Get some matic tokens that will be used as gas, you can get some matic tokens from [Matic Faucet](https://faucet.matic.network/)
* Create .secret file in the root to store your private key
* Run `npx hardhat run scripts/deploy.js --network matic` to deploy the ERC721 contract. After successful deployment, will get the contract address, such as `0x1760B3b2FC6d65875e54f5D7389718E9410EB743`, then go to [Mumbai Explorer](https://explorer-mumbai.maticvigil.com/) query the contract detail information.

**Note:** Contract name and ticker are both hardcoded. To change them, update the constructor methond from `Asset.sol` file.


## Testing

### Using console
* Run `npx hardhat console --network [networkName]` to Enter the console interface, the networkName such as localhost, matic or others

#### Initiate contract instance
* Run `const Asset = await ethers.getContractFactory("Asset")`
* Run `const asset = await Asset.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")`
#### Mint token
1. Run `const address = "[$ownerAddress]"`. You can also skip this step and pass the address directly in the function call parameter
1. Run `await asset.awardItem(address, "[$]")`

