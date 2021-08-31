// scripts/deploy.js
async function main() {
  await deployAsset();
  // await deployFakeToken();
  await deployFactory();
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

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
