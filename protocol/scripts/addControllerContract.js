const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

    const controller = "";
    const interestRate = "";
    const assetsFactory = "";
    const amptToken = "";

    await addContracts(controller, interestRate, assetsFactory, amptToken);
}

async function addContracts(controller, interestRate, assetsFactory, amptToken) {
    if (controller === "" || interestRate === "" || assetsFactory === "" || amptToken === "") {
        return;
    }

    const Controller = await ethers.getContractAt("Controller", controller);

    await Controller._setInterestRateModel(interestRate);
    await Controller._setAssetsFactory(assetsFactory);
    await Controller._setAmptContract(amptToken);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });