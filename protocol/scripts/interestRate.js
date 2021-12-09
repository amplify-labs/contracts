// scripts/deploy.js
async function main() {
    await deployInterestRateModel();
}

async function deployInterestRateModel() {
    const Contract = await ethers.getContractFactory("WhitePaperInterestRateModel");
    console.log("Deploying WhitePaperInterestRateModel...");
    const contract = await Contract.deploy(146000);
    await contract.deployed();
    console.log("WhitePaperInterestRateModel deployed to:", contract.address);
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });