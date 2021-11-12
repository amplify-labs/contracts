// scripts/deploy.js
async function main() {
  // await deployAsset();
  // await deployFakeToken();
  // await deployFactory();
  const amptToken = await deployAMPTToken();
  //const sw = await deploySmartChecker();
 // await deployVotingEscrow(amptToken, sw, 'Vote-escrowed AMPT', 'veAMPT');
}

async function deployAsset() {
  // We get the contract to deploy
  const Asset = await ethers.getContractFactory("Asset");
  console.log("Deploying Asset...");
  const asset = await Asset.deploy();
  await asset.deployed();
  console.log("Asset deployed to:", asset.address);
}

async function deployFactory() {
  // We get the contract to deploy
  const Factory = await ethers.getContractFactory("Factory");
  console.log("Deploying Factory...");
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);
}

async function deployFakeToken() {
  // We get the contract to deploy
  const FakeToken = await ethers.getContractFactory("FakeToken");
  console.log("Deploying FakeToken...");
  const fakeToken = await FakeToken.deploy();
  await fakeToken.deployed();
  console.log("FakeToken deployed to:", fakeToken.address);
}

async function deployAMPTToken() {
  // We get the contract to deploy
  const [owner] = await ethers.getSigners();
  const AMPT = await ethers.getContractFactory("AMPT");
  console.log("Deploying AMPT...");
  const contract = await AMPT.deploy(owner.address);
  await contract.deployed();
  console.log("AMPT deployed to:", contract.address);
  return contract.address;
}

async function deploySmartChecker() {
  const SW = await ethers.getContractFactory("SmartWalletWhitelist");
  console.log("Deploying SmartWalletWhitelist...");
  const contract = await SW.deploy();
  await contract.deployed();
  console.log("SmartWalletWhitelist deployed to:", contract.address);
  return contract.address;
}


async function deployVotingEscrow(amptToken, sw, name, symbol) {
  // We get the contract to deploy
  const VotingEscrow = await ethers.getContractFactory("VotingEscrow");
  console.log("Deploying VotingEscrow...");
  const contract = await VotingEscrow.deploy(amptToken, sw, name, symbol);
  await contract.deployed();
  console.log("VotingEscrow deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
