const { ethers } = require("hardhat");

const { deploy } = require("./utils");
const { deployAMPTToken } = require("./_controller");

async function getFactoryContract(admin) {
    let vestingContract = await deployVestingLib();
    let factory = await deployFactoryContract(vestingContract.address);
    let amptToken = await deployAMPTToken(admin);

    return [factory, amptToken, vestingContract];
}

async function deployFactoryContract(vestingContractAddress) {
    let factory = await deploy("VestingFactoryHarness", [vestingContractAddress]);
    return factory;
}

async function deployVestingLib() {
    let contract = await deploy("VestingHarness");
    return contract;
}


module.exports = {
    getFactoryContract,
    deployFactoryContract
}