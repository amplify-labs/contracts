const { ethers } = require("hardhat");
const { call, send, deploy } = require("./utils");

async function deployAsset(useHarness = false) {
    let riskModel = await deployRiskModel();

    let contractName;
    if (useHarness) {
        contractName = "AssetHarness";
    } else {
        contractName = "Asset";
    }

    const asset = await deploy(contractName, [], { Risk: riskModel });

    await send(asset, "addRiskItem", ["A", 10, 90]);
    await send(asset, "addRiskItem", ["B", 20, 80]);
    await send(asset, "addRiskItem", ["F", 0, 0]);

    return asset;
}

async function deployNFT(factory, tokenHash, tokenRating, tokenValue, maturity) {
    let { events } = await send(factory, "tokenizeAsset", [tokenHash, tokenRating, tokenValue, maturity, tokenHash + ".png"]);
    return events[0].args.tokenId;
}

async function deployRiskModel() {
    let risk = await deploy("contracts/Asset/RiskModel.sol:Risk");
    return risk.address;
}

module.exports = {
    deployAsset,
    deployNFT
}