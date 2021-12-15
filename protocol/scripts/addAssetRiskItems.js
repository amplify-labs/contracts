const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

    const assetsFactory = "";

    await addRiskItems(assetsFactory);
}

async function addRiskItems(assetsFactory) {
    if (assetsFactory === "") {
        return;
    }

    const AssetFactory = await ethers.getContractAt("Asset", assetsFactory);

    await AssetFactory.addRiskItem("A", 5, 90);
    await AssetFactory.addRiskItem("B", 6, 80);
    await AssetFactory.addRiskItem("C", 7, 80);
    await AssetFactory.addRiskItem("D", 8, 70);
    await AssetFactory.addRiskItem("F", 0, 0);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });