const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    deployFactory,
    deployCollectible,
    createStableCoin,
    deployFakeToken,
    createNFT,
    createPool,
    depositInPool,
    parseBN
} = require("./utils");

describe("Pool info", async () => {
    let poolAddr, stableCoin;
    const minDeposit = ethers.utils.parseEther("0.1");

    beforeEach(async () => {
        let factory = await deployFactory();
        stableCoin = await createStableCoin(factory);
        poolAddr = await createPool(factory, stableCoin, minDeposit);
    });

    it("has the declared values", async () => {
        let pool = await ethers.getContractAt("Pool", poolAddr);

        expect(await pool.name()).to.equal('MATIC-1',);
        expect(await pool.structureType()).to.equal('discounting');
        expect(await pool.stableCoin()).to.equal(stableCoin);
        expect(parseBN(await pool.minDeposit())).to.equal(parseBN(minDeposit));
        expect(parseBN(await pool.totalDeposited())).to.equal(0);
        expect(parseBN(await pool.totalBorrowed())).to.equal(0);
    });
});

describe("Pool deposit", async () => {
    let poolAddr, stableCoin;
    const minDeposit = ethers.utils.parseEther("0.1");

    beforeEach(async () => {
        let factory = await deployFactory();
        stableCoin = await createStableCoin(factory);
        poolAddr = await createPool(factory, stableCoin, minDeposit);
    });

    it("allowing to deposit", async () => {
        const [owner, addr1] = await ethers.getSigners();
        const amount = ethers.utils.parseEther("2");

        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amount);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amount);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amount);

        expect(parseBN(await pool.totalDeposited())).to.equal(parseBN(amount));
        expect(parseBN(await pool.balances(addr1.address))).to.equal(parseBN(amount));
        expect(parseBN(await pool.lockedTokens(addr1.address))).to.equal(parseBN(amount));

        let lpToken = await pool.lpToken();
        let poolTokenContract = await ethers.getContractAt("PoolToken", lpToken);
        expect(parseBN(await poolTokenContract.totalSupply())).to.equal(parseBN(amount));
        expect(parseBN(await poolTokenContract.balanceOf(addr1.address))).to.equal(parseBN(amount));
    });
});

describe("Pool withdraw", async () => {
    let poolAddr, stableCoin;
    const amountToDeposit = ethers.utils.parseEther("2");
    const amountToWithdraw = ethers.utils.parseEther("1");

    beforeEach(async () => {
        const minDeposit = ethers.utils.parseEther("0.1");
        let factory = await deployFactory();
        stableCoin = await createStableCoin(factory);
        poolAddr = await createPool(factory, stableCoin, minDeposit);
    });

    it("allowing to withdraw", async () => {
        const [owner, addr1] = await ethers.getSigners();
        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amountToDeposit);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amountToDeposit);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amountToDeposit);

        // init LPToken
        let lpToken = await pool.lpToken();
        let poolTokenContract = await ethers.getContractAt("PoolToken", lpToken);

        let approveTx = await poolTokenContract.connect(addr1).approve(poolAddr, amountToWithdraw);
        // wait until the transaction is mined
        await approveTx.wait();

        // currentValues;
        let currentTotalDeposited = await pool.totalDeposited();
        let currentBalance = await pool.balances(addr1.address);
        let currentLockedTokens = await pool.lockedTokens(addr1.address);

        let currentLpTotalSupply = await poolTokenContract.totalSupply();
        let currentLpBalanceOf = await poolTokenContract.balanceOf(addr1.address);
        let currentAccountBalance = await stableCoinContract.balanceOf(addr1.address);

        // withdraw
        let withdrawTx = await pool.connect(addr1).withdraw(amountToWithdraw);
        // wait until the transaction is mined
        let txWait = await withdrawTx.wait();

        expect(parseBN(await pool.totalDeposited())).to.equal(parseBN(currentTotalDeposited.sub(amountToWithdraw)));
        expect(parseBN(await pool.balances(addr1.address))).to.equal(parseBN(currentBalance.sub(amountToWithdraw)));
        expect(parseBN(await pool.lockedTokens(addr1.address))).to.equal(parseBN(currentLockedTokens.sub(amountToWithdraw)));

        expect(parseBN(await poolTokenContract.totalSupply())).to.equal(parseBN(currentLpTotalSupply.sub(amountToWithdraw)));
        expect(parseBN(await poolTokenContract.balanceOf(addr1.address))).to.equal(parseBN(currentLpBalanceOf.sub(amountToWithdraw)));

        expect(parseBN(await stableCoinContract.balanceOf(addr1.address) / 1e18)).to.equal(parseBN(currentAccountBalance.add(amountToWithdraw) / 1e18));
    });
});

describe("Pool borrow/repay", async () => {
    let factory, stableCoin, poolAddr, asset, tokenId;
    const minDeposit = ethers.utils.parseEther("0.1");
    const assetValue = ethers.utils.parseEther("100");

    beforeEach(async () => {
        factory = await deployFactory();
        stableCoin = await createStableCoin(factory)
        poolAddr = await createPool(factory, stableCoin, minDeposit);
        asset = await deployCollectible();

        tokenId = await createNFT(asset, assetValue, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", 1631462793, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08.png");
    });

    it("allowing to borrow", async () => {
        const [owner, addr1] = await ethers.getSigners();
        const loanAmount = ethers.utils.parseEther("10");
        const amountToDeposit = ethers.utils.parseEther("200");

        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);
        let ntfFactory = await ethers.getContractAt("Asset", asset);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amountToDeposit);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amountToDeposit);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amountToDeposit);

        // Transfer NFT to the Pool contract
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        // create loan
        let tx = await factory.createLoan(asset, tokenId, poolAddr);
        let waitTx = await tx.wait();
        expect(await factory.loans(owner.address, 0)).to.equal(waitTx.events[0].args.loan);

        // Borrow loan
        let loanAddr = waitTx.events[0].args.loan;
        let borrowTx = await pool.borrow(loanAddr, loanAmount);
        await borrowTx.wait();

        expect(parseBN(await pool.loans(tokenId))).to.equal(parseBN(loanAmount));
    });

    it("allowing to repay", async () => {
        const [owner, addr1] = await ethers.getSigners();
        const loanAmount = ethers.utils.parseEther("10");
        const repayAmount = ethers.utils.parseEther("1");
        const amountToDeposit = ethers.utils.parseEther("200");

        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);
        let ntfFactory = await ethers.getContractAt("Asset", asset);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amountToDeposit);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amountToDeposit);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amountToDeposit);

        // Transfer NFT to the Pool contract
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        // create loan
        let tx = await factory.createLoan(asset, tokenId, poolAddr);
        let waitTx = await tx.wait();
        expect(await factory.loans(owner.address, 0)).to.equal(waitTx.events[0].args.loan);

        // Borrow loan
        let loanAddr = waitTx.events[0].args.loan;
        let borrowTx = await pool.borrow(loanAddr, loanAmount);
        await borrowTx.wait();
        expect(parseBN(await pool.loans(tokenId))).to.equal(parseBN(loanAmount));


        // Approve Pool contract to use your tokens
        let txRepayAprove = await stableCoinContract.connect(owner).approve(poolAddr, repayAmount);
        await txRepayAprove.wait();

        let currentLoanAmount = await pool.loans(tokenId);
        // repay
        let repayTx = await pool.repay(loanAddr, repayAmount);
        await repayTx.wait();

        expect(parseBN(await pool.loans(tokenId))).to.equal(parseBN(currentLoanAmount.sub(repayAmount)));
    });

    it("allowing to repay full", async () => {
        const [owner, addr1] = await ethers.getSigners();
        const loanAmount = ethers.utils.parseEther("10");
        const amountToDeposit = ethers.utils.parseEther("200");

        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);
        let ntfFactory = await ethers.getContractAt("Asset", asset);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amountToDeposit);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amountToDeposit);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amountToDeposit);

        // Transfer NFT to the Pool contract
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        // create loan
        let tx = await factory.createLoan(asset, tokenId, poolAddr);
        let waitTx = await tx.wait();
        expect(await factory.loans(owner.address, 0)).to.equal(waitTx.events[0].args.loan);

        // Borrow loan
        let loanAddr = waitTx.events[0].args.loan;
        let borrowTx = await pool.borrow(loanAddr, loanAmount);
        await borrowTx.wait();
        expect(parseBN(await pool.loans(tokenId))).to.equal(parseBN(loanAmount));

        // Approve Pool contract to use your tokens
        let txRepayAprove = await stableCoinContract.connect(owner).approve(poolAddr, loanAmount);
        await txRepayAprove.wait();

        // repay
        let repayTx = await pool.repay(loanAddr, loanAmount);
        await repayTx.wait();

        expect(parseBN(await pool.loans(tokenId))).to.equal(0);
    });

    it("allowing to unlock if no borrow", async () => {
        const [owner, addr1] = await ethers.getSigners();
        const loanAmount = ethers.utils.parseEther("10");
        const amountToDeposit = ethers.utils.parseEther("200");

        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);
        let ntfFactory = await ethers.getContractAt("Asset", asset);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amountToDeposit);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amountToDeposit);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amountToDeposit);

        // Transfer NFT to the Pool contract
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        // create loan
        let tx = await factory.createLoan(asset, tokenId, poolAddr);
        let waitTx = await tx.wait();
        expect(await factory.loans(owner.address, 0)).to.equal(waitTx.events[0].args.loan);

        // Unlock asset
        let unlockTx = await pool.unlockAsset(waitTx.events[0].args.loan);
        await unlockTx.wait();

        expect(await ntfFactory.ownerOf(tokenId)).to.equal(owner.address);
    });

    it("allowing to unlock after Repay full", async () => {
        const [owner, addr1] = await ethers.getSigners();
        const loanAmount = ethers.utils.parseEther("10");
        const amountToDeposit = ethers.utils.parseEther("200");

        let pool = await ethers.getContractAt("Pool", poolAddr);
        let stableCoinContract = await ethers.getContractAt("FakeToken", stableCoin);
        let ntfFactory = await ethers.getContractAt("Asset", asset);

        // Mint some tokens
        let mintTx = await stableCoinContract.mint(addr1.address, amountToDeposit);
        await mintTx.wait();

        // Approve Pool contract to use your tokens
        let txAprove = await stableCoinContract.connect(addr1).approve(poolAddr, amountToDeposit);
        await txAprove.wait();

        // Deposit in the pool
        await depositInPool(pool, addr1, amountToDeposit);

        // Transfer NFT to the Pool contract
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        // create loan
        let tx = await factory.createLoan(asset, tokenId, poolAddr);
        let waitTx = await tx.wait();
        expect(await factory.loans(owner.address, 0)).to.equal(waitTx.events[0].args.loan);

        // Borrow loan
        let loanAddr = waitTx.events[0].args.loan;
        let borrowTx = await pool.borrow(loanAddr, loanAmount);
        await borrowTx.wait();
        expect(parseBN(await pool.loans(tokenId))).to.equal(parseBN(loanAmount));

        // Approve Pool contract to use your tokens
        let txRepayAprove = await stableCoinContract.connect(owner).approve(poolAddr, loanAmount);
        await txRepayAprove.wait();

        // repay
        let repayTx = await pool.repay(loanAddr, loanAmount);
        await repayTx.wait();

        expect(parseBN(await pool.loans(tokenId))).to.equal(0);


        // Unlock asset
        let unlockTx = await pool.unlockAsset(waitTx.events[0].args.loan);
        await unlockTx.wait();

        expect(await ntfFactory.ownerOf(tokenId)).to.equal(owner.address);
    });
});