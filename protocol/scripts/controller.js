const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    // We get the contract to deploy
    let sc = await deployStableCoin();
    const Controller = await ethers.getContractFactory("Controller", {
        libraries: {
            StableCoin: sc
        }
    });
    console.log("Deploying Controller...");
    const controller = await Controller.deploy();
    await controller.deployed();
    console.log("Controller deployed to:", controller.address);


    await deployLossProvision(controller.address);
}


async function deployStableCoin() {
    const SC = await ethers.getContractFactory("contracts/Controller/StableCoin.sol:StableCoin");
    console.log("Deploying Stablecoin...");
    const sc = await SC.deploy();
    await sc.deployed();

    return sc.address;
}


async function deployLossProvision(controller) {
    const Contract = await ethers.getContractFactory("LossProvisionPool");
    console.log("Deploying LossProvisionPool...");
    const contract = await Contract.deploy(controller);
    await contract.deployed();
    console.log("LossProvisionPool deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });