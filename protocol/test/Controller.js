const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { init, call, connect, deploy, wrongOwner, send, vmError, zeroAddress, zeroAddressError, double, exp } = require("./utils");

const {
    deployProvisionPool,
    deployAsset,
    deployAMPTToken,
    deployInterestRate,
    deployController,
    getController,
    createStableCoin,
    whitelistBorrower
} = require("./_controller");

const { PoolType, createPool } = require("./_pool");

describe("Controller", () => {
    let root, signer1, signer2;

    const borrowerRating = ethers.utils.parseEther("1");

    beforeEach(async () => {
        [root, signer1, signer2] = await ethers.getSigners();
    })

    describe("constructor", () => {
        it("succeeds setting owner through constructor", async () => {
            let controller = await deployController();

            expect(await call(controller, "owner")).to.equal(root.address);
        });
    });

    describe("_setInterestRateModel", () => {
        let controller, interestRateModel, fakeInterestRateModel;

        beforeEach(async () => {
            controller = await deployController();
            interestRateModel = await deployInterestRate();
            fakeInterestRateModel = await deployInterestRate(true);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "_setInterestRateModel", [interestRateModel.address])
            ).to.equal(wrongOwner);
        });

        it("should fails because of contract implementation", async () => {
            expect(
                await send(controller, "_setInterestRateModel", [fakeInterestRateModel.address])
            ).to.equal(vmError("marker method returned false"));
        });

        it("succeeds setting interest rate model", async () => {
            await send(controller, "_setInterestRateModel", [interestRateModel.address]);

            expect(await call(controller, "interestRateModel")).to.equal(interestRateModel.address);
        });

        it("should fails because of same implementation set", async () => {
            await send(controller, "_setInterestRateModel", [interestRateModel.address]);

            expect(
                await send(controller, "_setInterestRateModel", [interestRateModel.address])
            ).to.equal(vmError("interestRateModel is already set to this value"));
        });
    });

    describe("_setProvisionPool", () => {
        let controller, provisionPool, fakeProvisionPool;

        beforeEach(async () => {
            controller = await deployController();
            provisionPool = await deployProvisionPool(controller);
            fakeProvisionPool = await deployProvisionPool(controller, true);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "_setProvisionPool", [provisionPool.address])
            ).to.equal(wrongOwner);
        });

        it("should fails because of contract implementation", async () => {
            expect(
                await send(controller, "_setProvisionPool", [fakeProvisionPool.address])
            ).to.equal(vmError("marker method returned false"));
        });

        it("succeeds setting provision pool contract", async () => {
            await send(controller, "_setProvisionPool", [provisionPool.address]);

            expect(await call(controller, "provisionPool")).to.equal(provisionPool.address);
        });

        it("should fails because of same implementation set", async () => {
            await send(controller, "_setProvisionPool", [provisionPool.address]);

            expect(
                await send(controller, "_setProvisionPool", [provisionPool.address])
            ).to.equal(vmError("provisionPool is already set to this value"));
        });
    });

    describe("_setAssetsFactory", () => {
        let controller, assetsFactory, fakeAssetsFactory;

        beforeEach(async () => {
            controller = await deployController();
            assetsFactory = await deployAsset();
            fakeAssetsFactory = await deployAsset(true);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "_setAssetsFactory", [assetsFactory.address])
            ).to.equal(wrongOwner);
        });

        it("should fails because of contract implementation", async () => {
            expect(
                await send(controller, "_setAssetsFactory", [fakeAssetsFactory.address])
            ).to.equal(vmError("marker method returned false"));
        });

        it("succeeds setting provision pool contract", async () => {
            await send(controller, "_setAssetsFactory", [assetsFactory.address]);

            expect(await call(controller, "assetsFactory")).to.equal(assetsFactory.address);
        });

        it("should fails because of same implementation set", async () => {
            await send(controller, "_setAssetsFactory", [assetsFactory.address]);

            expect(
                await send(controller, "_setAssetsFactory", [assetsFactory.address])
            ).to.equal(vmError("assetsFactory is already set to this value"));
        });
    });

    describe("_setAmptContract", () => {
        let controller, amptToken;

        beforeEach(async () => {
            controller = await deployController();
            amptToken = await deployAMPTToken(root);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "_setAmptContract", [amptToken.address])
            ).to.equal(wrongOwner);
        });

        it("succeeds setting amptToken pool contract", async () => {
            await send(controller, "_setAmptContract", [amptToken.address]);

            expect(await call(controller, "amptToken")).to.equal(amptToken.address);
        });

        it("should fails because of same implementation set", async () => {
            await send(controller, "_setAmptContract", [amptToken.address]);

            expect(
                await send(controller, "_setAmptContract", [amptToken.address])
            ).to.equal(vmError("amptToken is already set to this value"));
        });
    });

    describe("_setAmptDepositAmount", () => {
        let controller, amptToken;
        const newDepositAmount = ethers.utils.parseEther("12");

        beforeEach(async () => {
            controller = await deployController();
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "_setAmptDepositAmount", [newDepositAmount])
            ).to.equal(wrongOwner);
        });

        it("should fails because of zero value", async () => {
            expect(await send(controller, "_setAmptDepositAmount", [0])
            ).to.equal(vmError("amount must be greater than 0"));
        });

        it("should skip update", async () => {
            await send(controller, "_setAmptDepositAmount", [ethers.utils.parseEther("10")]);

            expect((await call(controller, "amptDepositAmount")).toString()).to.equal(ethers.utils.parseEther("10").toString());
        });

        it("succeeds setting amptDeposit amount", async () => {
            await send(controller, "_setAmptDepositAmount", [newDepositAmount]);

            expect((await call(controller, "amptDepositAmount")).toString()).to.equal(newDepositAmount.toString());
        });
    });

    describe("transferFunds", () => {
        let controller, amptToken;

        beforeEach(async () => {
            [controller, _, amptToken] = await getController(root);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(await send(connectedController, "transferFunds", [signer1.address])).to.equal(wrongOwner);
        });

        it("should fails because of zero address", async () => {
            expect(await send(controller, "transferFunds", [zeroAddress])).to.equal(zeroAddressError);
        });

        it("should transfer funds if any", async () => {
            const depositAmount = ethers.utils.parseEther("100");
            expect((await call(amptToken, "balanceOf", [controller.address])).toString()).to.equal("0");

            // transfer tokens to the controller
            await send(amptToken, "transfer", [controller.address, depositAmount]);

            expect((await call(amptToken, "balanceOf", [controller.address])).toString()).to.equal(depositAmount.toString());

            // transfer funds to the root
            await send(controller, "transferFunds", [root.address]);

            expect((await call(amptToken, "balanceOf", [controller.address])).toString()).to.equal("0");
        });
    });

    describe("submitBorrower", () => {
        let controller, amptToken;

        beforeEach(async () => {
            [controller, _, amptToken] = await getController(root);
        });

        it("should fails because of allowance missing", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "submitBorrower")
            ).to.equal(vmError("Allowance is not enough"));
        });

        it("should submit new borrower", async () => {
            const connectedController = await connect(controller, signer1);
            const depositAmount = ethers.utils.parseEther("10");

            // transfer tokens to the signer
            await send(amptToken, "transfer", [signer1.address, ethers.utils.parseEther("100")]);

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "approve", [controller.address, depositAmount]);

            expect(
                (await call(amptToken, "allowance", [signer1.address, controller.address])).toString()
            ).to.equal(depositAmount.toString());

            await send(connectedController, "submitBorrower");

            let borrower = await call(controller, "borrowers", [signer1.address]);

            expect(borrower.debtCeiling.toString()).to.equal("0");
            expect(borrower.ratingMantissa.toString()).to.equal("0");
            expect(borrower.whitelisted).to.equal(false);
            expect(borrower.created).to.equal(true);
        });
    });

    describe("requestPoolWhitelist", () => {
        let controller, stableCoin, amptToken, pool;

        const depositAmount = ethers.utils.parseEther("10");

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);

            let connectedController = await connect(controller, signer1);

            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", ethers.utils.parseEther("1"), stableCoin, PoolType.PRIVATE);
        });

        it("should fails because of zero address", async () => {
            const connectedController = await connect(controller, signer2);

            expect(
                await send(connectedController, "requestPoolWhitelist", [zeroAddress, depositAmount])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of allowance missing", async () => {
            const connectedController = await connect(controller, signer2);

            expect(
                await send(connectedController, "requestPoolWhitelist", [pool.address, depositAmount])
            ).to.equal(vmError("Lender does not approve allowance"));
        });

        it("should submit new lender", async () => {
            const connectedController = await connect(controller, signer2);

            // transfer tokens to the signer
            await send(stableCoin, "mint", [signer2.address, ethers.utils.parseEther("100")]);

            let connectedStableCoin = await connect(stableCoin, signer2);
            await send(connectedStableCoin, "approve", [controller.address, depositAmount]);

            expect(
                (await call(stableCoin, "allowance", [signer2.address, controller.address])).toString()
            ).to.equal(depositAmount.toString());

            await send(connectedController, "requestPoolWhitelist", [pool.address, depositAmount]);

            let application = await call(controller, "poolApplications", [pool.address, 0]);

            expect(application.lender).to.equal(signer2.address);
            expect(application.depositAmount.toString()).to.equal(depositAmount.toString());
            expect(application.whitelisted).to.equal(false);
            expect(application.created).to.equal(true);
        });
    });

    describe("withdrawApplicationDeposit", () => {
        let controller, stableCoin, amptToken, pool;

        const depositAmount = ethers.utils.parseEther("10");

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);

            await whitelistBorrower(amptToken, controller, signer1);
            let connectedController = await connect(controller, signer1);
            pool = await createPool(connectedController, "TEST", ethers.utils.parseEther("1"), stableCoin, PoolType.PRIVATE);

            // transfer tokens to the signer
            await send(stableCoin, "mint", [signer2.address, ethers.utils.parseEther("100")]);

            let connectedStableCoin = await connect(stableCoin, signer2);
            await send(connectedStableCoin, "approve", [controller.address, depositAmount]);

            expect(
                (await call(stableCoin, "allowance", [signer2.address, controller.address])).toString()
            ).to.equal(depositAmount.toString());


            connectedController = await connect(controller, signer2);
            await send(connectedController, "requestPoolWhitelist", [pool.address, depositAmount]);

            expect((await call(stableCoin, "balanceOf", [controller.address])).toString()).to.equal(depositAmount.toString());

            connectedController = await connect(controller, signer1);
            await send(connectedController, "whitelistLender", [signer2.address, pool.address]);
        });

        it("should fails because of zero address", async () => {
            const connectedController = await connect(controller, signer2);

            expect(
                await send(connectedController, "withdrawApplicationDeposit", [zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of wrong lender", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "withdrawApplicationDeposit", [pool.address])
            ).to.equal(vmError("invalid application lender"));
        });

        it("should withdraws the deposited amount", async () => {

            let signerBalance = await call(stableCoin, "balanceOf", [signer2.address]);

            const connectedController = await connect(controller, signer2);
            await send(connectedController, "withdrawApplicationDeposit", [pool.address]);

            let currentBalance = await call(stableCoin, "balanceOf", [controller.address]);
            expect(currentBalance.toString()).to.equal("0");

            currentBalance = await call(stableCoin, "balanceOf", [signer2.address]);
            expect(currentBalance.toString()).to.equal(signerBalance.add(depositAmount).toString());

            let application = await call(controller, "poolApplications", [pool.address, 0]);
            expect(application.lender).to.equal(zeroAddress);
            expect(application.depositAmount.toString()).to.equal("0");
        });
    });

    describe("whitelistBorrower", () => {
        let controller, amptToken;

        beforeEach(async () => {
            [controller, _, amptToken] = await getController(root);
        });

        it("should fails because of zero address", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "whitelistBorrower", [zeroAddress, 0, 0])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "whitelistBorrower", [signer1.address, 0, 0])
            ).to.equal(wrongOwner);
        });

        it("should fails because of borrower not exists", async () => {
            expect(await send(controller, "whitelistBorrower", [signer1.address, 0, 0])).to.equal(vmError("4"));
        });

        it("should whitelists the borrower", async () => {
            await whitelistBorrower(amptToken, controller, signer1);

            let borrower = await call(controller, "borrowers", [signer1.address]);

            expect(borrower.debtCeiling.toString()).to.equal("0");
            expect(borrower.ratingMantissa.toString()).to.equal(borrowerRating.toString());
            expect(borrower.whitelisted).to.equal(true);
            expect(borrower.created).to.equal(true);
        });
    });

    describe("blacklistBorrower", () => {
        let controller, amptToken;

        beforeEach(async () => {
            [controller, _, amptToken] = await getController(root);
        });

        it("should fails because of zero address", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "blacklistBorrower", [zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "blacklistBorrower", [signer1.address])
            ).to.equal(wrongOwner);
        });

        it("should fails because of borrower not exists", async () => {
            let connectedController = await connect(controller, signer1);
            expect(await send(controller, "blacklistBorrower", [signer1.address])).to.equal(vmError("4"));
        });

        it("should blacklists the borrower", async () => {
            await whitelistBorrower(amptToken, controller, signer1);

            await send(controller, "blacklistBorrower", [signer1.address]);
            let borrower = await call(controller, "borrowers", [signer1.address]);

            expect(borrower.debtCeiling.toString()).to.equal("0");
            expect(borrower.ratingMantissa.toString()).to.equal(borrowerRating.toString());
            expect(borrower.whitelisted).to.equal(false);
            expect(borrower.created).to.equal(true);
        });
    });

    describe("whitelistLender", () => {
        let controller, amptToken, stableCoin, pool, borrower, lender;

        const depositAmount = ethers.utils.parseEther("10");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;

            [controller, stableCoin, amptToken] = await getController(root);

            await whitelistBorrower(amptToken, controller, borrower);
            let connectedController = await connect(controller, borrower);
            pool = await createPool(connectedController, "TEST", ethers.utils.parseEther("1"), stableCoin, PoolType.PRIVATE);

            // transfer tokens to the signer
            await send(stableCoin, "mint", [lender.address, ethers.utils.parseEther("100")]);

            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [controller.address, depositAmount]);

            expect(
                (await call(stableCoin, "allowance", [lender.address, controller.address])).toString()
            ).to.equal(depositAmount.toString());


            connectedController = await connect(controller, lender);
            await send(connectedController, "requestPoolWhitelist", [pool.address, depositAmount]);
        });

        it("should fails because of zero address lender", async () => {
            const connectedController = await connect(controller, borrower);

            expect(
                await send(connectedController, "whitelistLender", [zeroAddress, pool.address])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of zero address pool", async () => {
            const connectedController = await connect(controller, borrower);

            expect(
                await send(connectedController, "whitelistLender", [lender.address, zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, lender);
            expect(
                await send(connectedController, "whitelistLender", [lender.address, pool.address])
            ).to.equal(vmError("8"));
        });

        it("should whitelists the lender", async () => {
            const connectedController = await connect(controller, borrower);
            await send(connectedController, "whitelistLender", [lender.address, pool.address]);

            let application = await call(controller, "poolApplications", [pool.address, 0]);

            expect(application.lender).to.equal(lender.address);
            expect(application.depositAmount.toString()).to.equal(depositAmount.toString());
            expect(application.whitelisted).to.equal(true);
            expect(application.created).to.equal(true);
        });

        it("should fails because of existing application", async () => {
            const connectedController = await connect(controller, borrower);
            await send(connectedController, "whitelistLender", [lender.address, pool.address]);

            expect(await send(connectedController, "whitelistLender", [lender.address, pool.address])).to.equal(vmError("7"));
        });
    });

    describe("blacklistLender", () => {
        let controller, amptToken, stableCoin, pool;

        const depositAmount = ethers.utils.parseEther("10");

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);

            await whitelistBorrower(amptToken, controller, signer1);
            let connectedController = await connect(controller, signer1);
            pool = await createPool(connectedController, "TEST", ethers.utils.parseEther("1"), stableCoin, PoolType.PRIVATE);

            // transfer tokens to the signer
            await send(stableCoin, "mint", [signer2.address, ethers.utils.parseEther("100")]);

            let connectedStableCoin = await connect(stableCoin, signer2);
            await send(connectedStableCoin, "approve", [controller.address, depositAmount]);

            expect(
                (await call(stableCoin, "allowance", [signer2.address, controller.address])).toString()
            ).to.equal(depositAmount.toString());

            connectedController = await connect(controller, signer2);
            await send(connectedController, "requestPoolWhitelist", [pool.address, depositAmount]);
        });

        it("should fails because of zero address", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "blacklistLender", [zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of non whitelisted lender", async () => {
            expect(await send(controller, "blacklistLender", [signer2.address])).to.equal(vmError("12"));
        });

        it("should blacklists the lender", async () => {
            const connectedController = await connect(controller, signer1);
            await send(connectedController, "whitelistLender", [signer2.address, pool.address]);
            await send(connectedController, "blacklistLender", [signer2.address]);

            let lenderWhitelisted = await call(controller, "borrowerWhitelists", [root.address, signer1.address]);
            expect(lenderWhitelisted).to.equal(false);
        });
    });

    describe("updateBorrowerInfo", () => {
        let controller, amptToken;

        beforeEach(async () => {
            [controller, _, amptToken] = await getController(root);

            const depositAmount = ethers.utils.parseEther("10");

            // transfer tokens to the signer
            await send(amptToken, "transfer", [signer1.address, depositAmount]);

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "approve", [controller.address, depositAmount]);

            const connectedController = await connect(controller, signer1);
            await send(connectedController, "submitBorrower");

            await send(controller, "whitelistBorrower", [signer1.address, 1, 1]);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "updateBorrowerInfo", [signer1.address, [0, 0]])
            ).to.equal(wrongOwner);
        });

        it("should fails because of borrower not exists", async () => {
            expect(await send(controller, "updateBorrowerInfo", [signer2.address, [0, 0]])).to.equal(vmError("4"));
        });

        it("should update the borrower info", async () => {
            await send(controller, "updateBorrowerInfo", [signer1.address, [10, 1]]);
            let borrower = await call(controller, "borrowers", [signer1.address]);

            expect(borrower.debtCeiling.toString()).to.equal("10");
            expect(borrower.ratingMantissa.toString()).to.equal("1");
            expect(borrower.whitelisted).to.equal(true);
            expect(borrower.created).to.equal(true);
        });
    });

    describe("addStableCoin", () => {
        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);
        });

        it("should fails because of zero address", async () => {
            expect(
                await send(controller, "addStableCoin", [zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "addStableCoin", [stableCoin.address])
            ).to.equal(wrongOwner);
        });

        it("should add stable coin", async () => {
            let newStableCoin = await createStableCoin(controller, "TEST", "TEST");
            await send(controller, "addStableCoin", [stableCoin.address]);

            expect(await call(controller, "getStableCoins")).to.contain(stableCoin.address);
        })
    });

    describe("removeStableCoin", () => {
        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);
        });

        it("should fails because of zero address", async () => {
            expect(
                await send(controller, "removeStableCoin", [zeroAddress])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "removeStableCoin", [stableCoin.address])
            ).to.equal(wrongOwner);
        });

        it("should add stable coin", async () => {
            let newStableCoin = await createStableCoin(controller, "TEST", "TEST");
            await send(controller, "addStableCoin", [stableCoin.address]);

            await send(controller, "removeStableCoin", [stableCoin.address]);
            expect(await call(controller, "getStableCoins")).to.not.contain(stableCoin.address);
        })
    });

    describe("createPool", () => {
        let controller, stableCoin, amptToken;
        const minDeposit = ethers.utils.parseEther("1");

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);
        });

        it("should creates a pool", async () => {
            const connectedController = await connect(controller, signer1);

            await whitelistBorrower(amptToken, controller, signer1);
            let { events } = await send(connectedController, "createPool", ["TEST", minDeposit, stableCoin.address, PoolType.PUBLIC]);

            const poolAddr = events[0].args.pool;

            expect(events[0].args.owner).to.equal(signer1.address);
            expect(events[0].args.stableCoin).to.equal(stableCoin.address);
            expect(events[0].args.minDeposit.toString()).to.equal(minDeposit.toString());
            expect(events[0].args.access).to.equal(PoolType.PUBLIC);

            let borrowerPool = await call(controller, "pools", [poolAddr]);

            expect(borrowerPool.owner).to.equal(signer1.address);
            expect(borrowerPool.isActive).to.equal(true);
        });
    })

    describe("_setAmptSpeed", () => {
        let controller, stableCoin, amptToken;
        const minDeposit = ethers.utils.parseEther("1");
        const amptSpeed = ethers.utils.parseEther("1");

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);
        });

        it("should fails because of wrong owner", async () => {
            const connectedController = await connect(controller, signer1);

            expect(
                await send(connectedController, "_setAmptSpeed", [zeroAddress, 0])
            ).to.equal(wrongOwner);
        });

        it("should fails because of zero address", async () => {
            expect(
                await send(controller, "_setAmptSpeed", [zeroAddress, 0])
            ).to.equal(zeroAddressError);
        });

        it("should fails because of inactive pool", async () => {
            const pool = await deploy("PoolHarness");
            expect(
                await send(controller, "_setAmptSpeed", [pool.address, 0])
            ).to.equal(vmError("pool is not active"));
        });

        it("should fails because of zero value", async () => {
            const connectedController = await connect(controller, signer1);

            await whitelistBorrower(amptToken, controller, signer1);
            let { events } = await send(connectedController, "createPool", ["TEST", minDeposit, stableCoin.address, PoolType.PUBLIC]);
            const poolAddr = events[0].args.pool;

            expect(
                await send(controller, "_setAmptSpeed", [poolAddr, 0])
            ).to.equal(vmError("speed must be greater than 0"));
        });

        it("should updates ampt speed", async () => {
            const connectedController = await connect(controller, signer1);

            await whitelistBorrower(amptToken, controller, signer1);
            let { events } = await send(connectedController, "createPool", ["TEST", minDeposit, stableCoin.address, PoolType.PUBLIC]);
            const poolAddr = events[0].args.pool;

            await send(controller, "_setAmptSpeed", [poolAddr, amptSpeed]);

            let speed = await call(controller, "amptPoolSpeeds", [poolAddr]);
            expect(speed.toString()).to.equal(amptSpeed.toString());
        });
    });

    describe("getPoolAPY", () => {
        let controller, stableCoin, amptToken, pool;
        const minDeposit = ethers.utils.parseEther("1");
        const amptSpeed = ethers.utils.parseEther("1");

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);

            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);

            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);
        });

        it("should return correct value", async () => {
            expect(
                await call(controller, "getPoolAPY", [pool.address])
            ).to.equal("0");
        });

        it("should return correct value", async () => {
            let totalCash = ethers.utils.parseEther("2000");
            let totalBorrows = ethers.utils.parseEther("1500");
            let totalInterestRate = ethers.utils.parseUnits("1", 17);

            await send(stableCoin, "mint", [pool.address, totalCash]);
            await send(pool, "setTotalBorrows", [totalBorrows]);
            await send(pool, "setTotalInterestRate", [totalInterestRate]);

            expect(
                await call(controller, "getPoolAPY", [pool.address])
            ).to.equal(totalBorrows.mul(exp).div(totalBorrows.add(totalCash)).mul(totalInterestRate).div(exp).toString());
        });
    });


    describe("Rewards", () => {
        let controller, stableCoin, amptToken, pool;

        const blockNumber = 4;

        const amptSpeed = ethers.utils.parseEther("100");

        const totalSupply = ethers.utils.parseEther("100000");
        const totalPrincipal = ethers.utils.parseEther("1500");
        const totalBorrows = ethers.utils.parseEther("1500");

        const supplyIndex = amptSpeed.div(2).mul(blockNumber).mul(double).div(totalSupply);
        const borrowIndex = amptSpeed.div(2).mul(blockNumber).mul(double).div(totalPrincipal);

        const supplierRewardsAmount = totalSupply.mul(supplyIndex).div(double);
        const borrowerRewardsAmount = totalPrincipal.mul(borrowIndex).div(double);

        beforeEach(async () => {
            [controller, stableCoin, amptToken] = await getController(root);

            const minDeposit = ethers.utils.parseEther("1");

            // transfer tokens to the signer
            await send(amptToken, "transfer", [signer1.address, ethers.utils.parseEther("2000")]);

            // transfer tokens to the controller
            await send(amptToken, "transfer", [controller.address, ethers.utils.parseEther("20000")]);

            let connectedAmptToken = await connect(amptToken, signer1);
            await send(connectedAmptToken, "approve", [controller.address, totalPrincipal]);

            let connectedController = await connect(controller, signer1);
            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [signer1.address, 0, 1]);

            let { events } = await send(connectedController, "createPool", ["TEST", minDeposit, stableCoin.address, PoolType.PUBLIC]);
            const poolAddr = events[0].args.pool;

            pool = await init("PoolHarness", poolAddr);

            await send(controller, "_setAmptSpeed", [poolAddr, amptSpeed]);
            await send(controller, "setBlockNumber", [blockNumber]);

            await send(pool, "setTotalSupply", [totalSupply]);
            await send(pool, "setTotalPrincipal", [totalPrincipal]);
            await send(pool, "setTotalBorrows", [totalBorrows]);
        });

        describe("getSupplyReward", () => {
            it("should return supply reward", async () => {
                await send(controller, "setSupplierBalance", [signer1.address, pool.address, totalSupply]);
                await send(controller, "lendAllowed", [pool.address, signer1.address, totalSupply]);

                const rewardsState = await call(controller, "rewardsState", [pool.address]);
                expect(rewardsState.supplyIndex.toString()).to.equal(supplyIndex.toString());
                expect(rewardsState.supplyBlockNumber.toString()).to.equal("4");

                const supplyState = await call(controller, "supplierState", [signer1.address, pool.address]);
                expect(supplyState.index.toString()).to.equal(supplyIndex.toString());
                expect(supplyState.accrued.toString()).to.equal(supplierRewardsAmount.toString());

                const supplyReward = await call(controller, "getSupplyReward", [signer1.address, pool.address]);
                expect(supplyReward.toString()).to.equal(supplierRewardsAmount.toString());
            });
        });

        describe("getTotalSupplyReward", () => {
            it("should return supply reward", async () => {
                await send(controller, "setSupplierBalance", [signer1.address, pool.address, totalSupply]);
                await send(controller, "lendAllowed", [pool.address, signer1.address, totalSupply]);

                let rewardsState = await call(controller, "rewardsState", [pool.address]);
                expect(rewardsState.supplyIndex.toString()).to.equal(supplyIndex.toString());
                expect(rewardsState.supplyBlockNumber.toString()).to.equal("4");

                let supplyState = await call(controller, "supplierState", [signer1.address, pool.address]);
                expect(supplyState.index.toString()).to.equal(supplyIndex.toString());
                expect(supplyState.accrued.toString()).to.equal(supplierRewardsAmount.toString());

                const supplyReward = await call(controller, "getTotalSupplyReward", [signer1.address]);
                expect(supplyReward.toString()).to.equal(supplierRewardsAmount.toString());
            });
        });

        describe("getBorrowReward", () => {
            it("should return borrow reward", async () => {
                await send(controller, "setBorrowerTotalPrincipal", [signer1.address, pool.address, totalBorrows]);
                await send(controller, "borrowAllowed", [pool.address, signer1.address, totalBorrows]);

                const rewardsState = await call(controller, "rewardsState", [pool.address]);
                expect(rewardsState.borrowIndex.toString()).to.equal(borrowIndex.toString());
                expect(rewardsState.borrowBlockNumber.toString()).to.equal("4");

                const borrowState = await call(controller, "borrowerState", [signer1.address, pool.address]);
                expect(borrowState.index.toString()).to.equal(borrowIndex.toString());
                expect(borrowState.accrued.toString()).to.equal(borrowerRewardsAmount.toString());

                const borrowReward = await call(controller, "getBorrowReward", [signer1.address, pool.address]);
                expect(borrowReward.toString()).to.equal(borrowerRewardsAmount.toString());
            });
        });

        describe("getTotalBorrowReward", () => {
            it("should return borrow reward", async () => {
                let connectedController = await connect(controller, signer1);
                await send(connectedController, "submitBorrower");

                await send(controller, "whitelistBorrower", [signer1.address, 0, 1]);
                await send(controller, "setBorrowerTotalPrincipal", [signer1.address, pool.address, totalBorrows]);

                await send(controller, "borrowAllowed", [pool.address, signer1.address, totalBorrows]);

                const rewardsState = await call(controller, "rewardsState", [pool.address]);
                expect(rewardsState.borrowIndex.toString()).to.equal(borrowIndex.toString());
                expect(rewardsState.borrowBlockNumber.toString()).to.equal("4");

                const borrowState = await call(controller, "borrowerState", [signer1.address, pool.address]);
                expect(borrowState.index.toString()).to.equal(borrowIndex.toString());
                expect(borrowState.accrued.toString()).to.equal(borrowerRewardsAmount.toString());

                const borrowReward = await call(controller, "getTotalBorrowReward", [signer1.address]);
                expect(borrowReward.toString()).to.equal(borrowerRewardsAmount.toString());
            });
        });

        describe("claimAMPT", () => {
            it("should claim ampt as supplier", async () => {
                await send(controller, "setSupplierBalance", [signer1.address, pool.address, totalSupply]);
                await send(controller, "lendAllowed", [pool.address, signer1.address, totalSupply]);

                let supplyReward = await call(controller, "getTotalSupplyReward", [signer1.address]);
                expect(supplyReward.toString()).to.equal(supplierRewardsAmount.toString());

                let connectedController = await connect(controller, signer1);
                await send(connectedController, "claimAMPT(address)", [signer1.address]);

                supplyReward = await call(controller, "getTotalSupplyReward", [signer1.address]);
                expect(supplyReward.toString()).to.equal("0");
            });

            it("should claim ampt as borrower", async () => {
                let connectedController = await connect(controller, signer1);
                await send(connectedController, "submitBorrower");

                await send(controller, "whitelistBorrower", [signer1.address, 0, 1]);
                await send(controller, "setBorrowerTotalPrincipal", [signer1.address, pool.address, totalBorrows]);

                await send(controller, "borrowAllowed", [pool.address, signer1.address, totalBorrows]);

                let borrowReward = await call(controller, "getTotalBorrowReward", [signer1.address]);
                expect(borrowReward.toString()).to.equal(borrowerRewardsAmount.toString());

                await send(connectedController, "claimAMPT(address)", [signer1.address]);

                borrowReward = await call(controller, "getTotalSupplyReward", [signer1.address]);
                expect(borrowReward.toString()).to.equal("0");
            })
        })
    });
});