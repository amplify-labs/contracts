const { expect } = require("chai");
const { ethers } = require("hardhat");

const { init, call, send, connect, wrongOwner, uuidv4, zeroAddress, exp, zeroAddressError, vmError, vmError2, double } = require("./utils");
const { getController, ErrorCode: controllerError, whitelistBorrower } = require("./_controller");

const { PoolType, createPool, ErrorCode: poolError, createCreditLine } = require("./_pool");
const { deployNFT } = require("./_asset");

const day = 24 * 60 * 60;
const timestamp = Math.floor(Date.now() / 1000);
const maturity = timestamp + day * 40;




describe("Pool", () => {
    const minDeposit = ethers.utils.parseEther("1");
    let controller, stableCoin, amptToken, assetsFactory, root, signer1, signer2, signer3, signer4;

    const borrowerRating = ethers.utils.parseEther("1");

    before(async () => {
        [root, signer1, signer2, signer3, signer4] = await ethers.getSigners();
        [controller, stableCoin, amptToken, assetsFactory] = await getController(root);
    });


    describe("initialize", function () {
        it("should initialize a pool", async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            let pool = await createPool(connectedController, "TEST", minDeposit, stableCoin);

            expect(await call(pool, "isInitialized")).to.equal(true);
            expect(await call(pool, "owner")).to.equal(signer1.address);
            expect(await call(pool, "controller")).to.equal(controller.address);
        });
    });

    describe("name, stableCoint, minDeposit, access", () => {
        let pool;
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin);
        });

        it('should return correct name', async () => {
            expect(await call(pool, 'name')).to.equal("TEST");
        });

        it('should return correct stablecoin', async () => {
            expect(await call(pool, 'stableCoin')).to.equal(stableCoin.address);
        });

        it('should return correct minDeposit', async () => {
            expect((await call(pool, 'minDeposit')).toString()).to.equal(minDeposit.toString());
        });

        it('should return correct access', async () => {
            expect((await call(pool, 'access'))).to.equal(PoolType.PUBLIC);
        });
    });

    describe("changeAccess", () => {
        let pool;
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin);
        });

        it('should fails because of wrong owner', async () => {
            expect(await send(pool, "changeAccess", [PoolType.PRIVATE])).to.equal(wrongOwner);
        });

        it('should change the pool access type', async () => {
            let connectedPool = await connect(pool, signer1);
            expect((await call(pool, 'access'))).to.equal(PoolType.PUBLIC);
            await send(connectedPool, "changeAccess", [PoolType.PRIVATE]);
            expect((await call(pool, 'access'))).to.equal(PoolType.PRIVATE);
        });
    });

    describe("getCash", async () => {
        let pool;
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin);
        });

        it('should return correct cash value', async () => {
            const amount = ethers.utils.parseEther("100");
            await send(stableCoin, "mint", [pool.address, amount]);

            expect((await call(pool, "getCash")).toString()).to.equal(amount.toString());
        });
    });

    describe("exchangeRate", () => {
        let pool;
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin);
        });

        it('should return correct exchange rate', async () => {
            const amount = ethers.utils.parseEther("2000");
            const totalSupply = amount.mul(2).div(100);
            const totalBorrows = ethers.utils.parseEther("1500");

            await send(stableCoin, "mint", [pool.address, amount]);

            await send(pool, "setTotalSupply", [totalSupply]);
            await send(pool, "setTotalBorrows", [totalBorrows]);

            expect(
                (await call(pool, "exchangeRate")).toString()
            ).to.equal(
                amount.add(totalBorrows).mul(exp).div(totalSupply).toString()
            );
        });
    });

    describe("lend", () => {
        let pool;

        const lendAmount = ethers.utils.parseEther("100");
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PRIVATE);

            // transfer some tokens to the signer for lending
            await send(stableCoin, "mint", [signer2.address, ethers.utils.parseEther("2000")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, signer2);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);
            await send(connectedStableCoin, "approve", [controller.address, lendAmount]);
        });

        it('should fails because of lower deposit amount', async () => {
            let connectedPool = await connect(pool, signer2);

            expect(
                await send(connectedPool, "lend", [minDeposit.div(2)])
            ).to.equal(vmError2(poolError.AMOUNT_LOWER_THAN_MIN_DEPOSIT));
        });

        it('should fails because of not whitelisted', async () => {
            let connectedPool = await connect(pool, signer2);

            expect(await send(connectedPool, "lend", [lendAmount])).to.equal(vmError2(controllerError.LENDER_NOT_WHITELISTED));
        });

        it('should lend from signer', async () => {
            let connectedPool = await connect(pool, signer2);

            let connectedController = await connect(controller, signer2);
            await send(connectedController, "requestPoolWhitelist", [pool.address, lendAmount]);

            connectedController = await connect(controller, signer1);
            await send(connectedController, "whitelistLender", [signer2.address, pool.address]);

            connectedController = await connect(controller, signer2);
            await send(connectedController, "withdrawApplicationDeposit", [pool.address]);

            await send(connectedPool, "lend", [lendAmount]);

            let currentExchangeRate = await call(pool, "exchangeRate");

            const totalSupply = lendAmount.mul(double).div(currentExchangeRate).div(exp);

            expect((await call(pool, "getCash")).toString()).to.equal(lendAmount.toString());
            expect(
                (await call(pool, "totalSupply")).toString()
            ).to.equal(totalSupply.toString());

            expect(
                (await call(pool, "balanceOf", [signer2.address])).toString()
            ).to.equal(totalSupply.toString());

            expect(
                (await call(pool, "balanceOfUnderlying", [signer2.address])).toString()
            ).to.equal(lendAmount.toString());
        });
    });

    describe("redeem", () => {
        let pool, borrower;

        const lendAmount = ethers.utils.parseEther("100");
        beforeEach(async () => {
            borrower = signer3;
            let connectedController = await connect(controller, borrower);

            // transfer tokens to the signer
            await send(amptToken, "transfer", [borrower.address, lendAmount]);
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, lendAmount]);
            await send(connectedController, "submitBorrower");

            await send(controller, "whitelistBorrower", [borrower.address, 0, borrowerRating]);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            // transfer some tokens to the signer for lending
            await send(stableCoin, "mint", [signer1.address, ethers.utils.parseEther("2000")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, signer1);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, signer1);
            await send(connectedPool, "lend", [lendAmount]);
        });

        it('should fails because of lower balance', async () => {
            let connectedPool = await connect(pool, signer1);

            let tokenAmount = await call(pool, "balanceOf", [signer1.address]);

            expect(await send(connectedPool, "redeem", [tokenAmount.add(2)])).to.equal(vmError2(poolError.AMOUNT_HIGHER));
        });

        it('should redeem signer tokens', async () => {
            let connectedPool = await connect(pool, signer1);

            let tokenAmount = await call(pool, "balanceOf", [signer1.address]);

            // allow pool to burn your tokens
            let poolTokenAddr = await call(pool, "lpToken", []);
            let poolToken = await init("PoolToken", poolTokenAddr);

            let connectedPoolToken = await connect(poolToken, signer1);
            await send(connectedPoolToken, "approve", [pool.address, tokenAmount]);

            expect(await send(connectedPool, "redeem", [tokenAmount]));

            expect((await call(pool, "getCash")).toString()).to.equal("0");
            expect((await call(pool, "totalSupply")).toString()).to.equal("0");

            expect((await call(pool, "balanceOf", [signer1.address])).toString()).to.equal("0");

            expect((await call(pool, "balanceOfUnderlying", [signer1.address])).toString()).to.equal("0");
        });

        it('should fails because of lower cash', async () => {
            let [loanId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, lendAmount, maturity);

            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, lendAmount]);

            // allow pool to burn your tokens
            let tokenAmount = await call(pool, "balanceOf", [signer1.address]);

            let poolTokenAddr = await call(pool, "lpToken", []);
            let poolToken = await init("PoolToken", poolTokenAddr);

            let connectedPoolToken = await connect(poolToken, signer1);
            await send(connectedPoolToken, "approve", [pool.address, tokenAmount]);

            connectedPool = await connect(pool, signer1);
            expect(await send(connectedPool, "redeem", [tokenAmount])).to.equal(vmError2(poolError.NOT_ENOUGH_CASH));
        });
    });

    describe("redeemUnderlying", () => {
        let pool, borrower;

        const lendAmount = ethers.utils.parseEther("100");
        beforeEach(async () => {
            borrower = signer3;
            let connectedController = await connect(controller, borrower);

            // transfer tokens to the signer
            await send(amptToken, "transfer", [borrower.address, lendAmount]);
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, lendAmount]);
            await send(connectedController, "submitBorrower");

            await send(controller, "whitelistBorrower", [borrower.address, 0, borrowerRating]);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            // transfer some tokens to the signer for lending
            await send(stableCoin, "mint", [signer1.address, ethers.utils.parseEther("2000")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, signer1);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, signer1);
            await send(connectedPool, "lend", [lendAmount]);
        });

        it('should fails because of lower balance', async () => {
            let connectedPool = await connect(pool, signer1);

            let amount = await call(pool, "balanceOfUnderlying", [signer1.address]);

            expect(await send(connectedPool, "redeemUnderlying", [amount.add(2)])).to.equal(vmError2(poolError.AMOUNT_HIGHER));
        });

        it('should redeem signer tokens', async () => {
            let connectedPool = await connect(pool, signer1);

            let amount = await call(pool, "balanceOfUnderlying", [signer1.address]);
            let tokensAmount = await call(pool, "balanceOf", [signer1.address]);

            // allow pool to burn your tokens
            let poolTokenAddr = await call(pool, "lpToken", []);
            let poolToken = await init("PoolToken", poolTokenAddr);

            let connectedPoolToken = await connect(poolToken, signer1);
            await send(connectedPoolToken, "approve", [pool.address, tokensAmount]);

            await send(connectedPool, "redeemUnderlying", [amount]);

            expect((await call(pool, "getCash")).toString()).to.equal("0");
            expect((await call(pool, "totalSupply")).toString()).to.equal("0");

            expect((await call(pool, "balanceOf", [signer1.address])).toString()).to.equal("0");

            expect((await call(pool, "balanceOfUnderlying", [signer1.address])).toString()).to.equal("0");
        });

        it('should fails because of lower cash', async () => {
            let [loanId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, lendAmount, maturity);

            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, lendAmount]);

            // allow pool to burn your tokens
            let amount = await call(pool, "balanceOfUnderlying", [signer1.address]);
            let tokensAmount = await call(pool, "balanceOf", [signer1.address]);

            let poolTokenAddr = await call(pool, "lpToken", []);
            let poolToken = await init("PoolToken", poolTokenAddr);

            let connectedPoolToken = await connect(poolToken, signer1);
            await send(connectedPoolToken, "approve", [pool.address, tokensAmount]);

            connectedPool = await connect(pool, signer1);
            expect(await send(connectedPool, "redeemUnderlying", [amount])).to.equal(vmError2(poolError.NOT_ENOUGH_CASH));
        });
    });

    describe("balanceOf", () => {
        let pool;

        const lendAmount = ethers.utils.parseEther("100");
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            // transfer some tokens to the signer for lending
            await send(stableCoin, "mint", [signer1.address, ethers.utils.parseEther("2000")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, signer1);
            await send(connectedStableCoin, "approve", [pool.address, ethers.utils.parseEther("100")]);
        });

        it("should return correct balance", async () => {
            let connectedPool = await connect(pool, signer1);

            await send(connectedPool, "lend", [lendAmount]);

            let currentExchangeRate = await call(pool, "exchangeRate");

            const balanceOf = lendAmount.mul(double).div(currentExchangeRate).div(exp);

            expect((await call(pool, "balanceOf", [signer1.address])).toString()).to.equal(balanceOf.toString());
        });
    });

    describe("balanceOfUnderlying", () => {
        let pool;

        const lendAmount = ethers.utils.parseEther("100");
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            await whitelistBorrower(amptToken, controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            // transfer some tokens to the signer for lending
            await send(stableCoin, "mint", [signer1.address, ethers.utils.parseEther("2000")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, signer1);
            await send(connectedStableCoin, "approve", [pool.address, ethers.utils.parseEther("100")]);
        });

        it("should return correct balance", async () => {
            let connectedPool = await connect(pool, signer1);

            await send(connectedPool, "lend", [lendAmount]);

            expect((await call(pool, "balanceOfUnderlying", [signer1.address])).toString()).to.equal(lendAmount.toString());
        });
    });

    describe("totalSupply", () => {
        let pool;

        const lendAmount = ethers.utils.parseEther("100");
        beforeEach(async () => {
            const connectedController = await connect(controller, signer1);
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            // transfer some tokens to the signer for lending
            await send(stableCoin, "mint", [signer1.address, ethers.utils.parseEther("100")]);
            await send(stableCoin, "mint", [signer2.address, ethers.utils.parseEther("100")]);
            await send(stableCoin, "mint", [signer3.address, ethers.utils.parseEther("100")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, signer1);
            await send(connectedStableCoin, "approve", [pool.address, ethers.utils.parseEther("100")]);

            connectedStableCoin = await connect(stableCoin, signer2);
            await send(connectedStableCoin, "approve", [pool.address, ethers.utils.parseEther("100")]);

            connectedStableCoin = await connect(stableCoin, signer3);
            await send(connectedStableCoin, "approve", [pool.address, ethers.utils.parseEther("100")]);
        });

        it("should return correct balance", async () => {
            let connectedPool = await connect(pool, signer1);
            await send(connectedPool, "lend", [lendAmount]);

            let currentExchangeRate = await call(pool, "exchangeRate");
            let totalSupply = lendAmount.mul(double).div(currentExchangeRate).div(exp);

            connectedPool = await connect(pool, signer2);
            await send(connectedPool, "lend", [lendAmount]);

            currentExchangeRate = await call(pool, "exchangeRate");
            totalSupply = totalSupply.add(lendAmount.mul(double).div(currentExchangeRate).div(exp));

            connectedPool = await connect(pool, signer3);
            await send(connectedPool, "lend", [lendAmount]);

            currentExchangeRate = await call(pool, "exchangeRate");
            totalSupply = totalSupply.add(lendAmount.mul(double).div(currentExchangeRate).div(exp));

            expect((await call(pool, "getCash")).toString()).to.equal(lendAmount.mul(3).toString());
            expect((await call(pool, "totalSupply", [])).toString()).to.equal(totalSupply.toString());
        });
    });

    describe("createCreditLine", () => {
        let pool, lender, borrower, tokenId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");
        const tokenHash = uuidv4();

        beforeEach(async () => {
            lender = signer1;
            borrower = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            // transfer some tokens to the lender for lending
            await send(stableCoin, "mint", [lender.address, ethers.utils.parseEther("2000")]);

            // transfer some tokens to the borrower for interest
            await send(stableCoin, "mint", [borrower.address, ethers.utils.parseEther("100")]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, ethers.utils.parseEther("2000")]);

            await send(pool, "lend", [lendAmount]);
        });

        it("should fails because of borrow cap exceeded", async () => {
            let connectedPool = await connect(pool, borrower);

            // create nft
            let connectedFactory = await connect(assetsFactory, borrower);
            tokenId = await deployNFT(connectedFactory, tokenHash, "A", lendAmount.add(100), maturity);

            expect(
                await send(connectedPool, "createCreditLine", [tokenId])
            ).to.equal(vmError(controllerError.BORROW_CAP_EXCEEDED));
        });

        it("should fails because of invalid owner", async () => {
            let connectedPool = await connect(pool, borrower);

            // create nft
            let connectedFactory = await connect(assetsFactory, borrower);
            tokenId = await deployNFT(connectedFactory, tokenHash, "A", lendAmount, maturity);

            expect(
                await send(connectedPool, "createCreditLine", [tokenId])
            ).to.equal(vmError(controllerError.INVALID_OWNER));
        });

        it("should fails because of redeemed asset", async () => {
            let connectedPool = await connect(pool, borrower);

            let connectedFactory = await connect(assetsFactory, borrower);
            // create nft
            tokenId = await deployNFT(connectedFactory, tokenHash, "A", lendAmount, maturity);
            await send(connectedFactory, "markAsRedeemed", [tokenId]);

            await send(connectedFactory, "transferFrom", [borrower.address, pool.address, tokenId]);

            expect(
                await send(connectedPool, "createCreditLine", [tokenId])
            ).to.equal(vmError(controllerError.ASSET_REDEEMED));
        });

        it("should fails because of expired maturity", async () => {
            let connectedPool = await connect(pool, borrower);

            await send(controller, "setBlockTimestamp", [maturity + 2 * day]);

            // create nft
            let connectedFactory = await connect(assetsFactory, borrower);
            tokenId = await deployNFT(connectedFactory, tokenHash, "A", lendAmount, maturity);
            await send(connectedFactory, "transferFrom", [borrower.address, pool.address, tokenId]);

            expect(
                await send(connectedPool, "createCreditLine", [tokenId])
            ).to.equal(vmError(controllerError.MATURITY_DATE_EXPIRED));
        });

        it("should fails because of zero interest rate", async () => {
            let connectedPool = await connect(pool, borrower);

            await send(controller, "setBlockTimestamp", [timestamp]);

            // create nft
            let connectedFactory = await connect(assetsFactory, borrower);
            tokenId = await deployNFT(connectedFactory, tokenHash, "F", lendAmount, maturity);
            await send(connectedFactory, "transferFrom", [borrower.address, pool.address, tokenId]);

            expect(
                await send(connectedPool, "createCreditLine", [tokenId])
            ).to.equal(vmError(controllerError.NOT_ALLOWED_TO_CREATE_CREDIT_LINE));
        });

        it("should create credit line", async () => {
            let connectedPool = await connect(pool, borrower);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            // create nft
            let connectedFactory = await connect(assetsFactory, borrower);
            tokenId = await deployNFT(connectedFactory, tokenHash, "A", lendAmount, maturity);
            await send(connectedFactory, "transferFrom", [borrower.address, pool.address, tokenId]);

            let { events } = await send(connectedPool, "createCreditLine", [tokenId]);
            const loanId = events[0].args.loanId;

            let creditLine = await call(pool, "creditLines", [0]);
            let penaltyInfo = await call(pool, "penaltyInfo", [loanId]);

            expect(creditLine.borrower).to.equal(borrower.address);
            expect(creditLine.borrowCap.toString()).to.equal(lendAmount.mul(90).div(100).toString());
            expect(creditLine.borrowIndex.toString()).to.equal(exp.toString());
            expect(creditLine.principal.toString()).to.equal("0");
            expect(creditLine.lockedAsset.toString()).to.equal(tokenId.toString());
            expect(creditLine.accrualBlockNumber.toString()).to.equal(blockNumber.toString());
            expect(creditLine.isClosed).to.equal(false);
            expect(creditLine.interestRate.toString()).to.equal(
                ethers.utils.parseUnits("20", 16).toString()
            );

            expect(penaltyInfo.maturity.toString()).to.equal(maturity.toString());
            expect(penaltyInfo.index.toString()).to.equal(exp.toString());
            expect(penaltyInfo.timestamp.toString()).to.equal((maturity + 30 * day).toString());
            expect(penaltyInfo.isOpened).to.equal(false);
        });

        it("should fails because of reusage of asset", async () => {
            let connectedPool = await connect(pool, borrower);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            // create nft
            let connectedFactory = await connect(assetsFactory, borrower);
            tokenId = await deployNFT(connectedFactory, tokenHash, "A", lendAmount, maturity);
            await send(connectedFactory, "transferFrom", [borrower.address, pool.address, tokenId]);

            await send(connectedPool, "createCreditLine", [tokenId]);

            expect(
                await send(connectedPool, "createCreditLine", [tokenId])
            ).to.equal(vmError(poolError.LOAN_ASSET_ALREADY_USED));
        });
    });

    describe("closeCreditLine", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");
        const tokenHash = uuidv4();

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("1000")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);
        });

        it("should fails because of wrong borrower", async () => {
            let connectedPool = await connect(pool, lender);

            expect(
                await send(connectedPool, "closeCreditLine", [loanId])
            ).to.equal(vmError(poolError.WRONG_BORROWER))
        });

        it("should close creditLine", async () => {
            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "closeCreditLine", [loanId]);

            let creditLine = await call(pool, "creditLines", [0]);
            expect(creditLine.isClosed).to.equal(true);

            expect(await call(pool, "lockedAssetsIds", [creditLine.lockedAsset])).to.equal(false);
        });

        it("should fails because of already closed", async () => {
            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "closeCreditLine", [loanId]);

            expect(
                await send(connectedPool, "closeCreditLine", [loanId])
            ).to.equal(vmError(poolError.LOAN_IS_ALREADY_CLOSED))
        });

        it("should fails because existing debt", async () => {
            let connectedPool = await connect(pool, borrower);

            await send(connectedPool, "borrow", [loanId, borrowAmount]);

            expect(
                await send(connectedPool, "closeCreditLine", [loanId])
            ).to.equal(vmError("Debt should be 0"))
        });
    });

    describe("borrow", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");
        const tokenHash = uuidv4();

        beforeEach(async () => {
            borrower = signer3;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);


            await send(controller, "updateBorrowerInfo", [borrower.address, [lendAmount, 1]]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);
        });

        it("should fails because borrower not a member", async () => {
            let connectedPool = await connect(pool, lender);
            expect(
                await send(connectedPool, "borrow", [loanId, borrowAmount])
            ).to.equal(vmError2(poolError.WRONG_BORROWER));
        });

        it("should fails because loan is overdue", async () => {
            let connectedPool = await connect(pool, borrower);

            await send(pool, "setBlockTimestamp", [maturity + 1 * day]);

            expect(
                await send(connectedPool, "borrow", [loanId, borrowAmount])
            ).to.equal(vmError2(poolError.LOAN_IS_OVERDUE));
        });

        it("should fails because cap exceeds", async () => {
            let connectedPool = await connect(pool, borrower);

            expect(
                await send(connectedPool, "borrow", [loanId, lendAmount.mul(2)])
            ).to.equal(vmError2(controllerError.BORROW_CAP_EXCEEDED));
        });

        it("should fails because of insuficient funds", async () => {
            let connectedPool = await connect(pool, borrower);

            expect(
                await send(connectedPool, "borrow", [loanId, lendAmount])
            ).to.equal(vmError2(controllerError.BORROW_CAP_EXCEEDED));
        });

        it("should borrow tokens", async () => {
            let connectedPool = await connect(pool, borrower);

            await send(connectedPool, "borrow", [loanId, borrowAmount]);


            let creditLine = await call(pool, "creditLines", [0]);

            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);

            expect(creditLine.principal.toString()).to.equal(borrowAmount.toString());
            expect(creditLine.accrualBlockNumber.toString()).to.equal("1");
            expect(creditLine.borrowIndex.toString()).to.equal(borrowIndex.toString());
        });
    });

    describe("repay", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer3;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should fails because amount higher", async () => {
            let connectedPool = await connect(pool, borrower);

            expect(
                await send(connectedPool, "repay", [loanId, lendAmount])
            ).to.equal(vmError2(poolError.AMOUNT_HIGHER));
        });

        it("should fails because wrong borrower", async () => {
            let connectedPool = await connect(pool, lender);

            expect(
                await send(connectedPool, "repay", [loanId, borrowAmount])
            ).to.equal(vmError(poolError.WRONG_BORROWER));
        });

        it("should repay  tokens", async () => {
            await send(stableCoin, "mint", [borrower.address, lendAmount]);

            // approve some tokens to the pool for repay
            let connectedStableCoin = await connect(stableCoin, borrower);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            await send(pool, "fastForward", [30]);

            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "repay", [loanId, ethers.constants.MaxUint256]);

            let creditLine = await call(pool, "creditLines", [0]);
            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);

            expect(creditLine.principal.toString()).to.equal("0");
            expect(creditLine.accrualBlockNumber.toString()).to.equal("31");
            expect(creditLine.borrowIndex.toString()).to.equal(borrowIndex.toString());
            expect(creditLine.isClosed).to.equal(true);
        });

        it("should repay tokens in multiple tx", async () => {
            await send(stableCoin, "mint", [borrower.address, lendAmount]);

            // approve some tokens to the pool for repay
            let connectedStableCoin = await connect(stableCoin, borrower);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            await send(pool, "fastForward", [30]);

            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "repay", [loanId, ethers.utils.parseEther("500")]);
            await send(connectedPool, "repay", [loanId, ethers.constants.MaxUint256]);

            let creditLine = await call(pool, "creditLines", [0]);
            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);

            expect(creditLine.principal.toString()).to.equal("0");
            expect(creditLine.accrualBlockNumber.toString()).to.equal("31");
            expect(creditLine.borrowIndex.toString()).to.equal(borrowIndex.toString());
            expect(creditLine.isClosed).to.equal(true);
        });
    });

    describe("repayBehalf", () => {
        let pool, lender, borrower, payer, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer4;
            lender = signer2;
            payer = signer3;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should fails because amount higher", async () => {
            let connectedPool = await connect(pool, payer);

            expect(
                await send(connectedPool, "repayBehalf", [borrower.address, loanId, lendAmount])
            ).to.equal(vmError2(poolError.AMOUNT_HIGHER));
        });

        it("should fails because wrong borrower", async () => {
            let connectedPool = await connect(pool, payer);

            expect(
                await send(connectedPool, "repayBehalf", [lender.address, loanId, borrowAmount])
            ).to.equal(vmError2(poolError.WRONG_BORROWER));
        });

        it("should repayBehalf  tokens", async () => {
            await send(stableCoin, "mint", [payer.address, lendAmount]);

            // approve some tokens to the pool for repay
            let connectedStableCoin = await connect(stableCoin, payer);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            await send(pool, "fastForward", [30]);

            let connectedPool = await connect(pool, payer);
            await send(connectedPool, "repayBehalf", [borrower.address, loanId, ethers.constants.MaxUint256]);

            let creditLine = await call(pool, "creditLines", [0]);
            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);

            expect(creditLine.principal.toString()).to.equal("0");
            expect(creditLine.accrualBlockNumber.toString()).to.equal("31");
            expect(creditLine.borrowIndex.toString()).to.equal(borrowIndex.toString());
            expect(creditLine.isClosed).to.equal(true);
        });
    });

    describe("getBorrowerTotalPrincipal", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should return correct value", async () => {
            expect((await call(pool, "getBorrowerTotalPrincipal", [borrower.address])).toString()).to.equal(borrowAmount.toString());
        });
    });

    describe("totalPrincipal", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should return correct value", async () => {
            expect((await call(pool, "totalPrincipal", [])).toString()).to.equal(borrowAmount.toString());
        });
    });

    describe("totalInterestRate", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should return correct value", async () => {
            expect(
                (await call(pool, "totalInterestRate", [])).toString()
            ).to.equal(ethers.utils.parseEther("20").div(100).toString());
        });
    });

    describe("getBorrowerBalance", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should return correct value", async () => {

            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);

            expect(
                (await call(pool, "getBorrowerBalance", [borrower.address])
                ).toString()).to.equal(
                    borrowAmount.mul(borrowIndex).div(creditLine.borrowIndex).toString()
                );
        });

        it("should return correct value", async () => {

            await send(pool, "fastTimestamp", [30]);
            await send(pool, "fastForward", [6]);

            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);

            expect(
                (await call(pool, "getBorrowerBalance", [borrower.address])).toString()
            ).to.equal(
                borrowAmount.mul(borrowIndex).div(creditLine.borrowIndex).toString()
            );
        });
    });

    describe("getTotalBorrowBalance", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should return correct value", async () => {
            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);

            expect(
                (await call(pool, "getTotalBorrowBalance", [])).toString()
            ).to.equal(borrowAmount.mul(borrowIndex).div(creditLine.borrowIndex).toString());
        });

        it("should return correct value", async () => {

            await send(pool, "fastForward", [30]);

            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);

            expect(
                (await call(pool, "getTotalBorrowBalance", [])).toString()
            ).to.equal(borrowAmount.mul(borrowIndex).div(creditLine.borrowIndex).toString());
        });
    });

    describe("getBorrowIndex", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);
        });

        it("should return correct value", async () => {
            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);

            expect(borrowIndex.toString()).to.equal(exp.toString());
        });


        it("should return correct value", async () => {
            let blocksDelta = 30;
            await send(pool, "fastForward", [blocksDelta]);

            let borrowIndex = await call(pool, "getBorrowIndex", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);

            let assetInterestRate = ethers.utils.parseUnits("10", 16);

            let interestProduct = assetInterestRate.mul(borrowerRating).div(exp);
            let interestRate = interestProduct.add(assetInterestRate);
            let interestRatePerYear = interestRate.div(365);

            let interestFactor = interestRatePerYear.mul(blocksDelta);
            let newBorrowIndex = interestFactor.mul(creditLine.borrowIndex).div(exp).add(creditLine.borrowIndex);

            expect(borrowIndex.toString()).to.equal(newBorrowIndex.toString());
        });
    });

    describe("unlockAsset", () => {
        let pool, lender, borrower, tokenId, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);

            await send(stableCoin, "mint", [borrowAmount.address, lendAmount]);

            // approve some tokens to the pool for repay
            connectedStableCoin = await connect(stableCoin, borrower);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            await send(pool, "fastForward", [30]);
        });

        it("should fails because wrong borrower", async () => {
            let connectedPool = await connect(pool, lender);

            expect(
                await send(connectedPool, "unlockAsset", [loanId])
            ).to.equal(vmError(poolError.WRONG_BORROWER));
        });

        it("should fails because unclosed loan", async () => {
            let connectedPool = await connect(pool, borrower);

            expect(
                await send(connectedPool, "unlockAsset", [loanId])
            ).to.equal(vmError(poolError.LOAN_IS_NOT_CLOSED));
        });

        it("should unlock asset", async () => {
            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "repay", [loanId, ethers.constants.MaxUint256]);

            await send(connectedPool, "unlockAsset", [loanId]);
            expect(await call(assetsFactory, "ownerOf", [tokenId])).to.equal(borrower.address);
        });
    });

    describe("getPenaltyIndexAndFee", () => {
        let pool, lender, borrower, loanId;

        const lendAmount = ethers.utils.parseEther("2000");
        const borrowAmount = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            borrower = signer1;
            lender = signer2;
            const connectedController = await connect(controller, borrower);

            // transfer AMPT tokens to the borrower
            await send(amptToken, "transfer", [borrower.address, ethers.utils.parseEther("100")]);

            // approve deposit for controller
            let connectedAmptToken = await connect(amptToken, borrower);
            await send(connectedAmptToken, "approve", [controller.address, ethers.utils.parseEther("100")]);

            await send(connectedController, "submitBorrower");
            await send(controller, "whitelistBorrower", [borrower.address, lendAmount, borrowerRating]);

            // create pool
            pool = await createPool(connectedController, "TEST", minDeposit, stableCoin, PoolType.PUBLIC);

            await send(stableCoin, "mint", [lender.address, lendAmount]);

            // approve some tokens to the pool for lending
            let connectedStableCoin = await connect(stableCoin, lender);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            let connectedPool = await connect(pool, lender);
            await send(connectedPool, "lend", [lendAmount]);

            const blockNumber = 1;

            await send(controller, "setBlockTimestamp", [timestamp]);
            await send(pool, "setBlockTimestamp", [timestamp]);
            await send(controller, "setBlockNumber", [blockNumber]);
            await send(pool, "setBlockNumber", [blockNumber]);

            [loanId, tokenId] = await createCreditLine(controller, stableCoin, assetsFactory, amptToken, pool, borrower, borrowAmount, maturity);

            connectedPool = await connect(pool, borrower);
            await send(connectedPool, "borrow", [loanId, borrowAmount]);

            await send(stableCoin, "mint", [borrowAmount.address, lendAmount]);

            // approve some tokens to the pool for repay
            connectedStableCoin = await connect(stableCoin, borrower);
            await send(connectedStableCoin, "approve", [pool.address, lendAmount]);

            await send(pool, "fastForward", [30]);
        });

        it("should return correct value if loan is closed", async () => {
            let connectedPool = await connect(pool, borrower);
            await send(connectedPool, "repay", [loanId, ethers.constants.MaxUint256]);

            let penaltyInfo = await call(pool, "getPenaltyIndexAndFee", [loanId]);

            expect(penaltyInfo[0].toString()).to.equal("0");
            expect(penaltyInfo[1].toString()).to.equal("0");
        });

        it("should return correct value for 1 stage", async () => {
            await send(pool, "fastTimestamp", [75]);

            let penaltyDt = await call(pool, "getPenaltyIndexAndFee", [loanId]);
            let penaltyInfo = await call(pool, "penaltyInfo", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);
            let timestamp = await call(pool, "getBlockTimestamp");

            let [index, amout] = calculatePenaltyFee(
                creditLine.principal,
                penaltyInfo.timestamp,
                penaltyInfo.index,
                timestamp
            );

            expect(penaltyDt[0].toString()).to.equal(index.toString());
            expect(penaltyDt[1].toString()).to.equal(amout.toString());
        });

        it("should return correct value for 2 stage", async () => {
            await send(pool, "fastTimestamp", [105]);

            let penaltyDt = await call(pool, "getPenaltyIndexAndFee", [loanId]);
            let penaltyInfo = await call(pool, "penaltyInfo", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);
            let timestamp = await call(pool, "getBlockTimestamp");

            let [index, amount] = await calculatePenaltyFee(
                creditLine.principal,
                penaltyInfo.timestamp,
                penaltyInfo.index,
                timestamp
            );
            expect(penaltyDt[0].toString()).to.equal(index.toString());
            expect(penaltyDt[1].toString()).to.equal(amount.toString());
        });

        it("should return correct value for 3 stage", async () => {
            await send(pool, "fastTimestamp", [165]);


            let penaltyDt = await call(pool, "getPenaltyIndexAndFee", [loanId]);
            let penaltyInfo = await call(pool, "penaltyInfo", [loanId]);
            let creditLine = await call(pool, "creditLines", [0]);
            let timestamp = await call(pool, "getBlockTimestamp");

            let [index, amount] = calculatePenaltyFee(
                creditLine.principal,
                penaltyInfo.timestamp,
                penaltyInfo.index,
                timestamp
            );

            expect(penaltyDt[0].toString()).to.equal(index.toString());
            expect(penaltyDt[1].toString()).to.equal(amount.toString());
        });
    });
});

function calculatePenaltyFee(principal, priorTimestamp, priorIndex, timestamp) {

    let daysDelta, penaltyAmount;
    let fee = ethers.BigNumber.from(0);
    let penaltyIndex = priorIndex;

    let year = ethers.BigNumber.from(365);

    let stages = [
        { fee: ethers.utils.parseUnits("4", 16).div(year), start: ethers.BigNumber.from(30 * day + maturity), end: ethers.BigNumber.from(60 * day + maturity) },
        { fee: ethers.utils.parseUnits("8", 16).div(year), start: ethers.BigNumber.from(60 * day + maturity), end: ethers.BigNumber.from(120 * day + maturity) },
        { fee: ethers.utils.parseUnits("15", 16).div(year), start: ethers.BigNumber.from(120 * day + maturity), end: ethers.BigNumber.from(180 * day + maturity) },
    ];

    stages.forEach(stage => {
        if (timestamp >= stage.start) {
            if (timestamp > stage.end) {
                daysDelta = _calculateDaysDelta(stage.end, priorTimestamp, stage.start, day);
            } else {
                daysDelta = _calculateDaysDelta(timestamp, priorTimestamp, stage.start, day);
            }

            penaltyIndex = getGracePeriodFee(stage.fee, daysDelta, penaltyIndex);
            fee = penaltyIndex.mul(principal).div(exp).add(fee);
        }
    });

    if (fee > 0) {
        penaltyAmount = fee.sub(principal);
    }

    return [penaltyIndex, penaltyAmount];
}

function getGracePeriodFee(borrowRateMantissa, daysDelta, currentPenaltyIndex) {
    let simpleInterestFactor = borrowRateMantissa.mul(daysDelta);
    let penaltyIndex = simpleInterestFactor.mul(currentPenaltyIndex).div(exp).add(currentPenaltyIndex);

    return penaltyIndex;
}

function _calculateDaysDelta(timestamp, acrrualTimestamp, _start, day) {
    let daysDelta;
    if (acrrualTimestamp > _start) {
        daysDelta = timestamp.sub(acrrualTimestamp).div(day);
    } else {
        daysDelta = timestamp.sub(_start).div(day);
    }

    return daysDelta;
}