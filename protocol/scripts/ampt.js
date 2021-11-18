const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    // We get the contract to deploy
    const [owner] = await ethers.getSigners();
    const AMPT = await ethers.getContractFactory("AMPT");
    console.log("Deploying AMPT...");
    const contract = await AMPT.deploy(owner.address);
    await contract.deployed();
    console.log("AMPT deployed to:", contract.address);
    return contract.address;
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
