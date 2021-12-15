const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {

    const controller = "";
    const interestRate = "";
    const assetsFactory = "";
    const amptToken = "";

    const daiContract = "";
    const usdcContract = "";
    const usdtContract = "";

    await addContracts(controller, interestRate, assetsFactory, amptToken, daiContract, usdcContract, usdtContract);
}

async function addContracts(controller, interestRate, assetsFactory, amptToken, daiContract, usdcContract, usdtContract) {
    if (controller === "" || interestRate === "" || assetsFactory === "" || amptToken === "" || daiContract === "" || usdcContract === "" || usdtContract === "") {
        return;
    }

    const Controller = await ethers.getContractAt("Controller", controller);

    await Controller._setInterestRateModel(interestRate);
    await Controller._setAssetsFactory(assetsFactory);
    await Controller._setAmptContract(amptToken);

    await Controller.addStableCoin(daiContract);
    await Controller.addStableCoin(usdcContract);
    await Controller.addStableCoin(usdtContract);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });