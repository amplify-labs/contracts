const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    let ampToken = AMPT;

    if (!amptToken) return;
    // We get the contract to deploy
    const Faucet = await ethers.getContractFactory("Faucet");
    console.log("Deploying Faucet...");
    const contract = await Faucet.deploy(amptToken);
    await contract.deployed();
    console.log("Faucet deployed to:", contract.address);
    return contract.address;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });