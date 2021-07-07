// scripts/deploy.js
async function main() {
  // We get the contract to deploy
  const Asset = await ethers.getContractFactory("Asset");
  console.log("Deploying Asset...");
  const asset = await Asset.deploy();
  await asset.deployed();
  console.log("Asset deployed to:", asset.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
 