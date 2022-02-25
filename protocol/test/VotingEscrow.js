const { expect } = require("chai");
const { ethers } = require("hardhat");
const { call, send, connect, vmError, zeroAddress, deploy } = require("./utils");

const { deployAMPTToken } = require("./_controller")

const day = 24 * 60 * 60;
const timestamp = Math.floor(Date.now() / 1000);
const timestamp7Days = timestamp + 7 * day;
const timestamp8Days = timestamp + 8 * day;
const timestamp4Years = timestamp + 4 * 365 * day;
const _4years = 4 * 365 * day;


describe('Voting Escrow', function () {
    let root, signer1, signer2, signer3, signer4;

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        root = signers[0];
        signer1 = signers[1];
        signer2 = signers[2];
        signer3 = signers[3];
        signer4 = signers[4];
    })

    describe('constructor', () => {
        it("succeeds when setting amptToken instance", async () => {
            let [voting, amptToken] = await getVotingContract(root);
            expect(await call(voting, "amptToken")).to.equal(amptToken.address);
        });

        it("succeeds when setting admin to contructor argument", async () => {
            let [voting] = await getVotingContract(root);
            expect(await call(voting, 'owner')).to.equal(root.address);
        });

        it("succeeds when setting smartChecker to contructor argument", async () => {
            let [voting, _, sw] = await getVotingContract(root);
            expect(await call(voting, 'smartWalletChecker')).to.equal(sw.address);
        });
    })

    describe('name, symbol, decimals', () => {
        let voting;

        beforeEach(async () => {
            [voting] = await getVotingContract(root);
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
            [voting, _, swOld] = await getVotingContract(root);
            swNew = await deploySmartWalletChecker();
        });

        it('should fails because of wrong owner', async () => {
            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'changeSmartWalletChecker', [swOld.address])
            ).to.equal(vmError("Only owner can call this function"));
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
            [voting, amptToken] = await getVotingContract(root);

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
            ).to.equal(vmError('zero value'));
        });

        it('should fails because of past date', async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp])
            ).to.equal(vmError('unlock time is in the past'));
        });

        it('should fails because of exceed max cap of 4 years', async () => {
            let connectedVoting = await connect(voting, signer1);

            expect(
                await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp4Years + day])
            ).to.equal(vmError('lock can be 4 years max'));
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
            ).to.equal(vmError('already locked'));
        });
    });

    describe('locked', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

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
            [voting, amptToken] = await getVotingContract(root);

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
            ).to.equal(vmError('zero value'));
        });

        it("should fails because lock expired", async () => {
            await send(voting, 'fastTimestamp', [8]);

            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('2')])
            ).to.equal(vmError('lock has expired. Withdraw'));
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
            [voting, amptToken] = await getVotingContract(root);

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
            ).to.equal(vmError('lock can be 4 years max'));
        });

        it("should fails because time is lower than end time", async () => {
            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockTime', [timestamp7Days])
            ).to.equal(vmError('lock time lower than expiration'));
        });

        it("should fails because lock expired", async () => {
            await send(voting, 'fastTimestamp', [8]);

            let connectedVoting = await connect(voting, signer1);
            expect(
                await send(connectedVoting, 'increaseLockTime', [timestamp8Days + day])
            ).to.equal(vmError('lock has expired. Withdraw'));
        });

        it('should increase lock time', async () => {
            let connectedVoting = await connect(voting, signer1);

            await send(connectedVoting, 'increaseLockTime', [timestamp8Days + day]);
            let balance = await call(voting, 'locked', [signer1.address]);
            expect(balance[1].toString()).to.equal((timestamp8Days + day).toString());
        });
    });

    describe('withdraw', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

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
            ).to.equal(vmError('lock has not expired yet'));
        });

        it('should withdraw the locked tokens', async () => {
            await send(voting, 'fastTimestamp', [10]);

            let connectedVoting = await connect(voting, signer1);
            let oldTotalLocked = await call(voting, 'totalLocked');
            let oldBalanceDelegator = await call(voting, 'locked', [signer1.address]);

            await send(connectedVoting, 'withdraw', []);

            let balanceDelegator = await call(voting, 'locked', [signer1.address]);
            let totalLocked = await call(voting, 'totalLocked');

            expect(balanceDelegator[0].toString()).to.equal("0");
            expect(balanceDelegator[1].toString()).to.equal("0");
            expect(totalLocked.toString()).to.equal(oldTotalLocked.sub(oldBalanceDelegator[0]).toString());
        });
    });

    describe('depositFor', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

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
            ).to.equal(vmError('zero value'));
        });

        it("should fails because no lock created", async () => {
            let connectedVoting = await connect(voting, signer2);

            expect(
                await send(connectedVoting, 'depositFor', [root.address, ethers.utils.parseEther('1')])
            ).to.equal(vmError('no lock found'));
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
            let depositedAmount = ethers.utils.parseEther('1');

            await send(amptToken, 'transfer', [signer2.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer2);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let oldBalance = await call(voting, 'locked', [signer1.address]);
            await send(connectedVoting, 'depositFor', [signer1.address, depositedAmount]);

            let newBalance = await call(voting, 'locked', [signer1.address]);
            expect(newBalance[0].toString()).to.equal(oldBalance[0].add(depositedAmount).toString());
        });
    });

    describe('deletegate', function () {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);
            await send(amptToken, 'transfer', [signer2.address, ethers.utils.parseEther('1000')]);
            await send(amptToken, 'transfer', [signer3.address, ethers.utils.parseEther('1000')]);
            await send(amptToken, 'transfer', [signer4.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedAmpt2 = await connect(amptToken, signer2);
            await send(connectedAmpt2, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedAmpt3 = await connect(amptToken, signer3);
            await send(connectedAmpt3, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedAmpt4 = await connect(amptToken, signer4);
            await send(connectedAmpt4, 'approve', [voting.address, ethers.utils.parseEther('100')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);
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

            let votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            let votePower2 = await call(voting, 'balanceOf', [signer2.address]);

            let currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(votePower1.toString()).to.equal("0");
            expect(votePower2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10'),
                    timestamp8Days,
                    currentTs).toString());

            // increase lock amount
            await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('10')]);

            // create delegator own lock
            await send(connectedVoting2, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);

            votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            expect(votePower1.toString()).to.equal("0"); // newly increased amount power goes to the delegator


            votePower2 = await call(voting, 'balanceOf', [signer2.address]);
            expect(votePower2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10').add(ethers.utils.parseEther('10')), // increased amount
                    timestamp8Days,
                    currentTs).add( // new lock
                        calculateVotePower(
                            ethers.utils.parseEther('10'),
                            timestamp8Days,
                            currentTs)
                    ).toString()) // calculated power is appended to the existing one

            // Remove delegation
            await send(connectedVoting, 'delegate', [zeroAddress]);

            votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            expect(votePower1.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10').add(ethers.utils.parseEther('10')), // increased amount
                    timestamp8Days,
                    currentTs)
            );

            votePower2 = await call(voting, 'balanceOf', [signer2.address]);
            expect(votePower2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10'),
                    timestamp8Days,
                    currentTs).toString()
            )
        });

        it('should break the functionality', async () => {
            let connectedVoting = await connect(voting, signer1);

            let connectedVoting4 = await connect(voting, signer4);
            await send(connectedVoting4, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);

            // delegations: signer3 => [signer4]; 
            await send(connectedVoting4, 'delegate', [signer3.address]);

            // delegations: signer3 => [signer4, signer1]; 
            await send(connectedVoting, 'delegate', [signer3.address]);

            // delegations: signer2 => [signer1]; 
            // delegations: signer3 => [signer4, 0x]; 
            await send(connectedVoting, 'delegate', [signer2.address]);

            // delegations: signer2 => [signer1]; 
            // delegations: signer3 => [signer4, 0x]; 
            expect(await send(connectedVoting, 'delegate', [signer2.address])).to.equal(vmError("Cannot delegate to the same address"));

            let currentOldDelegator = await call(voting, 'delegations', [signer3.address, 0]);

            // delegations: signer3 => [signer4, 0x]; 
            expect(currentOldDelegator).to.equal(signer4.address);
        });

        it('should change delegate vote for other user', async () => {
            let connectedVoting = await connect(voting, signer1);
            let connectedVoting2 = await connect(voting, signer2);
            let connectedVoting3 = await connect(voting, signer3);

            await send(connectedVoting, 'delegate', [signer2.address]);

            let votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            let votePower2 = await call(voting, 'balanceOf', [signer2.address]);
            let votePower3 = await call(voting, 'balanceOf', [signer3.address]);

            let currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(votePower1.toString()).to.equal("0");
            expect(votePower2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10'),
                    timestamp8Days,
                    currentTs).toString());
            expect(votePower3.toString()).to.equal("0");

            // increase lock amount
            await send(connectedVoting, 'increaseLockAmount', [ethers.utils.parseEther('10')]);

            // create delegator own lock
            await send(connectedVoting2, 'createLock', [ethers.utils.parseEther('10'), timestamp8Days]);

            votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            expect(votePower1.toString()).to.equal("0"); // newly increased amount power goes to the delegator


            votePower2 = await call(voting, 'balanceOf', [signer2.address]);
            expect(votePower2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10').add(ethers.utils.parseEther('10')), // increased amount
                    timestamp8Days,
                    currentTs).add( // new lock
                        calculateVotePower(
                            ethers.utils.parseEther('10'),
                            timestamp8Days,
                            currentTs)
                    ).toString()) // calculated power is appended to the existing one

            votePower3 = await call(voting, 'balanceOf', [signer3.address]);
            expect(votePower3.toString()).to.equal("0"); // no actions made

            // Change delegation
            await send(connectedVoting, 'delegate', [signer3.address]);

            votePower1 = await call(voting, 'balanceOf', [signer1.address]);
            expect(votePower1.toString()).to.equal("0");

            votePower2 = await call(voting, 'balanceOf', [signer2.address]);
            expect(votePower2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10'),
                    timestamp8Days,
                    currentTs).toString()
            )

            votePower3 = await call(voting, 'balanceOf', [signer3.address]);
            expect(votePower3.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('10').add(ethers.utils.parseEther('10')),
                    timestamp8Days,
                    currentTs).toString()
            )
        });
    });

    describe('balanceOf', () => {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

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
            let currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(balance.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).toString()
            );

            // check after 1 year should be current balance * 3 / 4
            await send(voting, 'fastTimestamp', [365]);

            let balance1 = await call(voting, 'balanceOf', [signer1.address]);
            currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(balance1.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).toString()
            );

            // check after 1 year should be current balance / 2
            await send(voting, 'fastTimestamp', [365]);

            let balance2 = await call(voting, 'balanceOf', [signer1.address]);
            currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(balance2.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).toString()
            );

            // check after 1 year should be current balance / 4
            await send(voting, 'fastTimestamp', [365]);

            let balance3 = await call(voting, 'balanceOf', [signer1.address]);
            currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(balance3.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).toString()
            );

            // check after 1 year should be 0
            await send(voting, 'fastTimestamp', [365]);

            let balance4 = await call(voting, 'balanceOf', [signer1.address]);
            currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(balance4.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).toString()
            );
        });
    });

    describe('balanceOf 1M', () => {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

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

            let currentTs = await call(voting, 'getBlockTimestamp', []);
            expect(balance.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('100000000'),
                    timestamp4Years,
                    currentTs).toString()
            );
        });
    });

    describe('totalSupply', () => {
        let voting, amptToken;

        beforeEach(async () => {
            [voting, amptToken] = await getVotingContract(root);

            await send(voting, 'setBlockNumber', [1]);
            await send(voting, 'setBlockTimestamp', [timestamp]);

            await send(amptToken, 'transfer', [signer1.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt = await connect(amptToken, signer1);
            await send(connectedAmpt, 'approve', [voting.address, ethers.utils.parseEther('1000')]);

            let connectedVoting = await connect(voting, signer1);
            await send(connectedVoting, 'createLock', [ethers.utils.parseEther('1000'), timestamp4Years]);
        });

        it('should return correct votePower', async () => {
            let power = await call(voting, 'totalSupply', []);

            let currentTs = await call(voting, 'getBlockTimestamp', []);

            expect(power.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).toString()
            );
        });

        it("should return correct votePower for 2 locks", async () => {
            // second lock
            await send(amptToken, 'transfer', [signer2.address, ethers.utils.parseEther('1000')]);

            let connectedAmpt1 = await connect(amptToken, signer2);
            await send(connectedAmpt1, 'approve', [voting.address, ethers.utils.parseEther('1000')]);

            let connectedVoting1 = await connect(voting, signer2);
            await send(connectedVoting1, 'createLock', [ethers.utils.parseEther('1000'), timestamp4Years]);

            let power = await call(voting, 'totalSupply', []);
            let currentTs = await call(voting, 'getBlockTimestamp', []);


            expect(power.toString()).to.equal(
                calculateVotePower(
                    ethers.utils.parseEther('1000'),
                    timestamp4Years,
                    currentTs).add(
                        calculateVotePower(
                            ethers.utils.parseEther('1000'),
                            timestamp4Years,
                            currentTs)
                    )
            );
        })
    });
});


async function getVotingContract(admin) {
    let [voting, amptToken, sw] = await deployVotingContract(admin);

    return [voting, amptToken, sw];
}

async function deployVotingContract(admin) {
    let amptToken = await deployAMPTToken(admin);
    let sw = await deploySmartWalletChecker();

    let ve = await deploy("VotingEscrowHarness", [amptToken.address, sw.address, "Voting-escrowed AMPT", "veAMPT", 1, timestamp]);
    return [ve, amptToken, sw];
}

async function deploySmartWalletChecker() {
    const sw = await deploy("SmartWalletWhitelist");
    return sw;
}

function calculateVotePower(amount, expiration, currentTs) {
    let deltaAmount = amount.div(_4years);

    if (currentTs >= expiration) {
        return ethers.utils.parseEther("0");
    }

    let deltaTs = expiration - currentTs;

    return deltaAmount.mul(deltaTs);
}
