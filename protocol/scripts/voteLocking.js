const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    const sw = await deploySmartChecker();
    await deployVotingEscrow(sw, 'Vote-escrowed AMPT', 'veAMPT');
}

async function deploySmartChecker() {
    const SW = await ethers.getContractFactory("SmartWalletWhitelist");
    console.log("Deploying SmartWalletWhitelist...");
    const contract = await SW.deploy();
    await contract.deployed();
    console.log("SmartWalletWhitelist deployed to:", contract.address);
    return contract.address;
}


async function deployVotingEscrow(sw, name, symbol) {
    // We get the contract to deploy

    if (!AMPT) return;

    const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
    console.log("Deploying VotingEscrow...");
    const contract = await VotingEscrow.deploy(AMPT, sw, name, symbol);
    await contract.deployed();
    console.log("VotingEscrow deployed to:", contract.address);
}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });