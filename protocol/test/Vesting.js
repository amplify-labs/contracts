const { expect } = require("chai");
const { ethers } = require("hardhat");
const { call, send, connect, init, vmError, zeroAddress, wrongOwner, zeroAddressError } = require("./utils");

const { getFactoryContract } = require("./_vesting");

const day = 24 * 60 * 60;
const timestamp = Math.floor(Date.now() / 1000);
const start = timestamp + 1 * day;
const end = timestamp + 4 * 365 * day;
const cliff = 365 * day;


describe('Vesting', function () {
    let factory, amptToken, root, signer1, signer2;

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        root = signers[0];
        signer1 = signers[1];
        signer2 = signers[2];
        signer3 = signers[3];

        [factory, amptToken] = await getFactoryContract(signer1);
    });

    describe('initialize', () => {
        it("succeeds when setting owner through constructor", async () => {
            let { events } = await send(factory, "createVestingContract", [amptToken.address]);

            let vesting = await init("VestingHarness", events[0].args.instance);

            expect(await call(vesting, "owner")).to.equal(root.address);
        });

        it("succeeds when setting token address through constructor", async () => {
            let { events } = await send(factory, "createVestingContract", [amptToken.address]);

            let vesting = await init("VestingHarness", events[0].args.instance);

            expect(await call(vesting, "token")).to.equal(amptToken.address);
        });
    });

    describe('transferOwnership', () => {
        let vesting;
        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);

            vesting = await ethers.getContractAt("VestingHarness", events[0].args.instance);
        });

        it("should fails because of wrong owner", async () => {
            expect(
                await send(vesting, "transferOwnership", [zeroAddress])
            ).to.equal(wrongOwner);
        });

        it("should fails because of zero value", async () => {
            let connectedVesting = await connect(vesting, signer1);
            expect(
                await send(connectedVesting, "transferOwnership", [zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of the same owner", async () => {
            let connectedVesting = await connect(vesting, signer1);
            expect(
                await send(connectedVesting, "transferOwnership", [signer1.address])
            ).to.equal(vmError("New owner cannot be the current owner"));
        });

        it("succeeds when setting new contract owner", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(await call(connectedVesting, "owner")).to.equal(signer1.address);
            let { events } = await send(connectedVesting, "transferOwnership", [signer2.address]);
            expect(await call(connectedVesting, "owner")).to.equal(signer2.address);

            expect(events[0].args.previousOwner).to.equal(signer1.address);
            expect(events[0].args.newOwner).to.equal(signer2.address);
        });
    });

    describe('withdraw', () => {
        let vesting;
        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);

            vesting = await init("VestingHarness", events[0].args.instance);
        });

        it("should fails because of wrong owner", async () => {
            expect(
                await send(vesting, "withdraw", [zeroAddress])
            ).to.equal(wrongOwner);
        });

        it("succeeds when withdrawing tokens", async () => {
            let connectedVesting = await connect(vesting, signer1);
            let connectedAmptToken = await connect(amptToken, signer1);

            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);
            expect((await call(vesting, "balanceOf()", [])).toString()).to.equal(ethers.utils.parseEther("100").toString());

            await send(connectedVesting, "withdraw", [signer1.address]);
            expect((await call(vesting, "balanceOf()", [])).toString()).to.equal("0");
        });
    });

    describe('createEntry', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("2");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);


            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);
        });

        it("should fails because of zero address", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntry", [[zeroAddress, vestingAmount, start, end, cliff, 0, false]])
            ).to.equal(vmError("recipient cannot be the zero address"));
        });

        it("should fails because wrong owner", async () => {
            let connectedVesting = await connect(vesting, signer2);

            expect(
                await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start, end, cliff, 0, false]])
            ).to.equal(wrongOwner);
        });

        it("should fails because of zero value", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntry", [[signer2.address, 0, start, end, cliff, 0, false]])
            ).to.equal(vmError("amount must be greater than zero"));
        });

        it("should fails because of greater unlocked amount", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start, end, cliff, vestingAmount.add(1), false]])
            ).to.equal(vmError("unlocked cannot be greater than amount"));
        });

        it("should fails because of start in past", async () => {
            let connectedVesting = await connect(vesting, signer1);

            await send(vesting, "setBlockTimestamp", [start]);

            expect(
                await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start - day, end, cliff, 0, false]])
            ).to.equal(vmError("Start time must be in the future"));
        });

        it("should fails because of end < start", async () => {
            let connectedVesting = await connect(vesting, signer1);


            expect(
                await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, end, start, cliff, 0, false]])
            ).to.equal(vmError("End time must be after start time"));
        });

        it("should fails because of cliff > end", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start, end, cliff + 4 * 365 * day, 0, false]])
            ).to.equal(vmError("cliff must be less than end"));
        });

        it("should create new entry", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start, end, cliff, 0, false]]);

            let entryId = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);
            let entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(vestingAmount.toString());
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer2.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);
        });

        it("should create new entry and send tokens", async () => {
            let connectedVesting = await connect(vesting, signer1);
            const unlockedAmount = ethers.utils.parseEther("1");

            await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start, end, cliff, unlockedAmount, false]]);

            let entryId = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);
            let entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(unlockedAmount.toString()); // 2 - 1 = 1
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer2.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);
        });

        it("should not create new entry but only send tokens", async () => {
            let connectedVesting = await connect(vesting, signer1);

            await send(connectedVesting, "createEntry", [[signer2.address, vestingAmount, start, end, cliff, vestingAmount, false]]);

            expect(await call(vesting, "entryIdsByRecipient", [signer2.address, 0])).to.equal(vmError("failed to call function"));
        });
    });

    describe('createEntries', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("2");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);


            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);
        });

        it("should fails because of zero address", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer3.address, vestingAmount, start, end, cliff, 0, false],
                        [zeroAddress, vestingAmount, start, end, cliff, 0, false]
                    ]
                ])
            ).to.equal(vmError("recipient cannot be the zero address"));
        });

        it("should fails because wrong owner", async () => {
            let connectedVesting = await connect(vesting, signer2);

            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer2.address, vestingAmount, start, end, cliff, 0, false],
                        [signer3.address, vestingAmount, start, end, cliff, 0, false]
                    ]
                ])
            ).to.equal(wrongOwner);
        });

        it("should fails because of zero value", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer3.address, vestingAmount, start, end, cliff, 0, false],
                        [signer2.address, 0, start, end, cliff, 0, false]
                    ]
                ])
            ).to.equal(vmError("amount must be greater than zero"));
        });

        it("should fails because of greater unlocked amount", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer3.address, vestingAmount, start, end, cliff, 0, false],
                        [signer2.address, vestingAmount, start, end, cliff, vestingAmount.add(1), false]
                    ]
                ])
            ).to.equal(vmError("unlocked cannot be greater than amount"));
        });

        it("should fails because of start in past", async () => {
            let connectedVesting = await connect(vesting, signer1);

            await send(vesting, "setBlockTimestamp", [start]);

            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer3.address, vestingAmount, start, end, cliff, 0, false],
                        [signer2.address, vestingAmount, start - day, end, cliff, 0, false]
                    ]
                ])
            ).to.equal(vmError("Start time must be in the future"));
        });

        it("should fails because of end < start", async () => {
            let connectedVesting = await connect(vesting, signer1);


            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer3.address, vestingAmount, start, end, cliff, 0, false],
                        [signer2.address, vestingAmount, end, start, cliff, 0, false]
                    ]
                ])
            ).to.equal(vmError("End time must be after start time"));
        });

        it("should fails because of cliff > end", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntries", [
                    [
                        [signer3.address, vestingAmount, start, end, cliff, 0, false],
                        [signer2.address, vestingAmount, start, end, cliff + 4 * 365 * day, 0, false]
                    ]
                ])
            ).to.equal(vmError("cliff must be less than end"));
        });

        it("should fails because exceeds the length limit", async () => {
            let connectedVesting = await connect(vesting, signer1);

            expect(
                await send(connectedVesting, "createEntries", generateEntries(101, signer2.address, vestingAmount, start, end, cliff, 0, false))
            ).to.equal(vmError("exceed max length"));
        });

        it("should create new entry", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer3.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);

            let entryId = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);
            let entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(vestingAmount.toString());
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer2.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);


            entryId = await call(vesting, "entryIdsByRecipient", [signer3.address, 0]);
            entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(vestingAmount.toString());
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer3.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);
        });

        it("should create new entry and send tokens", async () => {
            let connectedVesting = await connect(vesting, signer1);
            const unlockedAmount = ethers.utils.parseEther("1");

            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, unlockedAmount, false],
                    [signer3.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);

            let entryId = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);
            let entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(unlockedAmount.toString()); // 2 - 1 = 1
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer2.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);

            entryId = await call(vesting, "entryIdsByRecipient", [signer3.address, 0]);
            entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(vestingAmount.toString());
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer3.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);
        });

        it("should not create new entry but only send tokens", async () => {
            let connectedVesting = await connect(vesting, signer1);

            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, vestingAmount, false],
                    [signer3.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);

            expect(await call(vesting, "entryIdsByRecipient", [signer2.address, 0])).to.equal(vmError("failed to call function"));

            let entryId = await call(vesting, "entryIdsByRecipient", [signer3.address, 0]);
            let entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal(vestingAmount.toString());
            expect(entry[1].toString()).to.equal(start.toString());
            expect(entry[2].toString()).to.equal(end.toString());
            expect(entry[3].toString()).to.equal(cliff.toString());
            expect(entry[4].toString()).to.equal(start.toString());
            expect(entry[5].toString()).to.equal("0");
            expect(entry[6].toString()).to.equal(signer3.address);
            expect(entry[7]).to.equal(false);
            expect(entry[8]).to.equal(false);
        });
    });

    describe('fireEntry', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("1");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);


            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);
        });


        it("should fails because entry not exists", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntry", [
                [signer2.address, vestingAmount, start, end, cliff, 0, false],
            ]);

            expect(
                await send(connectedVesting, "fireEntry", [1])
            ).to.equal(vmError("entry not exists"));
        });

        it("should fails because entry not fireable", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntry", [
                [signer2.address, vestingAmount, start, end, cliff, 0, false],
            ]);
            expect(
                await send(connectedVesting, "fireEntry", [0])
            ).to.equal(vmError("entry not fireable"));
        });

        it("should fire entry before cliff", async () => {
            let connectedVesting = await connect(vesting, signer1);

            await send(vesting, "setBlockTimestamp", [timestamp]);

            await send(connectedVesting, "createEntry", [
                [signer2.address, vestingAmount, start, end, cliff, 0, true],
            ]);

            let entryId = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);
            await send(connectedVesting, "fireEntry", [entryId]);

            let entry = await call(vesting, "entries", [entryId]);

            expect(entry[0].toString()).to.equal("0");
            expect(entry[8]).to.equal(true);
            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal("0");
        });

        it("should fire entry after cliff", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(vesting, "setBlockTimestamp", [timestamp]);

            await send(connectedVesting, "createEntry", [
                [signer2.address, vestingAmount, start, end, cliff, 0, true],
            ]);

            await send(vesting, "fastTimestamp", [367]);
            let entryId = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(calculateVestingAmount(vestingAmount, timestamp + 367 * day).toString());
            await send(connectedVesting, "fireEntry", [entryId]);

            let entry = await call(vesting, "entries", [entryId]);
            expect(entry[0].toString()).to.equal(calculateVestingAmount(vestingAmount, timestamp + 367 * day).toString());
            expect(entry[8]).to.equal(true);

            // after fire entry, vesting amount should remain the same as checkpoint.
            await send(vesting, "fastTimestamp", [10]);
            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(entry[0].toString());

            await send(vesting, "fastTimestamp", [1090]);
            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(entry[0].toString());
        });
    });

    describe('balanceOf contract', () => {
        let vesting;

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);
        });

        it("should return correct value", async () => {
            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);

            expect((await call(vesting, "balanceOf()", [])).toString()).to.equal(ethers.utils.parseEther("100").toString());
        });
    });

    describe('balanceOf entry', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("1");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);

            await send(vesting, "setBlockTimestamp", [timestamp]);
        });

        it("should return correct value", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntry", [
                [signer2.address, vestingAmount, start, end, cliff, 0, false]
            ]);

            await send(vesting, "fastTimestamp", [4 * 365 * day + 1]);

            expect((await call(vesting, "balanceOf(uint256)", [100])).toString()).to.equal("0");
            expect((await call(vesting, "balanceOf(uint256)", [0])).toString()).to.equal(vestingAmount.toString());
        });
    });

    describe('balanceOf recipient', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("1");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);

            await send(vesting, "setBlockTimestamp", [timestamp]);
        });

        it("should return correct value", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer2.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal("0");
        });

        it("should return correct value after cliff expires", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer2.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);

            await send(vesting, "fastTimestamp", [367]);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(
                calculateVestingAmount(vestingAmount.add(vestingAmount), timestamp + 367 * day).toString()
            );
        });

        it("should return correct value after end expires", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer2.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);

            await send(vesting, "fastTimestamp", [4 * 365 * day + 1]);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(
                vestingAmount.add(vestingAmount).toString()
            );
        });

        it("should return correct value after claimed once", async () => {
            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer2.address, vestingAmount, start, end, cliff + 10 * day, 0, false]
                ]
            ]);

            await send(vesting, "fastTimestamp", [367]);

            let balance = await call(vesting, "balanceOf(address)", [signer2.address])
            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(calculateVestingAmount(vestingAmount, timestamp + 367 * day).toString());

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);

            connectedVesting = await connect(vesting, signer2);
            await send(connectedVesting, "claim", []);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal("0");

            await send(vesting, "fastTimestamp", [12]);
            expect(
                (await call(vesting, "balanceOf(address)", [signer2.address])
                ).toString()).to.equal(
                    calculateVestingAmount(vestingAmount, timestamp + 379 * day, timestamp + 367 * day).add(
                        calculateVestingAmount(vestingAmount, timestamp + 379 * day)).toString()
                );
        });
    });

    describe('claim', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("2");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);

            await send(vesting, "setBlockTimestamp", [timestamp]);

            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer2.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);
        });

        it("should claim", async () => {
            await send(vesting, "fastTimestamp", [367]);

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "transfer", [vesting.address, ethers.utils.parseEther("100")]);

            let connectedVesting = await connect(vesting, signer2);
            await send(connectedVesting, "claim", []);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal("0");

            await send(vesting, "fastTimestamp", [1094]); // vesting ends;

            let entryId1 = await call(vesting, "entryIdsByRecipient", [signer2.address, 0]);
            let entryId2 = await call(vesting, "entryIdsByRecipient", [signer2.address, 1]);
            let entry1 = await call(vesting, "entries", [entryId1]);
            let entry2 = await call(vesting, "entries", [entryId2]);

            expect((await call(vesting, "balanceOf(address)", [signer2.address])).toString()).to.equal(
                entry1.amount.sub(entry1.claimed).add(entry2.amount.sub(entry2.claimed)).toString()
            );
        });
    })

    describe('getSnapshot', () => {
        let vesting;

        const vestingAmount = ethers.utils.parseEther("2");

        beforeEach(async () => {
            let connectedFactory = await connect(factory, signer1);
            let { events } = await send(connectedFactory, "createVestingContract", [amptToken.address]);
            vesting = await init("VestingHarness", events[0].args.instance);

            await send(vesting, "setBlockTimestamp", [timestamp]);

            let connectedVesting = await connect(vesting, signer1);
            await send(connectedVesting, "createEntries", [
                [
                    [signer2.address, vestingAmount, start, end, cliff, 0, false],
                    [signer2.address, vestingAmount, start, end, cliff, 0, false]
                ]
            ]);
        });

        it("should return snapshot", async () => {
            await send(vesting, "fastTimestamp", [1461]); // vesting ends;

            let snapshot = await call(vesting, "getSnapshot", [signer2.address]);

            snapshot.forEach((entry, i) => {
                expect(entry[0].toString()).to.equal(i.toString());
                expect(entry[1].toString()).to.equal(vestingAmount.toString());
                expect(entry[2].toString()).to.equal(start.toString());
                expect(entry[3].toString()).to.equal(end.toString());
                expect(entry[4].toString()).to.equal(cliff.toString());
                expect(entry[5].toString()).to.equal("0");
                expect(entry[6].toString()).to.equal(vestingAmount.toString());
                expect(entry[7].toString()).to.equal("false");
            });
        });
    })
});

function generateEntries(count, ...args) {
    let entries = [];
    for (let i = 0; i < count; i++) {
        entries.push(args)
    }

    return [entries];
}

function calculateVestingAmount(amount, currentTimestamp, lastUpdate = start) {
    let deltaT = currentTimestamp - lastUpdate;
    let deltaPeriod = end - start;
    return amount.mul(deltaT).div(deltaPeriod);
}