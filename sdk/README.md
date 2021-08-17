# Contracts SDK

## Development and Build

```bash
npm install
npm run build
```

## Amplify Contracts

Simple methods for using Amplify Contracts.

```js
const amplify = new Amplify(window.ethereum); // in a web browser

// Ethers.js overrides are an optional 3rd parameter for `supply`
// const trxOptions = { gasLimit: 250000 };
(async function () {
    const trx = await amplify.asset.tokenizeAsset(
        "0x916cCC0963dEB7BEA170AF7822242A884d52d4c7",
        "token-001",
        20000,
        1,
        "asset-uri://token-001"
    );
    console.log("Ethers.js transaction object", trx);
})().catch(console.error);
```

## Installation

````bash
npm install @amplify-labs/amplify-js --registry=https://npm.pkg.github.com

### Import

#### Browser

```html
<script type="text/javascript" src="./amplify.min.js"></script>

<script type="text/javascript">
  window.Amplify; // or `Amplify`
</script>
````

#### Server-side(Node.js)

```js
import Amplify from "@amplify-labs/amplify-js";
```

## Instance Creation

The following are valid Ethereum-like providers for the initialization of the SDK.

```js
var amplify = new Amplify(window.ethereum); // web browser

var amplify = new Amplify('http://127.0.0.1:8545'); // HTTP provider

var amplify = new Amplify(); // Uses Ethers.js fallback mainnet (for testing only)

var amplify = new Amplify('polygon_mumbai'); // Uses Ethers.js fallback (for testing only)

// Init with private key (server side)
var amplify = new Amplify('https://rpc-mumbai.maticvigil.com', {
  privateKey: '0x_your_private_key_', // preferably with environment variable
});

// Init with HD mnemonic (server side)
var amplify = new Amplify('mainnet' {
  mnemonic: 'clutch captain shoe...', // preferably with environment variable
});
```

## Constants and Contract Addresses

Names of contracts, their addresses, ABIs, token decimals, and more can be found in `/src/constants.ts`.
Addresses, for all networks, can be easily fetched using the `getAddress` function, combined with contract name constants.

```js
console.log(Amplify.Asset);
// Asset...

const contractAssetAddress = Amplify.util.getAddress(
    Amplify.Asset,
    "polygon_mumbai"
);
// Asset Contract address on Polygon Mumbai. Second parameter can be a network like 'polygon_mumbai'.
```

## Transaction Options

Each method that interacts with the blockchain accepts a final optional parameter for overrides, much like [Ethers.js overrides](https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides).

```js
// The options object itself and all options are optional
const trxOptions = {
    abi, // Definition string or an ABI array from a solc build
    provider, // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
    network, // Ethers.js fallback network provider, "provider" has precedence over "network"
    from, // Address that the Ethereum transaction is send from
    gasPrice, // Ethers.js override `Amplify._ethers.utils.parseUnits('10.0', 'gwei')`
    gasLimit, // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
    value, // Number or string
    data, // Number or string
    chainId, // Number
    nonce, // Number
    privateKey, // String, meant to be used with `Amplify.eth.trx` (server side)
    mnemonic, // String, meant to be used with `Amplify.eth.trx` (server side)
};
```

## Manual Testing

### In-browser

-   Create a HTML file with following codes and serve it with any web server

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="renderer" content="webkit" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <script type="text/javascript" src="./amplify.min.js"></script>
        <title>Amplify Contracts SDK Testing</title>
        <script type="text/javascript">
            window.ethereum.enable();
        </script>
    </head>
    <body>
        <div id="app">Hello World, Open console.</div>
    </body>
</html>
```

-   Visit the above test page by chrome/edge, toggle developer console
-   In console, use following javascripts for checking behaviors, modify the owner address and asset informations to fit your requirements, and then inspect the return result

```javascript
var amplify = new Amplify(window.ethereum);

(async function () {
    const trx = await amplify.asset.tokenizeAsset(
        "0x916cCC0963dEB7BEA170AF7822242A884d52d4c7",
        "token-001",
        20000,
        1,
        "asset-uri://token-001"
    );
    console.log("Ethers.js transaction object", trx);
})().catch(console.error);
```

### Server-side (Node.js)

-   Launch console from root directory: `npx hardhat console --network polygon_mumbai`

```js
var Amplify = require("./ContractsSDK/dist/nodejs/index.js");

var amplify = new Amplify("https://rpc-mumbai.maticvigil.com", {
    privateKey: "0x_your_private_key_", // preferably with environment variable
});

var trx = await amplify.asset.tokenizeAsset(
    "0x916cCC0963dEB7BEA170AF7822242A884d52d4c7",
    "token-002",
    20000,
    1,
    "asset-uri://token-001"
);
console.log("Ethers.js transaction object", trx);
console.log(trx);

var total = await amplify.asset.totalSupply();
console.log(total);
```

## Hints

-   Network name for `Polygon Testnet` is `polygon_mumbai`
-   Network name for `Polygon Mainet` is `polygon_mainet`
