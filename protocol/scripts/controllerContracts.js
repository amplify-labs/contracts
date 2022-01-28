// scripts/deploy.js
async function main() {
    await deployInterestRateModel();
    await deployLossProvision("0xCfb9DEacD9642c32e12816Af6A13F362B4a707B1");
}

async function deployInterestRateModel() {
    const Contract = await ethers.getContractFactory("WhitePaperInterestRateModel");
    console.log("Deploying WhitePaperInterestRateModel...");
    const contract = await Contract.deploy();
    await contract.deployed();
    console.log("WhitePaperInterestRateModel deployed to:", contract.address);
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
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
