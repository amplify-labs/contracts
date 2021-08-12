const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployFakeToken } = require("./FakeErc20");

function parseBN(bn) {
    return parseInt(bn, 10);
}

describe('FakeToken', () => {
    it("should have a fake token", async () => {
        let stableCoin = await deployFakeToken("MATIC", "MATIC");
        expect(stableCoin).to.be.not.null;
    });
});

describe("Factory stablecoin", () => {
    let factory, stableCoin;

    beforeEach(async () => {
        factory = await deployFactory();
    })

    it("creates new stableCoin", async () => {
        stableCoin = await createStableCoin(factory);
        expect(await factory.supportedStableCoins(stableCoin)).to.equal(true);
    });

    it("removes the stableCoin", async () => {
        stableCoin = await createStableCoin(factory);

        let removeTx = await factory.removeStableCoin(stableCoin);
        // wait until the transaction is mined
        await removeTx.wait();
        expect(await factory.supportedStableCoins(stableCoin)).to.equal(false);
    });
});

describe("Factory pool", async () => {
    let factory, stableCoin;
    const minDeposit = ethers.utils.parseEther("0.1");

    beforeEach(async () => {
        factory = await deployFactory();
        stableCoin = await createStableCoin(factory)
    });

    it("creates new Pool", async () => {
        const [owner] = await ethers.getSigners();

        let poolAddr = await createPool(factory, stableCoin, minDeposit);
        expect(await factory.pools(owner.address, 0)).to.equal(poolAddr);
    });
});

describe("Factory pool info", async () => {
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

describe("Factory pool deposit", async () => {
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

describe("Factory pool withdraw", async () => {
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

async function deployFactory() {
    const Contract = await ethers.getContractFactory("Factory");
    const factoryI = await Contract.deploy();
    factory = await factoryI.deployed();
    return factory;
}

async function createStableCoin(factory) {
    let stableCoin = await deployFakeToken("MATIC", "MATIC");

    let addTx = await factory.addStableCoin(stableCoin);
    // wait until the transaction is mined
    await addTx.wait();
    return stableCoin;
}


async function createPool(factory, stableCoin, minDeposit) {
    let poolTx = await factory.createPool(
        'MATIC-1',
        'discounting',
        stableCoin,
        minDeposit);

    // wait until the transaction is mined
    let txWait = await poolTx.wait();

    return txWait.events[3].args.pool;
}

async function depositInPool(pool, addr1, amount) {
    let depositTx = await pool.connect(addr1).deposit(amount);

    // wait until the transaction is mined
    await depositTx.wait();
}