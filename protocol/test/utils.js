const { ethers } = require("hardhat");

async function init(contractName, contractAddress) {
    return await ethers.getContractAt(contractName, contractAddress);
}

async function call(contract, method, args = [], callOptions = {}) {
    [args, options] = allowUndefinedArgs(args, callOptions);

    return contract.functions[method](...args, options).then(r => {
        if (r.length > 1) {
            return r;
        }
        return r[0];
    }).catch(err => vmError("failed to call function"));
}

async function send(contract, method, args = [], sendOptions = {}) {
    [args, options] = allowUndefinedArgs(args, sendOptions);

    return contract.functions[method](...args, options)
        .then((r) => r.wait())
        .then(r => {
            return r;
        }).catch(err => {
            return err.message;
        });
}

async function deploy(contractName, args = [], libs = {}, sendOptions = {}) {
    const Contract = await ethers.getContractFactory(contractName, { libraries: libs });
    const contract = await Contract.deploy(...args, sendOptions);
    await contract.deployed();
    return contract;
}

async function connect(contract, signer) {
    let newContract = await contract.connect(signer);
    return newContract;
}

function allowUndefinedArgs(args, sendOptions) {
    if (!Array.isArray(args)) {
        if (sendOptions !== undefined) {
            throw new Error(`Args expected to be an array, got ${args}`);
        }
        return [[], args];
    } else {
        return [args, sendOptions]
    }
}

function vmError(err) {
    return `VM Exception while processing transaction: reverted with reason string '${err}'`;
}

function vmError2(err) {
    return `VM Exception while processing transaction: revert with reason "${err}"`;
}

function uuidv4() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const zeroAddress = "0x0000000000000000000000000000000000000000";
const fakeAddress = "0x0000000000000000000000000000000000000000";

const double = ethers.utils.parseUnits("1", 36);
const exp = ethers.utils.parseUnits("1", 18);

const wrongOwner = vmError("Only owner can call this function");
const zeroAddressError = vmError("Address must be non-zero");

module.exports = {
    init,
    call,
    send,
    deploy,
    connect,
    vmError,
    vmError2,
    wrongOwner,
    zeroAddressError,
    uuidv4,
    exp,
    double,
    fakeAddress,
    zeroAddress
}