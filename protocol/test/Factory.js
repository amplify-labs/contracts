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