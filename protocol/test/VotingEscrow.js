const { expect } = require("chai");
const { ethers } = require("hardhat");
const { call, send, connect, vmError, zeroAddress } = require("./utils");

const day = 24 * 60 * 60;
const timestamp = Math.floor(Date.now() / 1000);
const timestamp7Days = timestamp + 7 * day;
const timestamp8Days = timestamp + 8 * day;
const timestamp4Years = timestamp + 4 * 365 * day;


describe('Voting Escrow', function () {
    let root, signer1, signer2;

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        root = signers[0];
        signer1 = signers[1];
        signer2 = signers[2];
    })

    describe('constructor', () => {
        it("succeeds when setting amptToken instance", async () => {
            let [voting, amptToken] = await getVotingContract(root.address);
            expect(await call(voting, "amptToken")).to.equal(amptToken.address);
        });

        it("succeeds when setting admin to contructor argument", async () => {
            let [voting] = await getVotingContract(root.address);
            expect(await call(voting, 'admin')).to.equal(root.address);
        });

        it("succeeds when setting smartChecker to contructor argument", async () => {
            let [voting, _, sw] = await getVotingContract(root.address);
            expect(await call(voting, 'smartWalletChecker')).to.equal(sw.address);
        });
    })

    describe('name, symbol, decimals', () => {
        let voting;

        beforeEach(async () => {
            [voting] = await getVotingContract(root.address);
        });

        it('should return correct name', async () => {
            expect(await call(voting, 'name')).to.equal("Voting-escrowed AMPT");
        });

        it('should return correct symbol', async () => {
            expect(await call(voting, 'symbol')).to.equal("veAMPT");
        });

        it('should return correct decimals', async () => {
            expect(await call(voting, 'decimals')).to.equal(18);
        });
    })

    describe('changeSmartWalletChecker', () => {
        let voting, swOld, swNew;

        beforeEach(async () => {
            [voting, _, swOld] = await getVotingContract(root.address);
            swNew = await deploySmartWalletChecker();
        });

        it('should fails because of wrong admin', async () => {
            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'changeSmartWalletChecker', [swOld.address])
            ).to.equal(vmError("Only admin can change smart wallet checker"));
        });

        it('should fails because of the same address', async () => {
            expect(
                await send(voting, 'changeSmartWalletChecker', [swOld.address])
            ).to.equal(vmError("New smart wallet checker is the same as the old one"));
        });

        it('should change smart contract instance', async () => {
            expect(await call(voting, 'smartWalletChecker')).to.equal(swOld.address);
            await send(voting, 'changeSmartWalletChecker', [swNew.address]);
            expect(await call(voting, 'smartWalletChecker')).to.equal(swNew.address);
        });
    });

    describe('createLock', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('10')]);
        });

        it('should fails because of zero value', async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'createLock', [0, timestamp8Days])
            ).to.equal(vmError('Value must be greater than 0'));
        });

        it('should fails because of past date', async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp])
            ).to.equal(vmError('Unlock time must be in the future'));
        });

        it('should fails because of exceed max cap of 4 years', async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp4Years + day])
            ).to.equal(vmError('Voting lock can be 4 years max'));
        });

        it('should create lock instance', async () => {
            let connectedVoting = await connect(voting, signer1);

            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);

            let balance = await call(voting, 'locked', [signer1.address]);
            expect(balance[0] / 1e18).to.equal(10);
            expect(balance[1].toString()).to.equal(timestamp8Days.toString());
        });

        it('should fails because already have a lock', async () => {
            let connectedVoting = await connect(voting, signer1);

            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('9'), timestamp8Days]);

            expect(
                await send(connectedVoting, 'createLock', [ethers.utils.parseEther('1'), timestamp8Days])
            ).to.equal(vmError('Withdraw old tokens first'));
        });
    });

    describe('locked', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('10')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
        });

        it('should return locked balance', async () => {
            let balance = await call(voting, 'locked', [signer1.address]);
            expect(balance[0] / 1e18).to.equal(10);
            expect(balance[1].toString()).to.equal(timestamp8Days.toString());
        });


    });

    describe('increaseLockAmount', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
        });

        it("should fails because of zero value", async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'increaseLockAmount', [0])
            ).to.equal(vmError('Value must be greater than 0'));
        });

        it("should fails because lock expired", async () => {
            await send(voting, 'fastTimestamp', [8]);

            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('2')])
            ).to.equal(vmError('Cannot add to expired lock. Withdraw'));
        });

        it("should fails because no lock created", async () => {
            let connectedVoting = await connect(voting, root);

            expect(
                await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('1')])
            ).to.equal(vmError('No existing lock found'));
        });

        it('should increase lock amount', async () => {
            let connectedVoting = await connect(voting, signer1);

            await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('1')]);

            let balance = await call(voting, 'locked', [signer1.address]);
            expect(balance[0] / 1e18).to.equal(11);
        });
    });

    describe('increaseLockTime', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
        });

        it("should fails because time is greater than max cap of 4 years", async () => {
            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockTime', [timestamp4Years + day])
            ).to.equal(vmError('Voting lock can be 4 years max'));
        });

        it("should fails because time is lower than end time", async () => {
            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockTime', [timestamp7Days])
            ).to.equal(vmError('Lock time must be greater'));
        });

        it("should fails because lock expired", async () => {
            await send(voting, 'fastTimestamp', [8]);

            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockTime', [timestamp8Days + day])
            ).to.equal(vmError('Lock expired'));
        });

        it("should fails because no lock created", async () => {
            let connectedVoting = await connect(voting, root);

            expect(
                await send(connectedVoting, 'increaseLockTime', [timestamp7Days])
            ).to.equal(vmError('Nothing is locked'));
        });

        it('should increase lock time', async () => {
            let connectedVoting = await connect(voting, signer1);

            await send(connectedVoting, 'increaseLockTime', [timestamp8Days + day]);
            let balance = await call(voting, 'locked', [signer1.address]);
            expect(balance[1].toString()).to.equal((timestamp8Days + day).toString());
        });
    });

    describe('depositFor', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
        });

        it("should fails because of zero value", async () => {
            let connectedVoting = await connect(voting, signer2);

            expect(
                await send(connectedVoting, 'depositFor', [signer1.address, 0])
            ).to.equal(vmError('Value must be greater than 0'));
        });

        it("should fails because no lock created", async () => {
            let connectedVoting = await connect(voting, signer2);

            expect(
                await send(connectedVoting, 'depositFor', [root.address, ethers.utils.parseEther('1')])
            ).to.equal(vmError('No existing lock found'));
        });

        it("should fails because lock expired", async () => {
            await send(voting, 'fastTimestamp', [8]);

            let connectedVoting = await connect(voting, signer2);
            expect(
                await send(connectedVoting, 'depositFor', [signer1.address, ethers.utils.parseEther('1')])
            ).to.equal(vmError('Cannot add to expired lock. Withdraw'));
        });

        it('should deposit for other user', async () => {
            let connectedVoting = await connect(voting, signer2);

            await send(connectedVoting, 'depositFor', [signer1.address, ethers.utils.parseEther('1')]);

            let balance = await call(voting, 'locked', [signer1.address]);
            expect(balance[0] / 1e18).to.equal(11);
        });
    });

    describe('deletegate', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);
            await send(amptToken, 'transfer', [signer2.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedAmpt2 = await connect(amptToken, signer2);
            await send(connectedAmpt2, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
        });

        it("should fails because of self delegation", async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'delegate', [signer1.address])
            ).to.equal(vmError('Cannot delegate to self'));
        });

        it("should fails because of `to` zero value", async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'delegate', [zeroAddress])
            ).to.equal(vmError("Cannot delegate to the zero address"));
        });

        it("should fails because of missing lock amount", async () => {
            let connectedVoting = await connect(voting, signer2);

            expect(
                await send(connectedVoting, 'delegate', [signer1.address])
            ).to.equal(vmError("No existing lock found"));
        });

        it('should delegate vote for other user', async () => {
            let connectedVoting = await connect(voting, signer1);
            let connectedVoting2 = await connect(voting, signer2);

            await send(connectedVoting, 'delegate', [signer2.address]);

            let balanceDelegator = await call(voting, 'operationLocked', [signer1.address]);
            let balanceDelegatee = await call(voting, 'operationLocked', [signer2.address]);


            let votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            let votePower2 = await call(voting, 'balanceOf', [signer2.address]);

            expect(balanceDelegator[0] / 1e18).to.equal(0);
            expect(balanceDelegator[1].toString()).to.equal(timestamp8Days.toString());
            expect(votePower1 / 1e18).to.equal(0);

            expect(balanceDelegatee[0] / 1e18).to.equal(10);
            expect(balanceDelegatee[1].toString()).to.equal(timestamp8Days.toString());
            expect(votePower2.toString()).to.equal("54794520547660800");

            // increase lock amount
            await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('10')]);

            await send(connectedVoting2, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);

            // check new balances;
            balanceDelegator = await call(voting, 'operationLocked', [signer1.address]);
            balanceDelegatee = await call(voting, 'operationLocked', [signer2.address]);


            votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            votePower2 = await call(voting, 'balanceOf', [signer2.address]);

            expect(balanceDelegator[0] / 1e18).to.equal(10);
            expect(balanceDelegator[1].toString()).to.equal(timestamp8Days.toString());
            expect(votePower1.toString()).to.equal("54794520547660800"); // power is calculated for the new lock amount only


            expect(balanceDelegatee[0] / 1e18).to.equal(20);
            expect(balanceDelegatee[1].toString()).to.equal(timestamp8Days.toString());
            expect(votePower2.toString()).to.equal("109589041095321600"); // calculated power is appended to the existing one
        });
    });

    describe('withdraw', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
        });

        it("should fails because lock expired", async () => {
            await send(voting, 'fastTimestamp', [2]);

            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'withdraw', [])
            ).to.equal(vmError('Cannot withdraw before lock expires'));
        });

        it('should withdraw the locked tokens', async () => {
            await send(voting, 'fastTimestamp', [10]);

            let connectedVoting = await connect(voting, signer1);

            await send(connectedVoting, 'withdraw', []);

            let balanceDelegator = await call(voting, 'locked', [signer1.address]);


            expect(balanceDelegator[0] / 1e18).to.equal(0);
            expect(balanceDelegator[1] / 1e18).to.equal(0);
        });
    });

    describe('balanceOf', () => {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('1000')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('1000'), timestamp4Years]);
        });

        it('should return correct balance', async () => {
            let balance = await call(voting, 'balanceOf', [signer1.address]);
            expect(balance.toString()).to.equal("999999999999981504000");

            // check after 1 year should be current balance * 3 / 4
            await send(voting, 'fastTimestamp', [365]);

            let balance1 = await call(voting, 'balanceOf', [signer1.address]);
            expect(balance1.toString()).to.equal("749999999999986128000");

            // check after 1 year should be current balance / 2
            await send(voting, 'fastTimestamp', [365]);

            let balance2 = await call(voting, 'balanceOf', [signer1.address]);
            expect(balance2.toString()).to.equal("499999999999990752000");

            // check after 1 year should be current balance / 4
            await send(voting, 'fastTimestamp', [365]);

            let balance3 = await call(voting, 'balanceOf', [signer1.address]);
            expect(balance3.toString()).to.equal("249999999999995376000");

            // check after 1 year should be 0
            await send(voting, 'fastTimestamp', [365]);

            let balance4 = await call(voting, 'balanceOf', [signer1.address]);
            expect(balance4.toString()).to.equal("0");
        });
    });

    describe('balanceOf 1M', () => {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('100000000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100000000')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('100000000'), timestamp4Years]);
        });

        it('should return correct balance', async () => {
            let balance = await call(voting, 'balanceOf', [signer1.address]);
            expect(balance.toString()).to.equal("99999999999999999923328000");
        });
    });

    describe('votePower', () => {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root.address);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('1000')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('1000'), timestamp4Years]);
        });

        it('should return correct votePower', async () => {
            let power = await call(voting, 'votePower', []);
            expect(power.toString()).to.equal("999999999999981504000");
        });

        it("should return correct votePower for 2 locks", async () => {
            // second lock
            await send(amptToken, 'transfer', [signer2.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt1 = await connect(amptToken, signer2);
            await send(connectedAmpt1, 'approve', [voting.address, ethers.utils.parseEther('1000')]);

            let connectedVoting1 = await connect(voting, signer2);
            await send(connectedVoting1, 'createLock', [ethers.utils.parseEther('1000'), timestamp4Years]);

            let power = await call(voting, 'votePower', []);
            expect(power.toString()).to.equal("1999999999999963008000");
        })
    });
})

async function getVotingContract(admin) {
    let [voting, amptToken, sw] = await deployVotingContract(admin);

    return [voting, amptToken, sw];
}

async function deployVotingContract(admin) {
    let amptToken = await deployAMPTToken(admin);
    let sw = await deploySmartWalletChecker();

    let Contract = await ethers.getContractFactory("VotingEscrowHarness")

    const ve = await Contract.deploy(amptToken.address, sw.address, "Voting-escrowed AMPT", "veAMPT", 1, timestamp);
    await ve.deployed();
    return [ve, amptToken, sw];
}

async function deployAMPTToken(admin) {
    const Contract = await ethers.getContractFactory("AMPT");
    const token = await Contract.deploy(admin);
    await token.deployed();

    return token;
}

async function deploySmartWalletChecker() {
    const Contract = await ethers.getContractFactory("SmartWalletWhitelist");
    const sw = await Contract.deploy();
    await sw.deployed();

    return sw;
}
