const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    // We get the contract to deploy
    let risk = await deployRiskLib();
    const Asset = await ethers.getContractFactory("Asset", {
        libraries: { Risk: risk }
    });
    console.log("Deploying Asset...");
    const asset = await Asset.deploy();
    await asset.deployed();
    console.log("Asset deployed to:", asset.address);
}

async function deployRiskLib() {
    const Risk = await ethers.getContractFactory("contracts/Asset/RiskModel.sol:Risk");
    console.log("Deploying Risk...");
    const risk = await Risk.deploy();
    await risk.deployed();

    return risk.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });