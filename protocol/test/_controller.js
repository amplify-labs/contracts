const { ethers } = require("hardhat");
const { call, send, deploy, connect } = require("./utils");

const { deployAsset } = require("./_asset");

async function getController(admin) {
    let controller = await deployController();

    let interestRateModel = await deployInterestRate();
    await send(controller, "_setInterestRateModel", [interestRateModel.address]);

    let provisionPool = await deployProvisionPool(controller);
    await send(controller, "_setProvisionPool", [provisionPool.address]);

    let assetsFactory = await deployAsset();
    await send(controller, "_setAssetsFactory", [assetsFactory.address]);

    let amptToken = await deployAMPTToken(admin);
    await send(controller, "_setAmptContract", [amptToken.address]);

    let stableCoin = await createStableCoin(controller);
    await send(controller, "addStableCoin", [stableCoin.address]);
    return [controller, stableCoin, amptToken, assetsFactory];
}

async function deployController() {
    let SetLib = await deploySetLibrary();
    let factory = await deploy("ControllerHarness", [], { StableCoin: SetLib })
    return factory;
}

async function deploySetLibrary() {
    let set = await deploy("contracts/Controller/StableCoin.sol:StableCoin");
    return set.address;
}

async function deployInterestRate(useHarness = false) {
    let contractName;
    if (useHarness) {
        contractName = "InterestRateModelHarness";
    } else {
        contractName = "WhitePaperInterestRateModel";
    }
    const interestRateModel = await deploy(contractName, [365]);
    return interestRateModel;
}

async function deployProvisionPool(controller, useHarness = false) {
    let contractName;
    if (useHarness) {
        contractName = "LossProvisionPoolHarness";
    } else {
        contractName = "LossProvisionPool";
    }
    const pool = await deploy(contractName, [controller.address]);
    return pool;
}

async function createStableCoin(controller, name = "MATIC", symbol = "MATIC") {
    const token = await deploy("ERC20Fake", [name, symbol]);
    return token;
}

async function deployAMPTToken(admin) {
    const token = await deploy("AMPT", [admin.address]);
    return token;
}

async function whitelistBorrower(amptToken, controller, signer1) {
    const depositAmount = ethers.utils.parseEther("10");

    // transfer tokens to the signer
    await send(amptToken, "transfer", [signer1.address, depositAmount]);

    let connectedAmptToken = await connect(amptToken, signer1);
    await send(connectedAmptToken, "approve", [controller.address, depositAmount]);

    const connectedController = await connect(controller, signer1);
    await send(connectedController, "submitBorrower");

    await send(controller, "whitelistBorrower", [signer1.address, 0, 1]);
}

const ErrorCode = {
    NO_ERROR: 0,
    POOL_NOT_ACTIVE: 1,
    BORROW_CAP_EXCEEDED: 2,
    NOT_ALLOWED_TO_CREATE_CREDIT_LINE: 3,
    BORROWER_NOT_CREATED: 4,
    BORROWER_IS_WHITELISTED: 5,
    BORROWER_NOT_WHITELISTED: 6,
    ALREADY_WHITELISTED: 7,
    INVALID_OWNER: 8,
    MATURITY_DATE_EXPIRED: 9,
    ASSET_REDEEMED: 10,
    AMPT_TOKEN_TRANSFER_FAILED: 11,
    LENDER_NOT_WHITELISTED: 12,
    BORROWER_NOT_MEMBER: 13,
    LENDER_NOT_CREATED: 14
}

module.exports = {
    deployAsset,
    getController,
    deployController,
    deployInterestRate,
    deployProvisionPool,
    deployAMPTToken,
    createStableCoin,
    ErrorCode,
    whitelistBorrower
}