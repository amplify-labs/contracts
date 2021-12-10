const { expect } = require("chai");
const { ethers } = require("hardhat");
const { call, send, connect, vmError, zeroAddress, uuidv4, wrongOwner } = require("./utils");

const { deployAsset, deployNFT } = require("./_asset");

const day = 24 * 60 * 60;
const timestamp = Math.floor(Date.now() / 1000);
const maturity = timestamp + day * 40;


describe("Asset", function () {
    let factory, root, signer1;

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        root = signers[0];
        signer1 = signers[1];

        factory = await deployAsset();
    });

    describe("constructor", function () {
        it("succeeds setting owner through constructor", async () => {
            expect(await call(factory, "owner")).to.equal(root.address);
        })
    });

    describe("tokenizeAsset", async () => {
        const tokenHash = uuidv4();
        const tokenValue = ethers.utils.parseEther("1000");

        it("should create new Token", async () => {
            let { events } = await send(factory, "tokenizeAsset", [tokenHash, "A", tokenValue, maturity, tokenHash + ".png"]);

            expect(events[1].args.tokenId.toString()).to.equal("1");
            expect(events[1].args.tokenHash).to.equal(tokenHash);
            expect(events[1].args.tokenRating).to.equal("A");
            expect(events[1].args.value.toString()).to.equal(tokenValue.toString());
            expect(events[1].args.maturity.toString()).to.equal(maturity.toString());
            expect(events[1].args.tokenURI).to.equal(tokenHash + ".png");


            expect((await call(factory, "totalSupply", [])).toString()).to.equal("1");
        });
    });

    describe("markAsRedeemed", async () => {
        let tokenId;
        const tokenHash = uuidv4();
        const tokenValue = ethers.utils.parseEther("1000");

        beforeEach(async () => {
            tokenId = await deployNFT(factory, tokenHash, "A", tokenValue, maturity);
        });

        it("should fails because of wrong owner", async () => {
            let connectedAsset = await connect(factory, signer1);
            expect(await send(connectedAsset, "markAsRedeemed", [tokenId])).to.equal(vmError("Only the owner can consume the asset"));
        });

        it("should mark token as redeemed", async () => {
            await send(factory, "markAsRedeemed", [tokenId]);

            let tokenInfo = await call(factory, "getTokenInfo", [tokenId]);
            expect(tokenInfo[7]).to.equal(true);
        });
    });


    describe("getTokenInfo", async () => {
        it("should return correct values", async () => {
            const tokenHash = uuidv4();
            const tokenValue = ethers.utils.parseEther("1000");

            let tokenId = await deployNFT(factory, tokenHash, "A", tokenValue, maturity);

            let tokenInfo = await call(factory, "getTokenInfo", [tokenId]);
            let tokenUri = await call(factory, "tokenURI", [tokenId]);

            expect(tokenInfo[0].toString()).to.equal(tokenValue.toString());
            expect(tokenInfo[1].toString()).to.equal(maturity.toString());
            expect(tokenInfo[2].toString()).to.equal("10");
            expect(tokenInfo[3].toString()).to.equal("90");
            expect(tokenInfo[4]).to.equal("A");
            expect(tokenInfo[5]).to.equal(tokenHash);
            expect(tokenInfo[6]).to.equal(root.address);
            expect(tokenInfo[7]).to.equal(false);

            expect(tokenUri).to.equal(tokenHash + ".png");
        });
    });

    describe("addRiskItem", async () => {
        it("should fails because of wrong owner", async () => {
            let connectedAsset = await connect(factory, signer1);
            expect(await send(connectedAsset, "addRiskItem", ["A", 10, 90])).to.equal(wrongOwner);
        });
        it("should adds new risk item", async () => {
            await send(factory, "addRiskItem", ["C", 10, 90]);

            let risk = await call(factory, "getRiskItem", ["C"]);

            expect(risk[0].toString()).to.equal("10");
            expect(risk[1].toString()).to.equal("90");
        });
    });

    describe("updateRiskItem", async () => {
        it("should fails because of wrong owner", async () => {
            let connectedAsset = await connect(factory, signer1);
            expect(await send(connectedAsset, "updateRiskItem", ["A", 10, 90])).to.equal(wrongOwner);
        });
        it("should updates risk item", async () => {
            await send(factory, "updateRiskItem", ["A", 11, 60]);

            let risk = await call(factory, "getRiskItem", ["A"]);

            expect(risk[0].toString()).to.equal("11");
            expect(risk[1].toString()).to.equal("60");
        });
    });

    describe("removeRiskItem", async () => {
        it("should fails because of wrong owner", async () => {
            let connectedAsset = await connect(factory, signer1);
            expect(await send(connectedAsset, "removeRiskItem", ["A"])).to.equal(wrongOwner);
        });
        it("should adds new risk item", async () => {
            await send(factory, "removeRiskItem", ["A"]);

            let risk = await call(factory, "getRiskItem", ["A"]);

            expect(risk[0].toString()).to.equal("0");
            expect(risk[1].toString()).to.equal("0");
        });
    });
});