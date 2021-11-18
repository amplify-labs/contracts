// scripts/deploy.js
async function main() {
  const vestingLibraryAddress = await deployVestingLibrary();
  await deployVestingFactory(vestingLibraryAddress);
}

async function deployVestingLibrary() {
  const Contract = await ethers.getContractFactory("Vesting");
  console.log("Deploying Vesting...");
  const contract = await Contract.deploy();
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  return contract.address;
}

async function deployVestingFactory(vestingLibraryAddress) {
  const Contract = await ethers.getContractFactory("VestingFactory");
  console.log("Deploying VestingFactory...");
  const contract = await Contract.deploy(vestingLibraryAddress);
  await contract.deployed();
  console.log("VestingFactory deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
