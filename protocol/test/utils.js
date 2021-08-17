const { ethers } = require("hardhat");

async function deployFactory() {
    const Contract = await ethers.getContractFactory("Factory");
    const factory = await Contract.deploy();
    await factory.deployed();
    return factory;
}

async function deployCollectible() {
    const Contract = await ethers.getContractFactory("Asset");
    const asset = await Contract.deploy();
    await asset.deployed();
    return asset.address;
}

async function deployFakeToken(name, symbol) {
    const Contract = await ethers.getContractFactory("FakeToken");
    const factory = await Contract.deploy(name, symbol);
    await factory.deployed();

    return factory.address;
}

async function createStableCoin(factory) {
    let stableCoin = await deployFakeToken("MATIC", "MATIC");

    let addTx = await factory.addStableCoin(stableCoin);
    // wait until the transaction is mined
    await addTx.wait();
    return stableCoin;
}

async function createNFT(assetFactoryAddr, value, tokenHash, maturity, tokenURI) {
    let assetFactory = await ethers.getContractAt("Asset", assetFactoryAddr);

    let riskTx = await assetFactory.addRiskItem("A", 5, 90);
    // wait until the transaction is mined
    await riskTx.wait();

    let tx = await assetFactory.tokenizeAsset(tokenHash, "A", value, maturity, tokenURI);

    // wait until the transaction is mined
    let waitTx = await tx.wait();
    return waitTx.events[0].args.tokenId;
}


async function createPool(factory, stableCoin, minDeposit) {
    let poolTx = await factory.createPool(
        'MATIC-1',
        'discounting',
        stableCoin,
        minDeposit);

    // wait until the transaction is mined
    let txWait = await poolTx.wait();

    return txWait.events[3].args.pool;
}

async function depositInPool(pool, addr1, amount) {
    let depositTx = await pool.connect(addr1).lend(amount);

    // wait until the transaction is mined
    await depositTx.wait();
}


function parseBN(bn) {
    return parseInt(bn, 10);
}

module.exports = {
    deployFactory,
    createStableCoin,
    createPool,
    createNFT,
    deployCollectible,
    depositInPool,
    deployFakeToken,
    parseBN
}