const { expect } = require("chai");
const { ethers } = require("hardhat");
const { call, send, connect, vmError, zeroAddress, deployAMPTToken, deployVestingLib } = require("./utils");

const day = 24 * 60 * 60;
const timestamp = Math.floor(Date.now() / 1000);
const start = timestamp + 1 * day;
const end = timestamp + 4 * 365 * day;
const cliff = 365 * day;


describe('Vesting Factory', function () {
    let root, signer1, signer2;

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        root = signers[0];
        signer1 = signers[1];
    })

    describe('constructor', () => {
        it("succeeds when setting owner to contructor argument", async () => {
            let [factory, _, vestingContract] = await getFactoryContract(root.address);
            expect(await call(factory, 'owner'), [vestingContract.address]).to.equal(root.address);
        });

        it("succeeds when setting libraryAddress to contructor argument", async () => {
            let [factory, _, vestingContract] = await getFactoryContract(root.address);
            expect(await call(factory, 'libraryAddress'), [vestingContract.address]).to.equal(vestingContract.address);
        });
    })

    describe('createVestingContract', function () {
        let factory, amptToken, vestingContract;

        beforeEach(async () => {
            [factory, amptToken, vestingContract] = await getFactoryContract(signer1.address);

            await send(factory, 'setBlockTimestamp', [timestamp]);
        });

        it('should create vesting instance', async () => {
            let connectedFactory = await connect(factory, signer1);

            let { events } = await send(connectedFactory, 'createVestingContract', [amptToken.address]);
            let vesting = await call(factory, 'instances', [0]);

            expect(vesting[0]).to.equal(events[0].args.instance);
            expect(vesting[1]).to.equal(signer1.address);
            expect(vesting[2]).to.equal(amptToken.address);
        });
    });
})

async function getFactoryContract(admin) {
    let vestingContract = await deployVestingLib();
    let factory = await deployFactoryContract(vestingContract.address);
    let amptToken = await deployAMPTToken(admin);

    return [factory, amptToken, vestingContract];
}

async function deployFactoryContract(vestingContractAddress) {
    let Contract = await ethers.getContractFactory("VestingFactoryHarness")

    const factory = await Contract.deploy(vestingContractAddress);
    await factory.deployed();
    return factory;
}


module.exports = {
    getFactoryContract,
}