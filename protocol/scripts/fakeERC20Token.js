const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    // We get the contract to deploy
    const FakeToken = await ethers.getContractFactory("FakeToken");
    console.log("Deploying FakeToken...");
    const fakeToken = await FakeToken.deploy();
    await fakeToken.deployed();
    console.log("FakeToken deployed to:", fakeToken.address);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });