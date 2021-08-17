const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    deployFactory,
    deployCollectible,
    createStableCoin,
    deployFakeToken,
    createPool,
    createNFT,
    parseBN,
    depositInPool
} = require("./utils");

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

describe("Factory create pool", async () => {
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

describe("Factory create loan", async () => {
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

    it("creates new Loan", async () => {
        const [owner, addr1] = await ethers.getSigners();
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

        // Transfer NFT in the Pool contract
        await ntfFactory.transferFrom(owner.address, poolAddr, tokenId);

        let tx = await factory.createLoan(asset, tokenId, poolAddr);
        let waitTx = await tx.wait();
        expect(await factory.loans(owner.address, 0)).to.equal(waitTx.events[0].args.loan);

        // Except for NFT to be on the pool's balance
        expect(await ntfFactory.ownerOf(tokenId)).to.equal(poolAddr);
    });
});